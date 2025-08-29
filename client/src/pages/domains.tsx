import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/top-bar";
import AddDomainModal from "@/components/modals/add-domain-modal";
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

export default function Domains() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["/api/domains"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/domains/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/domains/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "Domain marked as completed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark domain as completed",
        variant: "destructive",
      });
    },
  });

  const filteredDomains = domains.filter((domain: any) =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.registrar?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Domains" description="Loading..." showAddButton={false} />
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
        title="Domains" 
        description="Manage your domain registrations and renewals"
        onAddClick={() => setShowAddModal(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Domains ({filteredDomains.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search domains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-domains"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDomains.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Registrar</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Until Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto Renewal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDomains.map((domain: any) => {
                    const daysUntilExpiry = getDaysUntilExpiry(new Date(domain.expiryDate));
                    const status = getExpiryStatus(new Date(domain.expiryDate));
                    
                    return (
                      <TableRow key={domain.id} data-testid={`domain-row-${domain.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{domain.name}</p>
                            {domain.notes && (
                              <p className="text-sm text-muted-foreground">{domain.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{domain.registrar?.name || "N/A"}</TableCell>
                        <TableCell>{formatDate(new Date(domain.expiryDate))}</TableCell>
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
                          <Badge variant={domain.autoRenewal ? "default" : "secondary"}>
                            {domain.autoRenewal ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`domain-actions-${domain.id}`}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => completeMutation.mutate(domain.id)}
                                disabled={completeMutation.isPending || domain.isCompleted}
                                data-testid={`complete-domain-${domain.id}`}
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem data-testid={`edit-domain-${domain.id}`}>
                                <Edit size={16} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(domain.id)}
                                disabled={deleteMutation.isPending}
                                className="text-destructive"
                                data-testid={`delete-domain-${domain.id}`}
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
                  {searchTerm ? "No domains found matching your search." : "No domains found."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddModal(true)} data-testid="add-first-domain">
                    Add Your First Domain
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddDomainModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
