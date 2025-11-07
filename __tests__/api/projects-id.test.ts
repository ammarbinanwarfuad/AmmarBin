/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET, PUT, DELETE } from "@/app/api/projects/[id]/route";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Project");
jest.mock("next-auth");
jest.mock("@/lib/cache-invalidation");

describe("Projects API - GET /api/projects/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return project by ID", async () => {
    const mockProject = {
      _id: "project-123",
      title: "Test Project",
      slug: "test-project",
      description: "Test description",
      published: true,
    };

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findById as jest.Mock).mockResolvedValue(mockProject);

    const request = new NextRequest("http://localhost/api/projects/project-123");
    const response = await GET(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.project).toEqual(mockProject);
    expect(Project.findById).toHaveBeenCalledWith("project-123");
  });

  it("should return 404 for non-existent ID", async () => {
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findById as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost/api/projects/non-existent-id"
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Project not found");
  });

  it("should handle database errors gracefully", async () => {
    (connectDB as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest("http://localhost/api/projects/project-123");
    const response = await GET(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch project");
  });
});

describe("Projects API - PUT /api/projects/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update project fields when authenticated", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    const updateData = {
      title: "Updated Title",
      description: "Updated description",
      published: true,
    };

    const updatedProject = {
      _id: "project-123",
      ...updateData,
      slug: "updated-title",
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findOne as jest.Mock).mockResolvedValue(null); // No slug conflict
    (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProject);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.project.title).toBe("Updated Title");
    expect(data.message).toBe("Project updated successfully");
  });

  it("should validate required fields", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "PUT",
      body: JSON.stringify({ title: "  " }), // Empty title
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });

  it("should invalidate cache after update", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findOne as jest.Mock).mockResolvedValue(null);
    (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "project-123",
      title: "Updated",
    });
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated", description: "Test" }),
    });

    await PUT(request, {
      params: Promise.resolve({ id: "project-123" }),
    });

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("projects");
  });

  it("should return 404 for non-existent project", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findOne as jest.Mock).mockResolvedValue(null);
    (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/projects/non-existent", {
      method: "PUT",
      body: JSON.stringify({ title: "Test", description: "Test" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Project not found");
  });

  it("should require authentication", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "PUT",
      body: JSON.stringify({ title: "Test", description: "Test" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should auto-generate slug when title changes", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findOne as jest.Mock).mockResolvedValue(null);
    (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "project-123",
      title: "New Title",
      slug: "new-title",
    });
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "PUT",
      body: JSON.stringify({ title: "New Title", description: "Test" }),
    });

    await PUT(request, {
      params: Promise.resolve({ id: "project-123" }),
    });

    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
      "project-123",
      expect.objectContaining({ slug: "new-title" }),
      { new: true, runValidators: true }
    );
  });
});

describe("Projects API - DELETE /api/projects/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete project when authenticated", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    const deletedProject = {
      _id: "project-123",
      title: "Deleted Project",
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedProject);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Project deleted successfully");
    expect(Project.findByIdAndDelete).toHaveBeenCalledWith("project-123");
  });

  it("should invalidate cache after deletion", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: "project-123",
    });
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "DELETE",
    });

    await DELETE(request, {
      params: Promise.resolve({ id: "project-123" }),
    });

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("projects");
  });

  it("should return 404 for non-existent project", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Project.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/projects/non-existent", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Project not found");
  });

  it("should require authentication", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle database errors gracefully", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest("http://localhost/api/projects/project-123", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "project-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete project");
  });
});
