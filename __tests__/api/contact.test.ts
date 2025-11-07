/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/contact/route";
import Message from "@/models/Message";
import { connectDB } from "@/lib/db";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Message");
jest.mock("@/lib/email");
jest.mock("@/lib/rate-limit");
jest.mock("@/lib/cache-invalidation", () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
}));

describe("Contact API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_HOST = "smtp.gmail.com";
    process.env.EMAIL_USER = "test@example.com";
    process.env.EMAIL_PASSWORD = "test-password";
  });

  describe("GET /api/contact", () => {
    it("should return paginated messages with default pagination", async () => {
      const mockMessages = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test message",
          read: false,
          replied: false,
          createdAt: new Date(),
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          subject: "Another Subject",
          message: "Another message",
          read: true,
          replied: false,
          createdAt: new Date(),
        },
      ];

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockMessages),
      });
      (Message.countDocuments as jest.Mock).mockResolvedValue(2);

      const request = new NextRequest("http://localhost/api/contact");
      const response = await GET(request);
      const data = await response.json();

      expect(connectDB).toHaveBeenCalled();
      expect(data.messages).toHaveLength(2);
      expect(data.messages[0]).toMatchObject({
        _id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
      expect(data.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        pages: 1,
      });
    });

    it("should support custom pagination parameters", async () => {
      const mockMessages = [{ _id: "1", name: "Test" }];

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockMessages),
      });
      (Message.countDocuments as jest.Mock).mockResolvedValue(50);

      const request = new NextRequest(
        "http://localhost/api/contact?page=2&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        pages: 5,
      });
    });

    it("should return empty array when no messages", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      });
      (Message.countDocuments as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest("http://localhost/api/contact");
      const response = await GET(request);
      const data = await response.json();

      expect(data.messages).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it("should handle database errors", async () => {
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost/api/contact");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database connection failed");
    });
  });

  describe("POST /api/contact", () => {
    it("should create message and send emails successfully", async () => {
      const contactData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "This is a test message",
      };

      const mockMessage = {
        _id: "message123",
        ...contactData,
        read: false,
        replied: false,
        createdAt: new Date(),
      };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockResolvedValue(mockMessage);
      (sendContactNotification as jest.Mock).mockResolvedValue(undefined);
      (sendContactConfirmation as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "100" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(connectDB).toHaveBeenCalled();
      expect(Message.create).toHaveBeenCalledWith(contactData);
      expect(sendContactNotification).toHaveBeenCalledWith(contactData);
      expect(sendContactConfirmation).toHaveBeenCalledWith(
        contactData.email,
        contactData.name
      );
      expect(data.message).toBe("Message sent successfully");
      expect(data.data).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it("should save message even if email sending fails", async () => {
      const contactData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message",
      };

      const mockMessage = { _id: "123", ...contactData };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockResolvedValue(mockMessage);
      (sendContactNotification as jest.Mock).mockRejectedValue(
        new Error("Email failed")
      );

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "100" },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(Message.create).toHaveBeenCalled();
    });

    it("should skip email sending when not configured", async () => {
      delete process.env.EMAIL_HOST;

      const contactData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message",
      };

      const mockMessage = { _id: "123", ...contactData };

      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockResolvedValue(mockMessage);

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "content-length": "100" },
      });

      await POST(request);

      expect(sendContactNotification).not.toHaveBeenCalled();
      expect(sendContactConfirmation).not.toHaveBeenCalled();
    });

    it("should enforce rate limiting", async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: false });

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Test",
          email: "test@example.com",
          subject: "Subject",
          message: "Message",
        }),
        headers: { "content-length": "100" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain("Too many requests");
      expect(Message.create).not.toHaveBeenCalled();
    });

    it("should reject requests that are too large", async () => {
      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: { "content-length": "200000" }, // 200KB
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toContain("too large");
      expect(Message.create).not.toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });

      const invalidData = {
        name: "John",
        // Missing email, subject, message
      };

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: { "content-length": "100" },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(Message.create).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Message.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Test",
          email: "test@example.com",
          subject: "Subject",
          message: "This is a valid message with enough characters",
        }),
        headers: { "content-length": "100" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Database error");
      expect(data.timestamp).toBeDefined();
    });
  });
});
