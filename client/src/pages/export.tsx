import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar } from "lucide-react";
import { formatDateForInput } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";

export default function Export() {
  const [exportType, setExportType] = useState<"domains" | "ssl" | "both">("domains");
  const [dateRange, setDateRange] = useState<"30" | "60" | "90" | "custom">("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const getDateRangeValues = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case "30":
        end.setDate(today.getDate() + 30);
        break;
      case "60":
        end.setDate(today.getDate() + 60);
        break;
      case "90":
        end.setDate(today.getDate() + 90);
        break;
      case "custom":
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        }
        break;
    }

    return { start, end };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const { start, end } = getDateRangeValues();
      
      if (dateRange === "custom" && (!startDate || !endDate)) {
        toast({
          title: "Error",
          description: "Please select both start and end dates for custom range",
          variant: "destructive",
        });
        return;
      }

      const startDateStr = formatDateForInput(start);
      const endDateStr = formatDateForInput(end);

      if (exportType === "domains" || exportType === "both") {
        const response = await fetch(
          `/api/export/domains?startDate=${startDateStr}&endDate=${endDateStr}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to export domains");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `domains_export_${startDateStr}_to_${endDateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      if (exportType === "ssl" || exportType === "both") {
        const response = await fetch(
          `/api/export/ssl-certificates?startDate=${startDateStr}&endDate=${endDateStr}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to export SSL certificates");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ssl_certificates_export_${startDateStr}_to_${endDateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Success",
        description: "Export completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar 
        title="Export" 
        description="Export your domain and SSL certificate data"
        showAddButton={false}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Export Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="text-primary mr-2" size={20} />
                Export Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="export-type">Export Type</Label>
                <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                  <SelectTrigger data-testid="export-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domains">Domains Only</SelectItem>
                    <SelectItem value="ssl">SSL Certificates Only</SelectItem>
                    <SelectItem value="both">Both Domains & SSL Certificates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
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

              {dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      data-testid="start-date-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      data-testid="end-date-input"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center space-x-2"
                data-testid="export-button"
              >
                <Download size={16} />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Export Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Total Domains</h4>
                    <p className="text-2xl font-bold text-primary">{stats?.totalDomains || 0}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Total SSL Certificates</h4>
                    <p className="text-2xl font-bold text-primary">{stats?.totalSslCertificates || 0}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Export Details</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Export format: CSV (Comma Separated Values)</li>
                    <li>• Includes: {exportType === "domains" ? "Domain information" : exportType === "ssl" ? "SSL certificate information" : "Both domains and SSL certificates"}</li>
                    <li>• Date range: {dateRange === "custom" ? (startDate && endDate ? `${startDate} to ${endDate}` : "Please select dates") : `Next ${dateRange} days`}</li>
                    <li>• File will be downloaded automatically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
