/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET as GetProjects, POST as CreateProject } from "@/app/api/projects/route";
import { PATCH as PublishProject } from "@/app/api/projects/[id]/publish/route";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { logActivity } from "@/lib/activity-logger";
import { unstable_cache } from "next/cache";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Project");
jest.mock("next-auth");
jest.mock("@/lib/cache-invalidation");
jest.mock("@/lib/activity-logger");
jest.mock("next/cache");
jest.mock("@/lib/etag", () => ({
  createETagResponse: jest.fn((data: any) =>
    new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    })
  ),
}));

describe("Integration: Admin to Public Workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (unstable_cache as jest.Mock).mockImplementation((fn: any) => fn);
  });

  describe("Project Publication Workflow", () => {
    it("should create project, publish it, and verify public visibility", async () => {
      const mockSession = {
        user: { id: "admin-123", email: "admin@test.com", role: "admin" },
      };

      // Step 1: Create unpublished project
      const projectData = {
        title: "My New Project",
        description: "A comprehensive project description for testing",
        published: false,
        topics: ["react", "typescript"],
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.create as jest.Mock).mockResolvedValue({
        _id: "project-123",
        ...projectData,
        slug: "my-new-project",
      });
      (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

      const createRequest = new NextRequest("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify(projectData),
      });

      const createResponse = await CreateProject(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.project.published).toBe(false);
      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("projects");

      // Step 2: Publish project
      (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: "project-123",
        title: "My New Project",
        published: true,
      });
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const publishRequest = new NextRequest(
        "http://localhost/api/projects/project-123/publish",
        {
          method: "PATCH",
          body: JSON.stringify({ published: true }),
        }
      );

      const publishResponse = await PublishProject(publishRequest, {
        params: Promise.resolve({ id: "project-123" }),
      });
      const publishData = await publishResponse.json();

      expect(publishResponse.status).toBe(200);
      expect(publishData.project.published).toBe(true);

      // Step 3: Verify public can see it
      (getServerSession as jest.Mock).mockResolvedValue(null);
      (Project.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([
          {
            _id: "project-123",
            title: "My New Project",
            published: true,
          },
        ]),
      });

      const publicRequest = new NextRequest("http://localhost/api/projects");
      const publicResponse = await GetProjects(publicRequest);
      const publicData = await publicResponse.json();

      expect(publicData.projects).toHaveLength(1);
      expect(publicData.projects[0].published).toBe(true);
    });

    it("should verify cache invalidation during publish", async () => {
      const mockSession = {
        user: { id: "admin-123", email: "admin@test.com", role: "admin" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: "project-123",
        published: true,
      });
      (logActivity as jest.Mock).mockResolvedValue(undefined);
      (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

      const publishRequest = new NextRequest(
        "http://localhost/api/projects/project-123/publish",
        {
          method: "PATCH",
          body: JSON.stringify({ published: true }),
        }
      );

      await PublishProject(publishRequest, {
        params: Promise.resolve({ id: "project-123" }),
      });

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("projects");
    });

    it("should handle unpublish workflow", async () => {
      const mockSession = {
        user: { id: "admin-123", email: "admin@test.com", role: "admin" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: "project-123",
        title: "My Project",
        published: false,
      });
      (logActivity as jest.Mock).mockResolvedValue(undefined);
      (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

      const unpublishRequest = new NextRequest(
        "http://localhost/api/projects/project-123/publish",
        {
          method: "PATCH",
          body: JSON.stringify({ published: false }),
        }
      );

      const response = await PublishProject(unpublishRequest, {
        params: Promise.resolve({ id: "project-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.project.published).toBe(false);
      expect(data.message).toContain("unpublished");
      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("projects");
    });
  });

  describe("Authentication State Changes", () => {
    it("should return different results based on authentication", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);

      // Admin view - sees all projects
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "admin", role: "admin" },
      });
      (Project.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([
          { _id: "1", title: "Published", published: true },
          { _id: "2", title: "Unpublished", published: false },
        ]),
      });

      const adminRequest = new NextRequest("http://localhost/api/projects");
      const adminResponse = await GetProjects(adminRequest);
      const adminData = await adminResponse.json();

      expect(adminData.projects).toHaveLength(2);

      // Public view - sees only published
      (getServerSession as jest.Mock).mockResolvedValue(null);
      (Project.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([
          { _id: "1", title: "Published", published: true },
        ]),
      });

      const publicRequest = new NextRequest("http://localhost/api/projects");
      const publicResponse = await GetProjects(publicRequest);
      const publicData = await publicResponse.json();

      expect(publicData.projects).toHaveLength(1);
      expect(publicData.projects[0].published).toBe(true);
    });
  });

  describe("Activity Logging", () => {
    it("should log publish and unpublish activities", async () => {
      const mockSession = {
        user: { id: "admin-123", email: "admin@test.com", role: "admin" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: "project-123",
        title: "Test Project",
        published: true,
      });
      (logActivity as jest.Mock).mockResolvedValue(undefined);
      (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

      const publishRequest = new NextRequest(
        "http://localhost/api/projects/project-123/publish",
        {
          method: "PATCH",
          body: JSON.stringify({ published: true }),
        }
      );

      await PublishProject(publishRequest, {
        params: Promise.resolve({ id: "project-123" }),
      });

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "update",
          entityType: "project",
          entityId: "project-123",
          entityTitle: "Test Project",
          changes: { published: true },
        })
      );
    });
  });
});
