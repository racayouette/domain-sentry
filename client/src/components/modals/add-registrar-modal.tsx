import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertRegistrarSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";

interface AddRegistrarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddRegistrarModal({ open, onOpenChange }: AddRegistrarModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertRegistrarSchema),
    defaultValues: {
      name: "",
      loginUrl: "",
      loginUsername: "",
      loginPassword: "",
      twoFactorMobile: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/registrars", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrars"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Registrar added successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add registrar",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Registrar</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registrar Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="GoDaddy, Namecheap, etc." 
                      {...field} 
                      data-testid="registrar-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loginUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://account.registrar.com" 
                      {...field} 
                      data-testid="registrar-login-url-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loginUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your-username" 
                        {...field} 
                        data-testid="registrar-username-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loginPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="your-password" 
                          {...field} 
                          className="pr-10"
                          data-testid="registrar-password-input"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-registrar-password"
                        >
                          {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="twoFactorMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2FA Mobile Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="+1 (555) 123-4567" 
                      {...field} 
                      data-testid="registrar-2fa-mobile-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this registrar..."
                      {...field} 
                      data-testid="registrar-notes-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="registrar-cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="registrar-submit-button"
              >
                {createMutation.isPending ? "Adding..." : "Add Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
