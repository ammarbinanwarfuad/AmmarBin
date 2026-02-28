"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track whether this page load came from a logout action.
  // We must not auto-redirect to dashboard in that case because the
  // SessionProvider client cache might still hold the old session for
  // a brief moment even though the cookie has already been cleared.
  const [isPostLogout, setIsPostLogout] = useState(false);
  const { data: session, status } = useSession();

  // Detect logout flag and clean the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === '1') {
      setIsPostLogout(true);
      window.history.replaceState({}, '', '/admin/login');
    }
  }, []);

  // Redirect if already authenticated — but only when session status is
  // definitively resolved (not 'loading') to avoid acting on stale cache.
  useEffect(() => {
    if (status === "authenticated" && session && !isSubmitting && !isPostLogout) {
      window.location.replace("/admin/dashboard");
    }
  }, [status, session, isSubmitting, isPostLogout]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
        setIsSubmitting(false);
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting...");
        
        // Immediate redirect - no waiting
        // The dashboard will handle loading states client-side
        window.location.href = `/admin/dashboard`;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Admin Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

