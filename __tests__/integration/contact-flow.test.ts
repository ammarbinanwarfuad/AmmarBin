/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST as SubmitContact } from "@/app/api/contact/route";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Message");
jest.mock("@/lib/email");
jest.mock("@/lib/rate-limit");
jest.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
}));

describe("Integration: Contact Form Flow", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      EMAIL_HOST: "smtp.gmail.com",
      EMAIL_USER: "test@example.com",
      EMAIL_PASSWORD: "test-password",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Complete Contact Submission Flow", () => {
    it("should handle full contact form submission with email notifications", async () => {
      const contactData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Project Inquiry",
        message: "I would like to discuss a project collaboration opportunity.",
      };

      const savedMessage = {
        _id: "msg123",
        ...contactData,
        read: false,
        replied: false,
        createdAt: new Date(),
      };

      // Step 1: Rate limiting allows request
      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });

      // Step 2: Database connection established
      (connectDB as jest.Mock).mockResolvedValue(undefined);

      // Step 3: Message saved to database
      (Message.create as jest.Mock).mockResolvedValue(savedMessage);

      // Step 4: Email notifications sent
      (sendContactNotification as jest.Mock).mockResolvedValue(undefined);
      (sendContactConfirmation as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const response = await SubmitContact(request);
      const data = await response.json();

      // Verify successful flow
      expect(response.status).toBe(201);
      expect(data.message).toBe("Message sent successfully");
      expect(data.data).toBeDefined();

      // Verify all steps executed in order
      expect(checkRateLimit).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Message.create).toHaveBeenCalledWith(contactData);
      expect(sendContactNotification).toHaveBeenCalledWith(contactData);
      expect(sendContactConfirmation).toHaveBeenCalledWith(
        contactData.email,
        contactData.name
      );
    });

    it("should save message even when email sending fails", async () => {
      const contactData = {
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Bug Report",
        message: "Found a bug in the contact form that needs attention.",
      };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockResolvedValue({
        _id: "msg456",
        ...contactData,
      });
      (sendContactNotification as jest.Mock).mockRejectedValue(
        new Error("SMTP connection failed")
      );

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const response = await SubmitContact(request);

      // Message should still be saved successfully
      expect(response.status).toBe(201);
      expect(Message.create).toHaveBeenCalled();
      expect(sendContactNotification).toHaveBeenCalled();
    });
  });

  describe("Rate Limiting Integration", () => {
    it("should block repeated submissions from same IP", async () => {
      const contactData = {
        name: "Spammer",
        email: "spam@example.com",
        subject: "Spam",
        message: "This is spam message that should be rate limited.",
      };

      // First request - allowed
      (checkRateLimit as jest.Mock).mockReturnValueOnce({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockResolvedValue({ _id: "msg1" });
      (sendContactNotification as jest.Mock).mockResolvedValue(undefined);
      (sendContactConfirmation as jest.Mock).mockResolvedValue(undefined);

      const firstRequest = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const firstResponse = await SubmitContact(firstRequest);
      expect(firstResponse.status).toBe(201);

      // Second request - rate limited
      (checkRateLimit as jest.Mock).mockReturnValueOnce({ allowed: false });

      const secondRequest = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const secondResponse = await SubmitContact(secondRequest);
      const secondData = await secondResponse.json();

      expect(secondResponse.status).toBe(429);
      expect(secondData.error).toContain("Too many requests");
      expect(Message.create).toHaveBeenCalledTimes(1); // Only first request saved
    });
  });

  describe("Email Configuration States", () => {
    it("should skip email when not configured but still save message", async () => {
      delete process.env.EMAIL_HOST;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;

      const contactData = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test",
        message: "Testing message saving without email configuration.",
      };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockResolvedValue({
        _id: "msg-no-email",
        ...contactData,
      });

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const response = await SubmitContact(request);

      expect(response.status).toBe(201);
      expect(Message.create).toHaveBeenCalled();
      expect(sendContactNotification).not.toHaveBeenCalled();
      expect(sendContactConfirmation).not.toHaveBeenCalled();
    });
  });

  describe("Validation and Error Handling", () => {
    it("should reject message that is too short", async () => {
      const invalidData = {
        name: "User",
        email: "user@example.com",
        subject: "Short",
        message: "Too short", // Less than 10 characters
      };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: { "content-length": "100" },
      });

      const response = await SubmitContact(request);

      expect(response.status).toBe(500);
      expect(Message.create).not.toHaveBeenCalled();
    });

    it("should reject request that exceeds size limit", async () => {
      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: { "content-length": "200000" }, // 200KB > 100KB limit
      });

      const response = await SubmitContact(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toContain("too large");
      expect(Message.create).not.toHaveBeenCalled();
    });
  });

  describe("Database Transaction Integrity", () => {
    it("should handle database connection failures gracefully", async () => {
      const contactData = {
        name: "Test",
        email: "test@example.com",
        subject: "Subject",
        message: "Valid message with enough characters for testing.",
      };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection timeout")
      );

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const response = await SubmitContact(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.error).toContain("Database connection timeout");
    });

    it("should handle message creation failures", async () => {
      const contactData = {
        name: "Test",
        email: "test@example.com",
        subject: "Subject",
        message: "Testing database save failure with valid message length.",
      };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockRejectedValue(
        new Error("Duplicate key error")
      );

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "200" },
      });

      const response = await SubmitContact(request);

      expect(response.status).toBe(500);
    });
  });
});
