import { Link, useLocation } from "wouter";
import { Globe, Shield, Building, Bell, Download, Settings, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/domains", label: "Domains", icon: Globe },
  { href: "/ssl-certificates", label: "SSL Certificates", icon: Shield },
  { href: "/registrars", label: "Registrars", icon: Building },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/export", label: "Export", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
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
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-secondary-foreground text-sm font-medium">JA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Admin</p>
            <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
