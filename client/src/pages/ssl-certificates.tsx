import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/top-bar";
import AddSslModal from "@/components/modals/add-ssl-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Edit, Trash2, CheckCircle } from "lucide-react";
import { formatDate, getDaysUntilExpiry, getExpiryStatus, getExpiryStatusColor, getExpiryStatusText } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SslCertificates() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sslCertificates = [], isLoading } = useQuery({
    queryKey: ["/api/ssl-certificates"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/ssl-certificates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "SSL certificate deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete SSL certificate",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/ssl-certificates/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "SSL certificate marked as completed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark SSL certificate as completed",
        variant: "destructive",
      });
    },
  });

  const filteredCertificates = sslCertificates.filter((cert: any) =>
    cert.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="SSL Certificates" description="Loading..." showAddButton={false} />
        <div className="flex-1 p-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
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
        title="SSL Certificates" 
        description="Manage your SSL certificates and renewals"
        onAddClick={() => setShowAddModal(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All SSL Certificates ({filteredCertificates.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-ssl-certificates"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCertificates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Until Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto Renewal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert: any) => {
                    const daysUntilExpiry = getDaysUntilExpiry(new Date(cert.expiryDate));
                    const status = getExpiryStatus(new Date(cert.expiryDate));
                    
                    return (
                      <TableRow key={cert.id} data-testid={`ssl-row-${cert.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.domain}</p>
                            {cert.notes && (
                              <p className="text-sm text-muted-foreground">{cert.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{cert.issuer}</TableCell>
                        <TableCell>{formatDate(new Date(cert.expiryDate))}</TableCell>
                        <TableCell>
                          <span className={daysUntilExpiry <= 7 ? "text-red-600 font-semibold" : ""}>
                            {daysUntilExpiry} days
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getExpiryStatusColor(status)}>
                            {getExpiryStatusText(status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cert.autoRenewal ? "default" : "secondary"}>
                            {cert.autoRenewal ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`ssl-actions-${cert.id}`}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => completeMutation.mutate(cert.id)}
                                disabled={completeMutation.isPending || cert.isCompleted}
                                data-testid={`complete-ssl-${cert.id}`}
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem data-testid={`edit-ssl-${cert.id}`}>
                                <Edit size={16} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(cert.id)}
                                disabled={deleteMutation.isPending}
                                className="text-destructive"
                                data-testid={`delete-ssl-${cert.id}`}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No SSL certificates found matching your search." : "No SSL certificates found."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddModal(true)} data-testid="add-first-ssl">
                    Add Your First SSL Certificate
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddSslModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
