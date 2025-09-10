import { 
  registrars, domains, sslCertificates, notifications, users,
  type Registrar, type InsertRegistrar,
  type Domain, type InsertDomain,
  type SslCertificate, type InsertSslCertificate,
  type Notification, type InsertNotification,
  type User, type InsertUser
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;

  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Registrar methods
  getRegistrars(): Promise<Registrar[]>;
  getRegistrar(id: string): Promise<Registrar | undefined>;
  createRegistrar(registrar: InsertRegistrar): Promise<Registrar>;
  updateRegistrar(id: string, registrar: Partial<InsertRegistrar>): Promise<Registrar>;
  deleteRegistrar(id: string): Promise<void>;

  // Domain methods
  getDomains(): Promise<(Domain & { registrar: Registrar })[]>;
  getDomain(id: string): Promise<(Domain & { registrar: Registrar }) | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: string, domain: Partial<InsertDomain>): Promise<Domain>;
  deleteDomain(id: string): Promise<void>;
  markDomainCompleted(id: string): Promise<Domain>;
  getDomainsExpiringBetween(startDate: Date, endDate: Date): Promise<(Domain & { registrar: Registrar })[]>;

  // SSL Certificate methods
  getSslCertificates(): Promise<SslCertificate[]>;
  getSslCertificate(id: string): Promise<SslCertificate | undefined>;
  createSslCertificate(sslCert: InsertSslCertificate): Promise<SslCertificate>;
  updateSslCertificate(id: string, sslCert: Partial<InsertSslCertificate>): Promise<SslCertificate>;
  deleteSslCertificate(id: string): Promise<void>;
  markSslCertificateCompleted(id: string): Promise<SslCertificate>;
  getSslCertificatesExpiringBetween(startDate: Date, endDate: Date): Promise<SslCertificate[]>;

  // Notification methods
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalDomains: number;
    totalSslCertificates: number;
    totalRegistrars: number;
    expiringSoon: number;
    unreadNotifications: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods (legacy)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Registrar methods
  async getRegistrars(): Promise<Registrar[]> {
    return await db.select().from(registrars).orderBy(asc(registrars.name));
  }

  async getRegistrar(id: string): Promise<Registrar | undefined> {
    const [registrar] = await db.select().from(registrars).where(eq(registrars.id, id));
    return registrar || undefined;
  }

  async createRegistrar(registrar: InsertRegistrar): Promise<Registrar> {
    const [newRegistrar] = await db.insert(registrars).values(registrar).returning();
    return newRegistrar;
  }

  async updateRegistrar(id: string, registrar: Partial<InsertRegistrar>): Promise<Registrar> {
    const [updatedRegistrar] = await db
      .update(registrars)
      .set(registrar)
      .where(eq(registrars.id, id))
      .returning();
    return updatedRegistrar;
  }

  async deleteRegistrar(id: string): Promise<void> {
    await db.delete(registrars).where(eq(registrars.id, id));
  }

  // Domain methods
  async getDomains(): Promise<(Domain & { registrar: Registrar })[]> {
    return await db.select().from(domains)
      .leftJoin(registrars, eq(domains.registrarId, registrars.id))
      .orderBy(desc(domains.createdAt))
      .then(rows => rows.map(row => ({
        ...row.domains,
        registrar: row.registrars!
      })));
  }

  async getDomain(id: string): Promise<(Domain & { registrar: Registrar }) | undefined> {
    const [result] = await db.select().from(domains)
      .leftJoin(registrars, eq(domains.registrarId, registrars.id))
      .where(eq(domains.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.domains,
      registrar: result.registrars!
    };
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db.insert(domains).values(domain).returning();
    return newDomain;
  }

  async updateDomain(id: string, domain: Partial<InsertDomain>): Promise<Domain> {
    const [updatedDomain] = await db
      .update(domains)
      .set(domain)
      .where(eq(domains.id, id))
      .returning();
    return updatedDomain;
  }

  async deleteDomain(id: string): Promise<void> {
    await db.delete(domains).where(eq(domains.id, id));
  }

  async markDomainCompleted(id: string): Promise<Domain> {
    const [updatedDomain] = await db
      .update(domains)
      .set({ 
        isCompleted: true, 
        completedAt: new Date(),
        nextNotificationDate: null
      })
      .where(eq(domains.id, id))
      .returning();
    return updatedDomain;
  }

  async getDomainsExpiringBetween(startDate: Date, endDate: Date): Promise<(Domain & { registrar: Registrar })[]> {
    return await db.select().from(domains)
      .leftJoin(registrars, eq(domains.registrarId, registrars.id))
      .where(and(
        gte(domains.expiryDate, startDate),
        lte(domains.expiryDate, endDate),
        eq(domains.isCompleted, false)
      ))
      .orderBy(asc(domains.expiryDate))
      .then(rows => rows.map(row => ({
        ...row.domains,
        registrar: row.registrars!
      })));
  }

  // SSL Certificate methods
  async getSslCertificates(): Promise<SslCertificate[]> {
    return await db.select().from(sslCertificates).orderBy(desc(sslCertificates.createdAt));
  }

  async getSslCertificate(id: string): Promise<SslCertificate | undefined> {
    const [sslCert] = await db.select().from(sslCertificates).where(eq(sslCertificates.id, id));
    return sslCert || undefined;
  }

  async createSslCertificate(sslCert: InsertSslCertificate): Promise<SslCertificate> {
    const [newSslCert] = await db.insert(sslCertificates).values(sslCert).returning();
    return newSslCert;
  }

  async updateSslCertificate(id: string, sslCert: Partial<InsertSslCertificate>): Promise<SslCertificate> {
    const [updatedSslCert] = await db
      .update(sslCertificates)
      .set(sslCert)
      .where(eq(sslCertificates.id, id))
      .returning();
    return updatedSslCert;
  }

  async deleteSslCertificate(id: string): Promise<void> {
    await db.delete(sslCertificates).where(eq(sslCertificates.id, id));
  }

  async markSslCertificateCompleted(id: string): Promise<SslCertificate> {
    const [updatedSslCert] = await db
      .update(sslCertificates)
      .set({ 
        isCompleted: true, 
        completedAt: new Date(),
        nextNotificationDate: null
      })
      .where(eq(sslCertificates.id, id))
      .returning();
    return updatedSslCert;
  }

  async getSslCertificatesExpiringBetween(startDate: Date, endDate: Date): Promise<SslCertificate[]> {
    return await db.select().from(sslCertificates)
      .where(and(
        gte(sslCertificates.expiryDate, startDate),
        lte(sslCertificates.expiryDate, endDate),
        eq(sslCertificates.isCompleted, false)
      ))
      .orderBy(asc(sslCertificates.expiryDate));
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.isRead, false))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalDomains: number;
    totalSslCertificates: number;
    totalRegistrars: number;
    expiringSoon: number;
    unreadNotifications: number;
  }> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      totalDomains,
      totalSslCertificates,
      totalRegistrars,
      expiringDomains,
      expiringSslCerts,
      unreadNotifications
    ] = await Promise.all([
      db.select().from(domains).then(rows => rows.length),
      db.select().from(sslCertificates).then(rows => rows.length),
      db.select().from(registrars).then(rows => rows.length),
      db.select().from(domains)
        .where(and(
          lte(domains.expiryDate, thirtyDaysFromNow),
          eq(domains.isCompleted, false)
        ))
        .then(rows => rows.length),
      db.select().from(sslCertificates)
        .where(and(
          lte(sslCertificates.expiryDate, thirtyDaysFromNow),
          eq(sslCertificates.isCompleted, false)
        ))
        .then(rows => rows.length),
      db.select().from(notifications)
        .where(eq(notifications.isRead, false))
        .then(rows => rows.length)
    ]);

    return {
      totalDomains,
      totalSslCertificates,
      totalRegistrars,
      expiringSoon: expiringDomains + expiringSslCerts,
      unreadNotifications
    };
  }
}

export const storage = new DatabaseStorage();
