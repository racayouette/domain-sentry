import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/top-bar";
import AddRegistrarModal from "@/components/modals/add-registrar-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MoreHorizontal, Search, Edit, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Registrars() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRegistrar, setEditingRegistrar] = useState<any>(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEditRegistrar = (registrar: any) => {
    setEditingRegistrar(registrar);
    setShowAddModal(true);
  };

  const { data: registrars = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/registrars"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/registrars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrars"] });
      toast({
        title: "Success",
        description: "Registrar deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete registrar",
        variant: "destructive",
      });
    },
  });

  const filteredRegistrars = registrars.filter((registrar) =>
    registrar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = (id: string) => {
    const newVisiblePasswords = new Set(visiblePasswords);
    if (newVisiblePasswords.has(id)) {
      newVisiblePasswords.delete(id);
    } else {
      newVisiblePasswords.add(id);
    }
    setVisiblePasswords(newVisiblePasswords);
  };

  const maskPassword = (password: string) => {
    return "*".repeat(Math.min(password.length, 8));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Registrars" description="Loading..." showAddButton={false} />
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
        title="Registrars" 
        description="Manage your domain registrar accounts and credentials"
        onAddClick={() => setShowAddModal(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Registrars ({filteredRegistrars.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search registrars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-registrars"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRegistrars.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Login URL</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>2FA Mobile</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrars.map((registrar: any) => (
                    <TableRow key={registrar.id} data-testid={`registrar-row-${registrar.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{registrar.name}</p>
                          {registrar.notes && (
                            <p className="text-sm text-muted-foreground">{registrar.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {registrar.loginUrl ? (
                          <a 
                            href={registrar.loginUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center space-x-1"
                            data-testid={`login-url-${registrar.id}`}
                          >
                            <span>Login</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {registrar.loginUsername || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {registrar.loginPassword ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {visiblePasswords.has(registrar.id) 
                                ? registrar.loginPassword 
                                : maskPassword(registrar.loginPassword)
                              }
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePasswordVisibility(registrar.id)}
                              className="h-6 w-6"
                              data-testid={`toggle-password-${registrar.id}`}
                            >
                              {visiblePasswords.has(registrar.id) ? (
                                <EyeOff size={12} />
                              ) : (
                                <Eye size={12} />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {registrar.twoFactorMobile || "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`registrar-actions-${registrar.id}`}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              data-testid={`edit-registrar-${registrar.id}`}
                              onClick={() => handleEditRegistrar(registrar)}
                              >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate(registrar.id)}
                              disabled={deleteMutation.isPending}
                              className="text-destructive"
                              data-testid={`delete-registrar-${registrar.id}`}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No registrars found matching your search." : "No registrars found."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddModal(true)} data-testid="add-first-registrar">
                    Add Your First Registrar
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddRegistrarModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingRegistrar(null); // Reset edit state when closed
        }}
        registrar={editingRegistrar} // <-- Pass registrar prop
      />
    </div>
  );
}
