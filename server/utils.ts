import nodemailer from "nodemailer";
import { storage } from "./storage";
import { Domain, SslCertificate } from "@shared/schema";
import "dotenv/config";


export async function sendNotification(message: string) {
  if(!process.env.EMAIL || !process.env.EMAIL_PASS) {
    throw new Error("Email not configured, skipping notification...");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: "ajaypathak2527@gmail.com",
    subject: "Domain/SSL Expiry Reminder",
    text: message
  });

  console.log("Email Notification sent:", message);
}


const notificationTypes: Record<number, string> = {
  365: "1_year",
  180: "6_months",
  30: "30_days",
  7: "7_days",
  1: "1_day",
};

type Item = {
  id: string;
  name: string;
  expiryDate: string | Date;
  domain?: string
};

export async function processExpiries<T extends Domain | SslCertificate>(
  items: T[],
  type: "domain" | "ssl",
  label: "Domain" | "SSL certificate"
) {
  const today = new Date();
  await Promise.all(
    items.map(async (item) => {
      const itemName = type === "domain" ? (item as Domain).name : (item as SslCertificate).domain;
      for (const days of Object.keys(notificationTypes).map(Number)) {
        const notifyDate = new Date(item.expiryDate);
        notifyDate.setDate(notifyDate.getDate() - days);

        if (notifyDate.toDateString() === today.toDateString()) {
          const notificationType = notificationTypes[days];

          await storage.createNotification({
            type, // "domain" or "ssl"
            itemId: item.id,
            itemName,
            notificationType,
            expiryDate: new Date(item.expiryDate),
            isRead: false,
          });

          sendNotification(
            `Reminder: ${label} "${itemName}" will expire in ${days} day${days > 1 ? "s" : ""}.`
          );
        } else {
          console.log("No notifications sent for", itemName);
        }
      }
    })
  );
}
