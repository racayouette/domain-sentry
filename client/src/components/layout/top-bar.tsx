import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface TopBarProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export default function TopBar({ title, description, onAddClick, showAddButton = true }: TopBarProps) {
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  return (
    <header className="bg-card border-b border-border p-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">{title}</h2>
        <p className="text-muted-foreground" data-testid="page-description">{description}</p>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="notifications-button"
        >
          <Bell size={20} />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </Button>
        {showAddButton && onAddClick && (
          <Button
            onClick={onAddClick}
            className="flex items-center space-x-2"
            data-testid="add-button"
          >
            <Plus size={16} />
            <span>Add New</span>
          </Button>
        )}
      </div>
    </header>
  );
}
