import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";

export function formatDate(date: Date): string {
  return format(date, "MMM dd, yyyy");
}

export function formatDateTime(date: Date): string {
  return format(date, "MMM dd, yyyy 'at' h:mm a");
}

export function formatDateForInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getDaysUntilExpiry(expiryDate: Date): number {
  return Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: Date): "critical" | "warning" | "active" {
  const days = getDaysUntilExpiry(expiryDate);
  
  if (days <= 7) return "critical";
  if (days <= 30) return "warning";
  return "active";
}

export function getExpiryStatusColor(status: "critical" | "warning" | "active"): string {
  switch (status) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-green-100 text-green-800";
  }
}

export function getExpiryStatusText(status: "critical" | "warning" | "active"): string {
  switch (status) {
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    case "active":
      return "Active";
  }
}

export function shouldShowNotification(expiryDate: Date, lastNotificationDate?: Date): boolean {
  const days = getDaysUntilExpiry(expiryDate);
  const notificationDays = [30, 14, 7, 1];
  
  // Check if we should send a notification for any of the milestone days
  for (const notificationDay of notificationDays) {
    if (days <= notificationDay) {
      // If no last notification or last notification was before this milestone
      if (!lastNotificationDate) return true;
      
      const milestoneDate = addDays(expiryDate, -notificationDay);
      return isAfter(new Date(), milestoneDate) && isBefore(lastNotificationDate, milestoneDate);
    }
  }
  
  return false;
}
