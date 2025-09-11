import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Domains from "@/pages/domains";
import SslCertificates from "@/pages/ssl-certificates";
import Registrars from "@/pages/registrars";
import Notifications from "@/pages/notifications";
import Export from "@/pages/export";
import AuthPage from "@/pages/auth-page";
import Sidebar from "@/components/layout/sidebar";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-hidden min-h-0">
        {children}
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => (
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      )} />
      <ProtectedRoute path="/domains" component={() => (
        <AuthenticatedLayout>
          <Domains />
        </AuthenticatedLayout>
      )} />
      <ProtectedRoute path="/ssl-certificates" component={() => (
        <AuthenticatedLayout>
          <SslCertificates />
        </AuthenticatedLayout>
      )} />
      <ProtectedRoute path="/registrars" component={() => (
        <AuthenticatedLayout>
          <Registrars />
        </AuthenticatedLayout>
      )} />
      <ProtectedRoute path="/notifications" component={() => (
        <AuthenticatedLayout>
          <Notifications />
        </AuthenticatedLayout>
      )} />
      <ProtectedRoute path="/export" component={() => (
        <AuthenticatedLayout>
          <Export />
        </AuthenticatedLayout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
