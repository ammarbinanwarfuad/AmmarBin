"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

// Error codes NextAuth may append to /admin/login?error=...
const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to continue.",
  Default: "Sign in failed. Please try again.",
};

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/admin/dashboard");

  // Read URL params on mount to avoid useSearchParams Suspense dependency.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawCallback = params.get("callbackUrl") || "";

    // Allow only internal relative callback paths to prevent open redirects.
    if (rawCallback.startsWith("/") && !rawCallback.startsWith("//") && !rawCallback.includes("://")) {
      setCallbackUrl(rawCallback);
    }

    const error = params.get("error");
    if (error) {
      toast.error(AUTH_ERRORS[error] ?? AUTH_ERRORS.Default);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error(AUTH_ERRORS[result.error] ?? AUTH_ERRORS.Default);
        return;
      }

      window.location.replace(result?.url ?? callbackUrl);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      // If redirect does not happen (error path), keep form usable.
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <motion.div
        initial={false}
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

export default function AdminLoginPage() {
  return <LoginForm />;
}

