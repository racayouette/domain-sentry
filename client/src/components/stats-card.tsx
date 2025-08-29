import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon: Icon, 
  iconBgColor, 
  iconColor 
}: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border" data-testid={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground" data-testid={`stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={iconColor} size={20} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span 
            className={`text-sm font-medium ${
              changeType === "positive" ? "text-green-600" : 
              changeType === "negative" ? "text-red-600" : 
              "text-muted-foreground"
            }`}
          >
            {change}
          </span>
          {changeType !== "neutral" && (
            <span className="text-muted-foreground text-sm ml-2">from last month</span>
          )}
        </div>
      )}
    </div>
  );
}
