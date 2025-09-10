import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, Building, Lock, User, Mail } from "lucide-react";
import { z } from "zod";

const authSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLogin = (data: { username: string; password: string }) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: AuthFormData) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Left Column - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Globe className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Domain CRM</h1>
                <p className="text-blue-100">SSL & Domain Manager</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Manage Your Digital Assets
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Keep track of domain registrations, SSL certificates, and renewal dates all in one place.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Globe size={16} />
              </div>
              <div>
                <h3 className="font-semibold">Domain Tracking</h3>
                <p className="text-blue-100 text-sm">Monitor expiration dates and auto-renewal settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="font-semibold">SSL Management</h3>
                <p className="text-blue-100 text-sm">Keep your certificates up to date and secure</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Building size={16} />
              </div>
              <div>
                <h3 className="font-semibold">Registrar Integration</h3>
                <p className="text-blue-100 text-sm">Store credentials and login details securely</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Domain CRM</h1>
                <p className="text-xs text-muted-foreground">SSL & Domain Manager</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome</h2>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </div>

          <Card className="border-border shadow-lg">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="login-username"
                          placeholder="Enter your username"
                          className="pl-10"
                          data-testid="login-username"
                          {...loginForm.register("username")}
                        />
                      </div>
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          data-testid="login-password"
                          {...loginForm.register("password")}
                        />
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="login-submit"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="register-username"
                          placeholder="Choose a username"
                          className="pl-10"
                          data-testid="register-username"
                          {...registerForm.register("username")}
                        />
                      </div>
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                          data-testid="register-password"
                          {...registerForm.register("password")}
                        />
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          id="register-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                          data-testid="register-confirm-password"
                          {...registerForm.register("confirmPassword")}
                        />
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="register-submit"
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}