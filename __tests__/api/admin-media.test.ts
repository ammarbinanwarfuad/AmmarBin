/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET, DELETE } from "@/app/api/admin/media/route";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { cachedFetch, invalidateCache } from "@/lib/cache";

// Mock dependencies
jest.mock("next-auth");
jest.mock("@/lib/cloudinary");
jest.mock("@/lib/cache");

describe("Media Library API", () => {
  const mockSession = {
    user: {
      email: "admin@example.com",
      name: "Admin User",
    },
  };

  const mockMediaResources = [
    {
      public_id: "portfolio/image1",
      secure_url: "https://res.cloudinary.com/image1.jpg",
      resource_type: "image",
      format: "jpg",
      created_at: "2024-03-01T00:00:00Z",
      bytes: 102400,
      width: 1920,
      height: 1080,
    },
    {
      public_id: "portfolio/image2",
      secure_url: "https://res.cloudinary.com/image2.png",
      resource_type: "image",
      format: "png",
      created_at: "2024-02-01T00:00:00Z",
      bytes: 204800,
      width: 1280,
      height: 720,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock cachedFetch to just execute the function
    (cachedFetch as jest.Mock).mockImplementation(async (_key, fn) => await fn());
  });

  describe("GET /api/admin/media", () => {
    it("should return media resources when authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest("http://localhost/api/admin/media");
      const response = await GET(request);
      const data = await response.json();

      expect(getServerSession).toHaveBeenCalled();
      // Default fetches all 3 resource types (image, video, raw)
      expect(cloudinary.api.resources).toHaveBeenCalledTimes(3);
      expect(data.resources).toBeDefined();
      expect(data.total).toBeDefined();
    });

    it("should reject unauthenticated requests", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/admin/media");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(cloudinary.api.resources).not.toHaveBeenCalled();
    });

    it("should filter by folder when folder parameter provided", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [mockMediaResources[0]],
        total_count: 1,
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?folder=portfolio"
      );
      await GET(request);

      expect(cloudinary.api.resources).toHaveBeenCalledWith(
        expect.objectContaining({
          prefix: "portfolio",
        })
      );
    });

    it("should filter by resource type", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?resourceType=image"
      );
      await GET(request);

      expect(cloudinary.api.resources).toHaveBeenCalledWith(
        expect.objectContaining({
          resource_type: "image",
        })
      );
    });

    it("should use search API when search parameter provided", async () => {
      const mockSearchExecute = jest.fn().mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const mockSortBy = jest.fn().mockReturnValue({
        max_results: jest.fn().mockReturnValue({
          execute: mockSearchExecute,
        }),
      });

      const mockWithField = jest.fn().mockReturnValue({
        sort_by: mockSortBy,
      });

      const mockExpression = jest.fn().mockReturnValue({
        with_field: mockWithField,
      });

      (cloudinary.search as any) = {
        expression: mockExpression,
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest(
        "http://localhost/api/admin/media?search=profile"
      );
      await GET(request);

      expect(mockExpression).toHaveBeenCalledWith("profile");
      expect(mockSearchExecute).toHaveBeenCalled();
    });

    it("should combine search with folder filter", async () => {
      const mockSearchExecute = jest.fn().mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const mockSortBy = jest.fn().mockReturnValue({
        max_results: jest.fn().mockReturnValue({
          execute: mockSearchExecute,
        }),
      });

      const mockWithField = jest.fn().mockReturnValue({
        sort_by: mockSortBy,
      });

      const mockExpression = jest.fn().mockReturnValue({
        with_field: mockWithField,
      });

      (cloudinary.search as any) = {
        expression: mockExpression,
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest(
        "http://localhost/api/admin/media?folder=portfolio&search=image"
      );
      await GET(request);

      expect(mockExpression).toHaveBeenCalledWith("folder:portfolio AND image");
    });

    it("should respect maxResults parameter", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?maxResults=50"
      );
      await GET(request);

      expect(cloudinary.api.resources).toHaveBeenCalledWith(
        expect.objectContaining({
          max_results: 50,
        })
      );
    });

    it("should use default maxResults of 100", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest("http://localhost/api/admin/media");
      await GET(request);

      expect(cloudinary.api.resources).toHaveBeenCalledWith(
        expect.objectContaining({
          max_results: 100,
        })
      );
    });

    it("should fetch all resource types when resourceType is 'all'", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?resourceType=all"
      );
      await GET(request);

      // Should be called for image, video, raw
      expect(cloudinary.api.resources).toHaveBeenCalledTimes(3);
    });

    it("should sort combined resources by created_at descending", async () => {
      const olderResource = {
        public_id: "old",
        created_at: "2024-01-01T00:00:00Z",
      };
      const newerResource = {
        public_id: "new",
        created_at: "2024-03-01T00:00:00Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      // Mock returns different resources for each type call
      (cloudinary.api.resources as jest.Mock)
        .mockResolvedValueOnce({
          resources: [olderResource],
          total_count: 1,
        })
        .mockResolvedValueOnce({
          resources: [newerResource],
          total_count: 1,
        })
        .mockResolvedValueOnce({
          resources: [],
          total_count: 0,
        });

      const request = new NextRequest(
        "http://localhost/api/admin/media?resourceType=all"
      );
      const response = await GET(request);
      const data = await response.json();

      // Should be sorted newest first (2024-03-01 before 2024-01-01)
      expect(data.resources).toHaveLength(2);
      expect(data.resources[0].public_id).toBe("new");
      expect(data.resources[1].public_id).toBe("old");
    });

    it("should handle empty results", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [],
        total_count: 0,
      });

      const request = new NextRequest("http://localhost/api/admin/media");
      const response = await GET(request);
      const data = await response.json();

      expect(data.resources).toEqual([]);
      expect(data.total).toBe(0);
    });

    it("should handle Cloudinary API errors gracefully", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockRejectedValue(
        new Error("Cloudinary API error")
      );

      const request = new NextRequest(
        "http://localhost/api/admin/media?resourceType=image"
      );
      const response = await GET(request);
      const data = await response.json();

      // When specific resource type fails, it returns empty results
      expect(response.status).toBe(200);
      expect(data.resources).toEqual([]);
      expect(data.total).toBe(0);
    });

    it("should use cache for media list", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest("http://localhost/api/admin/media");
      await GET(request);

      expect(cachedFetch).toHaveBeenCalledWith(
        expect.stringContaining("admin:media:"),
        expect.any(Function),
        5 * 60 * 1000 // 5 minutes
      );
    });

    it("should include no-store cache control header in response", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: mockMediaResources,
        total_count: 2,
      });

      const request = new NextRequest("http://localhost/api/admin/media");
      const response = await GET(request);

      expect(response.headers.get("Cache-Control")).toContain("no-store");
    });
  });

  describe("DELETE /api/admin/media", () => {
    it("should delete media successfully when authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: "ok",
      });
      (invalidateCache as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/admin/media?publicId=portfolio/image1"
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        "portfolio/image1",
        { resource_type: "image" }
      );
      expect(data.success).toBe(true);
    });

    it("should reject unauthenticated delete requests", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/admin/media?publicId=test"
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it("should require publicId parameter", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost/api/admin/media");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("publicId is required");
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it("should delete with custom resource type", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: "ok",
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?publicId=video1&resourceType=video"
      );
      await DELETE(request);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("video1", {
        resource_type: "video",
      });
    });

    it("should use 'image' as default resource type", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: "ok",
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?publicId=test"
      );
      await DELETE(request);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("test", {
        resource_type: "image",
      });
    });

    it("should invalidate cache after deletion", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: "ok",
      });

      const request = new NextRequest(
        "http://localhost/api/admin/media?publicId=test&resourceType=image"
      );
      await DELETE(request);

      expect(invalidateCache).toHaveBeenCalledWith("admin:media:image:*");
    });

    it("should handle Cloudinary delete errors", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
        new Error("Failed to delete from Cloudinary")
      );

      const request = new NextRequest(
        "http://localhost/api/admin/media?publicId=test"
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete media");
    });
  });
});
