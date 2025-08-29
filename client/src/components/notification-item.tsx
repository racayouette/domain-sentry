import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  id: string;
  type: string;
  itemId: string;
  itemName: string;
  notificationType: string;
  expiryDate: Date;
  createdAt: Date;
  isRead: boolean;
}

export default function NotificationItem({ 
  id, 
  type, 
  itemId, 
  itemName, 
  notificationType, 
  expiryDate, 
  createdAt,
  isRead 
}: NotificationItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    },
  });

  const markAsCompletedMutation = useMutation({
    mutationFn: () => {
      const endpoint = type === "domain" ? "domains" : "ssl-certificates";
      return apiRequest("POST", `/api/${endpoint}/${itemId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ssl-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: `${type === "domain" ? "Domain" : "SSL Certificate"} marked as completed`,
      });
    },
  });

  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const getPriorityColor = () => {
    if (daysUntilExpiry <= 1) return "bg-red-500";
    if (daysUntilExpiry <= 7) return "bg-orange-500";
    if (daysUntilExpiry <= 14) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getNotificationText = () => {
    const itemType = type === "domain" ? "domain" : "SSL certificate";
    return `${itemName} ${itemType} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
  };

  return (
    <div 
      className={`p-4 hover:bg-muted/50 transition-colors ${!isRead ? 'bg-muted/20' : ''}`}
      data-testid={`notification-${id}`}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-2 h-2 ${getPriorityColor()} rounded-full mt-2 ${!isRead ? 'animate-pulse' : ''}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground" data-testid={`notification-text-${id}`}>
              {getNotificationText()}
            </p>
            <span className="text-xs text-muted-foreground" data-testid={`notification-time-${id}`}>
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {type === "domain" ? "Domain" : "SSL Certificate"} • 
            Auto-renewal: {notificationType === "30_days" ? "Enabled" : "Disabled"}
          </p>
          <div className="flex space-x-2 mt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => markAsCompletedMutation.mutate()}
              disabled={markAsCompletedMutation.isPending}
              data-testid={`mark-complete-${id}`}
            >
              Mark Complete
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => markAsReadMutation.mutate()}
              disabled={markAsReadMutation.isPending || isRead}
              data-testid={`mark-read-${id}`}
            >
              {isRead ? "Read" : "Mark Read"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
