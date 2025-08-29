import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Domains from "@/pages/domains";
import SslCertificates from "@/pages/ssl-certificates";
import Registrars from "@/pages/registrars";
import Notifications from "@/pages/notifications";
import Export from "@/pages/export";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/domains" component={Domains} />
          <Route path="/ssl-certificates" component={SslCertificates} />
          <Route path="/registrars" component={Registrars} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/export" component={Export} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
