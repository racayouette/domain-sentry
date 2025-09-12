import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/top-bar";
import NotificationItem from "@/components/notification-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n: any) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n: any) => 
          apiRequest("PATCH", `/api/notifications/${n.id}/read`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        notifications.map((n: any) => 
          apiRequest("DELETE", `/api/notifications/${n.id}`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Notifications" description="Loading..." showAddButton={false} />
        <div className="flex-1 p-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar 
        title="Notifications" 
        description="Manage your domain and SSL certificate expiration alerts"
        showAddButton={false}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle>All Notifications ({notifications.length})</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive" data-testid="unread-count">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    data-testid="mark-all-read"
                  >
                    <CheckCheck size={16} className="mr-2" />
                    Mark All Read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    data-testid="clear-all"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    id={notification.id}
                    type={notification.type}
                    itemId={notification.itemId}
                    itemName={notification.itemName}
                    notificationType={notification.notificationType}
                    expiryDate={new Date(notification.expiryDate)}
                    createdAt={new Date(notification.createdAt)}
                    isRead={notification.isRead}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No notifications found.
                </p>
                <p className="text-sm text-muted-foreground">
                  Notifications will appear here when domains or SSL certificates are approaching expiration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
