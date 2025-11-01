"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword } from "@/lib/password-validator";
import { Lock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const { status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, newPassword: value });
    if (value) {
      const validation = validatePassword(value);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate new password
    if (!passwordStrength?.isValid) {
      toast.error("Please fix password requirements");
      return;
    }

    // Check passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength(null);
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return "bg-gray-300";
    switch (passwordStrength.strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthText = () => {
    if (!passwordStrength) return "";
    switch (passwordStrength.strength) {
      case "weak":
        return "Weak";
      case "medium":
        return "Medium";
      case "strong":
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Change Password</h1>
        <p className="text-muted-foreground">
          Update your password to keep your account secure
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Security
          </CardTitle>
          <CardDescription>
            Choose a strong password with a mix of letters, numbers, and symbols
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="mt-2"
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Password Strength:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        passwordStrength?.strength === "weak"
                          ? "text-red-500"
                          : passwordStrength?.strength === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()} ${
                        passwordStrength?.strength === "weak"
                          ? "w-1/3"
                          : passwordStrength?.strength === "medium"
                          ? "w-2/3"
                          : "w-full"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {formData.newPassword && passwordStrength && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Password Requirements:
                  </p>
                  <PasswordRequirement
                    met={formData.newPassword.length >= 8}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={/[A-Z]/.test(formData.newPassword)}
                    text="One uppercase letter"
                  />
                  <PasswordRequirement
                    met={/[a-z]/.test(formData.newPassword)}
                    text="One lowercase letter"
                  />
                  <PasswordRequirement
                    met={/[0-9]/.test(formData.newPassword)}
                    text="One number"
                  />
                  <PasswordRequirement
                    met={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                      formData.newPassword
                    )}
                    text="One special character (!@#$%...)"
                  />
                </div>
              )}

              {/* Error Messages */}
              {passwordStrength && !passwordStrength.isValid && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordStrength.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="mt-2"
              />
              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <p className="text-sm text-destructive mt-2">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !passwordStrength?.isValid ||
                  formData.newPassword !== formData.confirmPassword
                }
              >
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Security Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Use a unique password for this admin panel</p>
          <p>✓ Consider using a password manager</p>
          <p>✓ Change your password regularly (every 3-6 months)</p>
          <p>✓ Never share your password with anyone</p>
          <p>✓ Enable auto-logout if you use shared computers</p>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span
        className={`text-sm ${
          met ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

