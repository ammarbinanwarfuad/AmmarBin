/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/change-password/route";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validator";

// Mock dependencies
jest.mock("next-auth");
jest.mock("@/lib/db");
jest.mock("@/models/User");
jest.mock("bcryptjs");
jest.mock("@/lib/password-validator");
jest.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
}));

describe("Change Password API", () => {
  const mockSession = {
    user: {
      email: "admin@example.com",
      name: "Admin User",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/admin/change-password", () => {
    it("should change password successfully with valid data", async () => {
      const mockUser = {
        email: "admin@example.com",
        password: "hashed-old-password",
        loginAttempts: 3,
        lockUntil: new Date(),
        save: jest.fn(),
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        strength: "strong",
        errors: [],
      });
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password correct
        .mockResolvedValueOnce(false); // New password different
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-new-password");

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            newPassword: "NewPass456!",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Password changed successfully");
      expect(data.passwordStrength).toBe("strong");
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.password).toBe("hashed-new-password");
      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.lockUntil).toBeUndefined();
    });

    it("should reject unauthenticated requests", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "old",
            newPassword: "new",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("should require both current and new password", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            // newPassword missing
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("should validate new password strength", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: false,
        strength: "weak",
        errors: ["Password too short", "No special characters"],
      });

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            newPassword: "weak",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("security requirements");
      expect(data.details).toEqual([
        "Password too short",
        "No special characters",
      ]);
    });

    it("should return 404 when user not found", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        strength: "strong",
        errors: [],
      });

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            newPassword: "NewPass456!",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should reject incorrect current password", async () => {
      const mockUser = {
        email: "admin@example.com",
        password: "hashed-old-password",
        save: jest.fn(),
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        strength: "strong",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "WrongPassword!",
            newPassword: "NewPass456!",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Current password is incorrect");
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it("should reject when new password same as old password", async () => {
      const mockUser = {
        email: "admin@example.com",
        password: "hashed-password",
        save: jest.fn(),
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        strength: "strong",
      });
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password correct
        .mockResolvedValueOnce(true); // New password same as old

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "SamePass123!",
            newPassword: "SamePass123!",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("must be different");
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it("should hash new password before saving", async () => {
      const mockUser = {
        email: "admin@example.com",
        password: "hashed-old-password",
        save: jest.fn(),
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        strength: "strong",
      });
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-new-password");

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            newPassword: "NewPass456!",
          }),
        }
      );

      await POST(request);

      expect(bcrypt.hash).toHaveBeenCalledWith("NewPass456!", 10);
      expect(mockUser.password).toBe("hashed-new-password");
    });

    it("should reset login attempts on password change", async () => {
      const mockUser = {
        email: "admin@example.com",
        password: "hashed-old-password",
        loginAttempts: 5,
        lockUntil: new Date(Date.now() + 3600000),
        save: jest.fn(),
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        strength: "strong",
      });
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-new-password");

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            newPassword: "NewPass456!",
          }),
        }
      );

      await POST(request);

      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.lockUntil).toBeUndefined();
    });

    it("should handle database errors", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost/api/admin/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "OldPass123!",
            newPassword: "NewPass456!",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to change password");
    });
  });
});
