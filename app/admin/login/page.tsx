"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Redirect if already authenticated (but not if we're in the process of logging in)
  useEffect(() => {
    // Only redirect if not currently submitting login and not already redirecting
    if (status === "authenticated" && session && !isSubmitting && !isRedirecting) {
      setIsRedirecting(true);
      // Use window.location.replace to force a hard redirect
      // This prevents back button issues and ensures clean navigation
      window.location.replace("/admin/dashboard");
    }
  }, [status, session, isSubmitting, isRedirecting]);

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
        callbackUrl: "/admin/dashboard",
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
        setIsSubmitting(false);
      } else if (result?.ok) {
        // Show success message
        toast.success("Login successful! Redirecting...");
        setIsRedirecting(true);
        
        // CRITICAL FIX: Force session update and wait for cookie to be set
        // NextAuth sets cookies via Set-Cookie header in the response
        // We need to ensure the session is fully established before redirecting
        
        // Update the session in the client to ensure it's in sync
        // Note: update is from useSession hook, may not be available immediately after login
        try {
          if (update) {
            await update();
          }
        } catch (error) {
          console.warn("[Login] Session update error (continuing anyway):", error);
        }
        
        // Wait for session cookie to be processed by browser
        // Increased wait time to ensure cookie is fully set
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // CRITICAL: Use window.location.replace for a hard redirect
        // This ensures:
        // 1. Session cookie is fully set before navigation
        // 2. Full page reload with all cookies properly established
        // 3. Server Components receive the session cookie in request headers
        // 4. Internal API calls can properly authenticate
        // 5. Using replace prevents back button from going back to login
        // 6. Prevents redirect loop
        window.location.replace("/admin/dashboard");
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

