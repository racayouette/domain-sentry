import { Link, useLocation } from "wouter";
import { Globe, Shield, Building, Bell, Download, Settings, BarChart3, LogOut, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/domains", label: "Domains", icon: Globe },
  { href: "/ssl-certificates", label: "SSL Certificates", icon: Shield },
  { href: "/registrars", label: "Registrars", icon: Building },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/export", label: "Export", icon: Download },
  // { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const { data: unreadNotifications = [] } = useQuery<{ id: string }[]>({
    queryKey: ["/api/notifications/unread"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col min-h-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Domain CRM</h1>
            <p className="text-xs text-muted-foreground">SSL & Domain Manager</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          const showBadge = item.href === "/notifications" && unreadNotifications.length > 0;
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {showBadge && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center space-x-3 px-4 py-3 h-auto justify-start"
              data-testid="user-menu-trigger"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User size={16} className="text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">Domain Manager</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>{user?.username || "User"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
              data-testid="logout-button"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
