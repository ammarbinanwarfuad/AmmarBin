"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/admin/dashboard");
    }
  }, [status, session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
        setIsSubmitting(false);
        return;
      }

      if (result?.ok) {
        toast.success("Login successful! Redirecting...");
        
        // Wait for session to be established by checking session endpoint
        // Retry up to 5 times with increasing delays
        let sessionEstablished = false;
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
          
          try {
            const sessionResponse = await fetch("/api/auth/session", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            });
            
            const sessionData = await sessionResponse.json();
            
            if (sessionData?.user) {
              sessionEstablished = true;
              break;
            }
          } catch (err) {
            console.error("Session check attempt", i + 1, "failed:", err);
          }
        }

        if (sessionEstablished) {
          // Use window.location.href for full page reload to ensure session cookie is read
          // This ensures the middleware sees the session cookie
          window.location.href = "/admin/dashboard";
        } else {
          // Fallback: still redirect but log warning
          console.warn("Session verification failed, redirecting anyway");
          window.location.href = "/admin/dashboard";
        }
      } else {
        toast.error("Login failed. Please try again.");
        setIsSubmitting(false);
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="admin@example.com"
                  className="mt-2"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="mt-2"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
              >
                {isSubmitting ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

