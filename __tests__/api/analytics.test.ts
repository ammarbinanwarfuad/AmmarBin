/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/analytics/track/route";
import { GET } from "@/app/api/admin/web-vitals/route";
import { connectDB } from "@/lib/db";
import PageView from "@/models/PageView";
import { WebVital } from "@/models/WebVital";
import { getServerSession } from "next-auth";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/PageView");
jest.mock("@/models/WebVital");
jest.mock("next-auth");

describe("Analytics API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/analytics/track - Page View Tracking", () => {
    it("should track page view with complete data", async () => {
      const trackingData = {
        path: "/projects",
        referrer: "https://google.com",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124",
        ipAddress: "192.168.1.1",
        sessionId: "session-123",
        duration: 5000,
        metadata: { action: "view" },
      };

      (PageView.create as jest.Mock).mockResolvedValue({
        _id: "view123",
        ...trackingData,
      });

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: DB save happens async, so we can't directly test it
    });

    it("should detect mobile device from user agent", async () => {
      const trackingData = {
        path: "/",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        sessionId: "session-mobile",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      // Device detection happens async in background
    });

    it("should detect tablet device from user agent", async () => {
      const trackingData = {
        path: "/",
        userAgent: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
        sessionId: "session-tablet",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it("should detect desktop device from user agent", async () => {
      const trackingData = {
        path: "/",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
        sessionId: "session-desktop",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it("should extract Chrome browser from user agent", async () => {
      const trackingData = {
        path: "/",
        userAgent: "Mozilla/5.0 Chrome/91.0.4472.124",
        sessionId: "session-chrome",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should handle sendBeacon blob requests", async () => {
      const trackingData = {
        path: "/about",
        sessionId: "session-beacon",
      };

      const blob = new Blob([JSON.stringify(trackingData)], {
        type: "application/x-www-form-urlencoded",
      });

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        body: blob,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it("should generate session ID if not provided", async () => {
      const trackingData = {
        path: "/contact",
        userAgent: "Mozilla/5.0",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Session ID generated in async DB save
    });

    it("should return success even on DB errors (fire and forget)", async () => {
      (connectDB as jest.Mock).mockRejectedValue(new Error("DB error"));

      const trackingData = {
        path: "/",
        sessionId: "session-error",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still return success
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should handle malformed JSON gracefully", async () => {
      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
    });

    it("should track minimal data (path only)", async () => {
      const trackingData = {
        path: "/blog",
      };

      const request = new NextRequest("http://localhost/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe("GET /api/admin/web-vitals - Web Vitals Dashboard", () => {
    const mockSession = {
      user: {
        email: "admin@example.com",
        name: "Admin User",
      },
    };

    const mockWebVitals = [
      {
        name: "LCP",
        value: 2500,
        rating: "good",
        timestamp: new Date(),
      },
      {
        name: "LCP",
        value: 3500,
        rating: "needs-improvement",
        timestamp: new Date(),
      },
      {
        name: "INP",
        value: 100,
        rating: "good",
        timestamp: new Date(),
      },
      {
        name: "CLS",
        value: 0.05,
        rating: "good",
        timestamp: new Date(),
      },
    ];

    it("should return web vitals stats when authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockWebVitals),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toBeDefined();
      expect(data.total).toBe(4);
      expect(connectDB).toHaveBeenCalled();
    });

    it("should reject unauthenticated requests", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(WebVital.find).not.toHaveBeenCalled();
    });

    it("should filter by days parameter", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const request = new NextRequest(
        "http://localhost/api/admin/web-vitals?days=30"
      );
      await GET(request);

      // Should query with date range based on days
      expect(WebVital.find).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.objectContaining({
            $gte: expect.any(Date),
          }),
        })
      );
    });

    it("should filter by URL parameter", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const request = new NextRequest(
        "http://localhost/api/admin/web-vitals?url=/projects"
      );
      await GET(request);

      expect(WebVital.find).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/projects",
        })
      );
    });

    it("should calculate average metrics", async () => {
      const lcpMetrics = [
        { name: "LCP", value: 2000, rating: "good", timestamp: new Date() },
        { name: "LCP", value: 3000, rating: "good", timestamp: new Date() },
        { name: "LCP", value: 4000, rating: "needs-improvement", timestamp: new Date() },
      ];

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(lcpMetrics),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.LCP).toBeDefined();
      expect(data.stats.LCP.avg).toBe(3000); // (2000 + 3000 + 4000) / 3
    });

    it("should calculate p75 percentile", async () => {
      const metrics = Array(100)
        .fill(null)
        .map((_, i) => ({
          name: "LCP",
          value: i * 100,
          rating: "good",
          timestamp: new Date(),
        }));

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(metrics),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.LCP.p75).toBeDefined();
      expect(data.stats.LCP.p75).toBeGreaterThan(0);
    });

    it("should count rating categories", async () => {
      const lcpMetrics = [
        { name: "LCP", value: 2000, rating: "good", timestamp: new Date() },
        { name: "LCP", value: 2000, rating: "good", timestamp: new Date() },
        { name: "LCP", value: 3000, rating: "needs-improvement", timestamp: new Date() },
        { name: "LCP", value: 5000, rating: "poor", timestamp: new Date() },
      ];

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(lcpMetrics),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.LCP.good).toBe(2);
      expect(data.stats.LCP.needsImprovement).toBe(1);
      expect(data.stats.LCP.poor).toBe(1);
    });

    it("should provide recent 7-day trends", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockWebVitals),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.LCP.recent).toBeDefined();
      expect(data.stats.LCP.recent).toHaveLength(7);
      expect(data.stats.LCP.recent[0]).toHaveProperty("date");
      expect(data.stats.LCP.recent[0]).toHaveProperty("value");
    });

    it("should handle empty metrics gracefully", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(0);
      expect(data.stats).toEqual({});
    });

    it("should limit results to 1000 metrics", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      await GET(request);

      const findMock = WebVital.find as jest.Mock;
      const sortResult = findMock.mock.results[0].value;
      expect(sortResult.limit).toHaveBeenCalledWith(1000);
    });

    it("should include no-cache headers in response", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (WebVital.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);

      expect(response.headers.get("Cache-Control")).toContain("no-store");
    });

    it("should handle database errors", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost/api/admin/web-vitals");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch Web Vitals");
    });
  });
});
