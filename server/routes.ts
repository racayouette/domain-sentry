import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { 
  insertRegistrarSchema, 
  insertDomainSchema, 
  insertSslCertificateSchema,
  insertNotificationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  setupAuth(app);
  // Registrar routes (protected)
  app.get("/api/registrars", requireAuth, async (req, res) => {
    try {
      const registrars = await storage.getRegistrars();
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrars" });
    }
  });

  app.get("/api/registrars/:id", requireAuth, async (req, res) => {
    try {
      const registrar = await storage.getRegistrar(req.params.id);
      if (!registrar) {
        return res.status(404).json({ message: "Registrar not found" });
      }
      res.json(registrar);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrar" });
    }
  });

  app.post("/api/registrars", requireAuth, async (req, res) => {
    try {
      const data = insertRegistrarSchema.parse(req.body);
      const registrar = await storage.createRegistrar(data);
      res.status(201).json(registrar);
    } catch (error) {
      res.status(400).json({ message: "Invalid registrar data" });
    }
  });

  app.patch("/api/registrars/:id", requireAuth, async (req, res) => {
    try {
      const data = insertRegistrarSchema.partial().parse(req.body);
      const registrar = await storage.updateRegistrar(req.params.id, data);
      res.json(registrar);
    } catch (error) {
      res.status(400).json({ message: "Invalid registrar data" });
    }
  });

  app.delete("/api/registrars/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteRegistrar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete registrar" });
    }
  });

  // Domain routes (protected)
  app.get("/api/domains", requireAuth, async (req, res) => {
    try {
      const domains = await storage.getDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  app.get("/api/domains/:id", requireAuth, async (req, res) => {
    try {
      const domain = await storage.getDomain(req.params.id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch domain" });
    }
  });

  app.post("/api/domains", requireAuth, async (req, res) => {
    try {
      const data = insertDomainSchema.parse(req.body);
      const domain = await storage.createDomain(data);
      res.status(201).json(domain);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain data" });
    }
  });

  app.patch("/api/domains/:id", requireAuth, async (req, res) => {
    try {
      const data = insertDomainSchema.partial().parse(req.body);
      const domain = await storage.updateDomain(req.params.id, data);
      res.json(domain);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain data" });
    }
  });

  app.post("/api/domains/:id/complete", requireAuth, async (req, res) => {
    try {
      const domain = await storage.markDomainCompleted(req.params.id);
      res.json(domain);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark domain as completed" });
    }
  });

  app.delete("/api/domains/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteDomain(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });

  // SSL Certificate routes (protected)
  app.get("/api/ssl-certificates", requireAuth, async (req, res) => {
    try {
      const sslCertificates = await storage.getSslCertificates();
      res.json(sslCertificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SSL certificates" });
    }
  });

  app.get("/api/ssl-certificates/:id", requireAuth, async (req, res) => {
    try {
      const sslCertificate = await storage.getSslCertificate(req.params.id);
      if (!sslCertificate) {
        return res.status(404).json({ message: "SSL certificate not found" });
      }
      res.json(sslCertificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SSL certificate" });
    }
  });

  app.post("/api/ssl-certificates", requireAuth, async (req, res) => {
    try {
      const data = insertSslCertificateSchema.parse(req.body);
      const sslCertificate = await storage.createSslCertificate(data);
      res.status(201).json(sslCertificate);
    } catch (error) {
      res.status(400).json({ message: "Invalid SSL certificate data" });
    }
  });

  app.patch("/api/ssl-certificates/:id", requireAuth, async (req, res) => {
    try {
      const data = insertSslCertificateSchema.partial().parse(req.body);
      const sslCertificate = await storage.updateSslCertificate(req.params.id, data);
      res.json(sslCertificate);
    } catch (error) {
      res.status(400).json({ message: "Invalid SSL certificate data" });
    }
  });

  app.post("/api/ssl-certificates/:id/complete", requireAuth, async (req, res) => {
    try {
      const sslCertificate = await storage.markSslCertificateCompleted(req.params.id);
      res.json(sslCertificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark SSL certificate as completed" });
    }
  });

  app.delete("/api/ssl-certificates/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSslCertificate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete SSL certificate" });
    }
  });

  // Notification routes (protected)
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications", requireAuth, async (req, res) => {
    try {
      const data = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(data);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Dashboard stats (protected)
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Export routes (protected)
  app.get("/api/export/domains", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const domains = await storage.getDomainsExpiringBetween(start, end);
      
      // Create CSV
      const csvHeader = "Domain Name,Registrar,Expiry Date,Days Until Expiry,Auto Renewal,Notes\n";
      const csvRows = domains.map(domain => {
        const daysUntilExpiry = Math.ceil((domain.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `"${domain.name}","${domain.registrar.name}","${domain.expiryDate.toISOString().split('T')[0]}","${daysUntilExpiry}","${domain.autoRenewal ? 'Yes' : 'No'}","${domain.notes || ''}"`;
      }).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="domains_export.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export domains" });
    }
  });

  app.get("/api/export/ssl-certificates", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const sslCertificates = await storage.getSslCertificatesExpiringBetween(start, end);
      
      // Create CSV
      const csvHeader = "Domain,Issuer,Expiry Date,Days Until Expiry,Auto Renewal,Notes\n";
      const csvRows = sslCertificates.map(cert => {
        const daysUntilExpiry = Math.ceil((cert.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `"${cert.domain}","${cert.issuer}","${cert.expiryDate.toISOString().split('T')[0]}","${daysUntilExpiry}","${cert.autoRenewal ? 'Yes' : 'No'}","${cert.notes || ''}"`;
      }).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ssl_certificates_export.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export SSL certificates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
