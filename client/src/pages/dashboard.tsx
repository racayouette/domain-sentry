import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/top-bar";
import StatsCard from "@/components/stats-card";
import NotificationItem from "@/components/notification-item";
import { Globe, Shield, Building, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDaysUntilExpiry, getExpiryStatus, getExpiryStatusColor, getExpiryStatusText } from "@/lib/date-utils";
import { useState } from "react";
import AddDomainModal from "@/components/modals/add-domain-modal";
import AddSslModal from "@/components/modals/add-ssl-modal";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [showAddSslModal, setShowAddSslModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"domain" | "ssl">("domain");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: domains = [], isLoading: domainsLoading } = useQuery({
    queryKey: ["/api/domains"],
  });

  const { data: sslCertificates = [], isLoading: sslLoading } = useQuery({
    queryKey: ["/api/ssl-certificates"],
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  const recentDomains = domains.slice(0, 5);
  const recentSslCertificates = sslCertificates.slice(0, 5);
  const recentNotifications = notifications.slice(0, 3);

  const handleAddClick = () => {
    setAddModalType("domain");
    setShowAddDomainModal(true);
  };

  const handleExport = () => {
    // For now, just redirect to export page
    setLocation("/export");
  };

  if (statsLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Dashboard" description="Loading..." showAddButton={false} />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border border-border animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar 
        title="Dashboard" 
        description="Overview of your domains and SSL certificates"
        onAddClick={handleAddClick}
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Domains"
            value={stats?.totalDomains || 0}
            change="+12%"
            changeType="positive"
            icon={Globe}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="SSL Certificates"
            value={stats?.totalSslCertificates || 0}
            change="+8%"
            changeType="positive"
            icon={Shield}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatsCard
            title="Expiring Soon"
            value={stats?.expiringSoon || 0}
            change="Next 30 days"
            changeType="neutral"
            icon={AlertTriangle}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatsCard
            title="Registrars"
            value={stats?.totalRegistrars || 0}
            change="Active providers"
            changeType="neutral"
            icon={Building}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="text-orange-500 mr-2" size={20} />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notificationsLoading ? (
              <div className="p-4">Loading notifications...</div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-border">
                {recentNotifications.map((notification) => (
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
              <div className="p-4 text-center text-muted-foreground">
                No recent notifications
              </div>
            )}
            {recentNotifications.length > 0 && (
              <div className="p-4 border-t border-border bg-muted/30">
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setLocation("/notifications")}
                  data-testid="view-all-notifications"
                >
                  View all notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Domains */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Domains</CardTitle>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setLocation("/domains")}
                data-testid="view-all-domains"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {domainsLoading ? (
                <div className="p-4">Loading domains...</div>
              ) : recentDomains.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Domain</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expires</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentDomains.map((domain) => {
                        const daysUntilExpiry = getDaysUntilExpiry(new Date(domain.expiryDate));
                        const status = getExpiryStatus(new Date(domain.expiryDate));
                        
                        return (
                          <tr key={domain.id} className="hover:bg-muted/20 transition-colors" data-testid={`domain-row-${domain.id}`}>
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-foreground">{domain.name}</p>
                                <p className="text-sm text-muted-foreground">{domain.registrar?.name}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-foreground">{formatDate(new Date(domain.expiryDate))}</p>
                              <p className="text-xs text-muted-foreground">{daysUntilExpiry} days</p>
                            </td>
                            <td className="p-4">
                              <Badge className={getExpiryStatusColor(status)}>
                                {getExpiryStatusText(status)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No domains found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent SSL Certificates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent SSL Certificates</CardTitle>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setLocation("/ssl-certificates")}
                data-testid="view-all-ssl"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {sslLoading ? (
                <div className="p-4">Loading SSL certificates...</div>
              ) : recentSslCertificates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Certificate</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expires</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentSslCertificates.map((cert) => {
                        const daysUntilExpiry = getDaysUntilExpiry(new Date(cert.expiryDate));
                        const status = getExpiryStatus(new Date(cert.expiryDate));
                        
                        return (
                          <tr key={cert.id} className="hover:bg-muted/20 transition-colors" data-testid={`ssl-row-${cert.id}`}>
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-foreground">{cert.domain}</p>
                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-foreground">{formatDate(new Date(cert.expiryDate))}</p>
                              <p className="text-xs text-muted-foreground">{daysUntilExpiry} days</p>
                            </td>
                            <td className="p-4">
                              <Badge className={getExpiryStatusColor(status)}>
                                {getExpiryStatusText(status)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No SSL certificates found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="text-primary mr-2" size={20} />
              Quick Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Export Type</label>
                <Select defaultValue="domains">
                  <SelectTrigger data-testid="export-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domains">Domains Only</SelectItem>
                    <SelectItem value="ssl">SSL Certificates Only</SelectItem>
                    <SelectItem value="both">Both Domains & SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <Select defaultValue="30">
                  <SelectTrigger data-testid="date-range-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Next 30 days</SelectItem>
                    <SelectItem value="60">Next 60 days</SelectItem>
                    <SelectItem value="90">Next 90 days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center space-x-2"
                  data-testid="export-csv-button"
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <AddDomainModal
        open={showAddDomainModal}
        onOpenChange={setShowAddDomainModal}
      />
      
      <AddSslModal
        open={showAddSslModal}
        onOpenChange={setShowAddSslModal}
      />
    </div>
  );
}
