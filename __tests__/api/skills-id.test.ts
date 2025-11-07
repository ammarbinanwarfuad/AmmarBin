/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { PUT, DELETE } from "@/app/api/skills/[id]/route";
import { POST as BulkDelete } from "@/app/api/skills/bulk-delete/route";
import { connectDB } from "@/lib/db";
import Skill from "@/models/Skill";
import { getServerSession } from "next-auth";
import { logActivity } from "@/lib/activity-logger";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Skill");
jest.mock("next-auth");
jest.mock("@/lib/activity-logger");
jest.mock("@/lib/cache-invalidation");

describe("Skills API - PUT /api/skills/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update skill when authenticated", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    const updateData = {
      name: "Advanced React",
      proficiency: 95,
    };

    const updatedSkill = {
      _id: "skill-123",
      ...updateData,
      category: "Frontend",
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedSkill);
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "PUT",
      body: JSON.stringify(updateData),
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Browser",
      },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.skill.name).toBe("Advanced React");
    expect(Skill.findByIdAndUpdate).toHaveBeenCalledWith(
      "skill-123",
      updateData,
      { new: true, runValidators: true }
    );
  });

  it("should log activity after update", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "skill-123",
      name: "TypeScript",
    });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "PUT",
      body: JSON.stringify({ name: "TypeScript", proficiency: 90 }),
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Browser",
      },
    });

    await PUT(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });

    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "update",
        entityType: "skill",
        entityId: "skill-123",
        entityTitle: "TypeScript",
        ipAddress: "192.168.1.1",
        userAgent: "Test Browser",
      })
    );
  });

  it("should invalidate cache after update", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "skill-123",
      name: "React",
    });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "PUT",
      body: JSON.stringify({ name: "React" }),
    });

    await PUT(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("skills");
  });

  it("should return 404 for non-existent skill", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/skills/non-existent", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Skill not found");
  });

  it("should require authentication", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "skill-123" }),
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

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to update skill");
  });
});

describe("Skills API - DELETE /api/skills/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete skill when authenticated", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    const deletedSkill = {
      _id: "skill-123",
      name: "React",
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedSkill);
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "DELETE",
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Browser",
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Skill deleted successfully");
    expect(Skill.findByIdAndDelete).toHaveBeenCalledWith("skill-123");
  });

  it("should log activity after deletion", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: "skill-123",
      name: "TypeScript",
    });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "DELETE",
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Browser",
      },
    });

    await DELETE(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });

    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        entityType: "skill",
        entityId: "skill-123",
        entityTitle: "TypeScript",
        ipAddress: "192.168.1.1",
        userAgent: "Test Browser",
      })
    );
  });

  it("should invalidate cache after deletion", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: "skill-123",
      name: "React",
    });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "DELETE",
    });

    await DELETE(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("skills");
  });

  it("should return 404 for non-existent skill", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/skills/non-existent", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Skill not found");
  });

  it("should require authentication", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "skill-123" }),
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

    const request = new NextRequest("http://localhost/api/skills/skill-123", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "skill-123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete skill");
  });
});

describe("Skills API - POST /api/skills/bulk-delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete multiple skills by IDs array", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    const skillsToDelete = [
      { _id: "skill-1", name: "React" },
      { _id: "skill-2", name: "Vue" },
      { _id: "skill-3", name: "Angular" },
    ];

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.find as jest.Mock).mockResolvedValue(skillsToDelete);
    (Skill.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 3 });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["skill-1", "skill-2", "skill-3"] }),
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Browser",
      },
    });

    const response = await BulkDelete(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deletedCount).toBe(3);
    expect(data.message).toBe("3 skill(s) deleted successfully");
    expect(Skill.deleteMany).toHaveBeenCalledWith({
      _id: { $in: ["skill-1", "skill-2", "skill-3"] },
    });
  });

  it("should log bulk delete activity", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    const skillsToDelete = [
      { _id: "skill-1", name: "React" },
      { _id: "skill-2", name: "Vue" },
    ];

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.find as jest.Mock).mockResolvedValue(skillsToDelete);
    (Skill.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["skill-1", "skill-2"] }),
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Browser",
      },
    });

    await BulkDelete(request);

    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        entityType: "skills",
        entityId: "bulk-delete",
        entityTitle: "Bulk delete: 2 skill(s)",
        metadata: {
          count: 2,
          skillNames: ["React", "Vue"],
        },
        ipAddress: "192.168.1.1",
        userAgent: "Test Browser",
      })
    );
  });

  it("should invalidate cache after bulk delete", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.find as jest.Mock).mockResolvedValue([{ _id: "skill-1", name: "React" }]);
    (Skill.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
    (logActivity as jest.Mock).mockResolvedValue(undefined);
    (invalidateCacheAfterUpdate as jest.Mock).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["skill-1"] }),
    });

    await BulkDelete(request);

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("skills");
  });

  it("should return 400 for invalid or empty IDs array", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: [] }),
    });

    const response = await BulkDelete(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid or empty array of IDs");
  });

  it("should return 404 when no skills found to delete", async () => {
    const mockSession = {
      user: { id: "admin-123", email: "admin@test.com", role: "admin" },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Skill.find as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["non-existent-1", "non-existent-2"] }),
    });

    const response = await BulkDelete(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("No skills found to delete");
  });

  it("should require authentication", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["skill-1"] }),
    });

    const response = await BulkDelete(request);
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

    const request = new NextRequest("http://localhost/api/skills/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["skill-1"] }),
    });

    const response = await BulkDelete(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete skills");
  });
});
