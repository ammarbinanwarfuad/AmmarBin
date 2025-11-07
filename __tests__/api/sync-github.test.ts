/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/projects/sync-github/route";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { fetchGitHubRepos, getRepoTopics } from "@/lib/github";
import { logActivity } from "@/lib/activity-logger";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Project");
jest.mock("@/lib/github");
jest.mock("@/lib/activity-logger");

describe("GitHub Sync API", () => {
  const originalEnv = process.env;
  
  const mockRepos = [
    {
      name: "awesome-project",
      html_url: "https://github.com/testuser/awesome-project",
      description: "An awesome project",
      homepage: "https://awesome-project.com",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      name: "another-repo",
      html_url: "https://github.com/testuser/another-repo",
      description: "Another repository",
      homepage: "",
      created_at: "2024-02-01T00:00:00Z",
    },
    {
      name: "no-description",
      html_url: "https://github.com/testuser/no-description",
      description: null,
      homepage: null,
      created_at: "2024-03-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_USERNAME: "testuser",
      GITHUB_PAT: "ghp_test_token",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("POST /api/projects/sync-github", () => {
    it("should sync GitHub repositories successfully", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);
      (getRepoTopics as jest.Mock)
        .mockResolvedValueOnce(["react", "typescript"])
        .mockResolvedValueOnce(["nodejs", "express"])
        .mockResolvedValueOnce([]);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("GitHub projects synced successfully");
      expect(data.count).toBe(3);
      expect(data.topicsFetched).toBe(2);
      expect(connectDB).toHaveBeenCalled();
      expect(fetchGitHubRepos).toHaveBeenCalledWith("testuser");
    });

    it("should fetch topics for each repository", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);
      (getRepoTopics as jest.Mock).mockResolvedValue(["react", "typescript"]);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      expect(getRepoTopics).toHaveBeenCalledTimes(3);
      expect(getRepoTopics).toHaveBeenCalledWith("testuser", "awesome-project");
      expect(getRepoTopics).toHaveBeenCalledWith("testuser", "another-repo");
      expect(getRepoTopics).toHaveBeenCalledWith("testuser", "no-description");
    });

    it("should create new projects with topics", async () => {
      const topics = ["react", "typescript", "nextjs"];
      
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[0]]);
      (getRepoTopics as jest.Mock).mockResolvedValue(topics);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: mockRepos[0].html_url },
        {
          $set: expect.objectContaining({
            title: "awesome-project",
            description: "An awesome project",
            topics: topics,
            githubUrl: mockRepos[0].html_url,
            liveUrl: "https://awesome-project.com",
            source: "github",
            published: true,
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should handle repositories with no description", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[2]]);
      (getRepoTopics as jest.Mock).mockResolvedValue([]);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: mockRepos[2].html_url },
        {
          $set: expect.objectContaining({
            description: "No description available",
            liveUrl: "",
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should preserve manually set category on existing projects", async () => {
      const existingProject = {
        githubUrl: mockRepos[0].html_url,
        category: "Web Development",
        published: false,
        featured: true,
      };

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[0]]);
      (getRepoTopics as jest.Mock).mockResolvedValue(["react"]);
      (Project.findOne as jest.Mock).mockResolvedValue(existingProject);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      // Should NOT include category in update data when existing project has manual category
      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: mockRepos[0].html_url },
        {
          $set: expect.not.objectContaining({
            category: expect.anything(),
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should preserve published status on existing projects", async () => {
      const existingProject = {
        githubUrl: mockRepos[0].html_url,
        published: false,
      };

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[0]]);
      (getRepoTopics as jest.Mock).mockResolvedValue(["react"]);
      (Project.findOne as jest.Mock).mockResolvedValue(existingProject);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      // Should NOT include published in update data for existing projects
      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: mockRepos[0].html_url },
        {
          $set: expect.not.objectContaining({
            published: expect.anything(),
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should auto-publish new projects", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[0]]);
      (getRepoTopics as jest.Mock).mockResolvedValue([]);
      (Project.findOne as jest.Mock).mockResolvedValue(null); // New project
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: mockRepos[0].html_url },
        {
          $set: expect.objectContaining({
            published: true,
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should log activity after successful sync", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);
      (getRepoTopics as jest.Mock).mockResolvedValue([]);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "user-agent": "Mozilla/5.0",
        },
      });

      await POST(request);

      expect(logActivity).toHaveBeenCalledWith({
        action: "sync",
        entityType: "projects",
        entityId: "github-sync",
        entityTitle: "GitHub Projects Sync",
        metadata: { count: 3, source: "github" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });
    });

    it("should return error when GITHUB_PAT is missing", async () => {
      delete process.env.GITHUB_PAT;

      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("GitHub token");
      expect(data.count).toBe(0);
      expect(fetchGitHubRepos).not.toHaveBeenCalled();
    });

    it("should handle fetchGitHubRepos failure", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockRejectedValue(
        new Error("GitHub API rate limit exceeded")
      );

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Failed to fetch repositories");
      expect(data.error).toContain("rate limit");
    });

    it("should handle empty repository list", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("No repositories found to sync");
      expect(data.count).toBe(0);
      expect(data.note).toBeDefined();
    });

    it("should handle database connection errors", async () => {
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to sync GitHub projects");
    });

    it("should provide helpful note when no topics found", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);
      (getRepoTopics as jest.Mock).mockResolvedValue([]); // No topics for any repo
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.topicsFetched).toBe(0);
      expect(data.note).toContain("No topics found");
      expect(data.note).toContain("repo' scope");
    });

    it("should use default username when GITHUB_USERNAME not set", async () => {
      delete process.env.GITHUB_USERNAME;

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost/api/projects/sync-github", {
        method: "POST",
      });

      await POST(request);

      expect(fetchGitHubRepos).toHaveBeenCalledWith("ammarbinanwarfuad");
    });
  });
});
