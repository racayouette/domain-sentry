import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSslCertificateSchema } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateForInput } from "@/lib/date-utils";
import { useEffect } from "react";

interface AddSslModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: any; 
}

export default function AddSslModal({ open, onOpenChange, certificate }: AddSslModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertSslCertificateSchema.extend({
      expiryDate: insertSslCertificateSchema.shape.expiryDate.transform(date => 
        typeof date === 'string' ? new Date(date) : date
      ),
    })),
    defaultValues: {
      domain: "",
      issuer: "",
      expiryDate: new Date(),
      renewalPeriodYears: 1,
      autoRenewal: false,
      notes: "",
    },
    values: certificate
      ? {
          domain: certificate.domain || "",
          issuer: certificate.issuer || "",
          expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate) : new Date(),
          renewalPeriodYears: certificate.renewalPeriodYears || 1,
          autoRenewal: certificate.autoRenewal || false,
          notes: certificate.notes || "",
        }
      : undefined,
  });

    useEffect(() => {
    if (open) {
      form.reset(
        certificate
          ? {
              domain: certificate.domain || "",
              issuer: certificate.issuer || "",
              expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate) : new Date(),
              renewalPeriodYears: certificate.renewalPeriodYears || 1,
              autoRenewal: certificate.autoRenewal || false,
              notes: certificate.notes || "",
            }
          : {
              domain: "",
              issuer: "",
              expiryDate: new Date(),
              renewalPeriodYears: 1,
              autoRenewal: false,
              notes: "",
            }
      );
    }
  }, [certificate, open]);


  const createMutation = useMutation({
    mutationFn: (data: any) => 
        certificate
        ? apiRequest("PATCH", `/api/ssl-certificates/${certificate.id}`, data) // Edit
        : apiRequest("POST", "/api/ssl-certificates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: certificate ? "SSL certificate updated successfully" : "SSL certificate added successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: certificate ? "Failed to update SSL certificate" : "Failed to add SSL certificate",
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
          <DialogTitle>
            {certificate ? "Edit SSL Certificate" : "Add New SSL Certificate"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="example.com or *.example.com" 
                        {...field} 
                        data-testid="ssl-domain-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Issuer *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Let's Encrypt, DigiCert, etc." 
                        {...field} 
                        data-testid="ssl-issuer-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? formatDateForInput(new Date(field.value)) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="ssl-expiry-date-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="renewalPeriodYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renewal Period</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="ssl-renewal-period-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this SSL certificate..."
                      {...field} 
                      data-testid="ssl-notes-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoRenewal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-renewal notifications</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for upcoming renewals
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="ssl-auto-renewal-switch"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="ssl-cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="ssl-submit-button"
              >
                {createMutation.isPending
                  ? certificate
                    ? "Saving..."
                    : "Adding..."
                  : certificate
                    ? "Save Changes"
                    : "Add SSL Certificate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
