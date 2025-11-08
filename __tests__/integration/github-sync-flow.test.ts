/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST as SyncGitHub } from "@/app/api/projects/sync-github/route";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { fetchGitHubRepos, getRepoTopics } from "@/lib/github";
import { logActivity } from "@/lib/activity-logger";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Project");
jest.mock("@/lib/github");
jest.mock("@/lib/activity-logger");

describe("Integration: GitHub Sync Flow", () => {
  const originalEnv = process.env;

  const mockRepos = [
    {
      name: "portfolio-website",
      html_url: "https://github.com/user/portfolio-website",
      description: "My personal portfolio",
      homepage: "https://myportfolio.com",
      created_at: "2024-01-15T00:00:00Z",
    },
    {
      name: "ecommerce-app",
      html_url: "https://github.com/user/ecommerce-app",
      description: "Full-stack e-commerce platform",
      homepage: null,
      created_at: "2024-02-20T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_USERNAME: "testuser",
      GITHUB_PAT: "ghp_test_token_123",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Complete GitHub Sync Workflow", () => {
    it("should fetch repos, get topics, create projects, and log activity", async () => {
      // Step 1: Fetch repositories from GitHub
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);

      // Step 2: Get topics for each repository
      (getRepoTopics as jest.Mock)
        .mockResolvedValueOnce(["nextjs", "typescript", "tailwind"])
        .mockResolvedValueOnce(["react", "nodejs", "mongodb"]);

      // Step 3: Check existing projects
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null);

      // Step 4: Create/update projects
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      // Step 5: Log activity
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github",
        { method: "POST" }
      );

      const response = await SyncGitHub(request);
      const data = await response.json();

      // Verify complete workflow
      expect(response.status).toBe(200);
      expect(data.message).toBe("GitHub projects synced successfully");
      expect(data.count).toBe(2);
      expect(data.topicsFetched).toBe(2);

      // Verify all GitHub API calls
      expect(fetchGitHubRepos).toHaveBeenCalledWith("testuser");
      expect(getRepoTopics).toHaveBeenCalledTimes(2);
      expect(getRepoTopics).toHaveBeenCalledWith("testuser", "portfolio-website");
      expect(getRepoTopics).toHaveBeenCalledWith("testuser", "ecommerce-app");

      // Verify database operations
      expect(connectDB).toHaveBeenCalled();
      expect(Project.findOne).toHaveBeenCalledTimes(2);
      expect(Project.findOneAndUpdate).toHaveBeenCalledTimes(2);

      // Verify activity logging
      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "sync",
          entityType: "projects",
          metadata: { count: 2, source: "github" },
        })
      );
    });

    it("should preserve manual category when syncing existing project", async () => {
      const existingProject = {
        githubUrl: mockRepos[0].html_url,
        category: "Web Development", // Manually set category
        published: false,
        featured: true,
        image: "custom-image.jpg",
      };

      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[0]]);
      (getRepoTopics as jest.Mock).mockResolvedValue(["nextjs"]);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(existingProject);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      await SyncGitHub(request);

      // Verify update doesn't include category (preserves manual value)
      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: mockRepos[0].html_url },
        {
          $set: expect.not.objectContaining({
            category: expect.anything(),
            published: expect.anything(), // Also preserved
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should auto-publish new GitHub projects", async () => {
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([mockRepos[0]]);
      (getRepoTopics as jest.Mock).mockResolvedValue(["react"]);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null); // New project
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      await SyncGitHub(request);

      // Verify new projects are auto-published
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
  });

  describe("Error Handling in Sync Flow", () => {
    it("should handle GitHub API failures gracefully", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockRejectedValue(
        new Error("GitHub API rate limit exceeded")
      );

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      const response = await SyncGitHub(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Failed to fetch repositories");
      expect(data.error).toContain("rate limit");
      expect(Project.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should require GitHub token", async () => {
      delete process.env.GITHUB_PAT;

      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      const response = await SyncGitHub(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("GitHub token");
      expect(fetchGitHubRepos).not.toHaveBeenCalled();
    });

    it("should handle empty repository list", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (fetchGitHubRepos as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      const response = await SyncGitHub(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("No repositories found to sync");
      expect(data.count).toBe(0);
      expect(logActivity).not.toHaveBeenCalled();
    });
  });

  describe("Topics Fetching Integration", () => {
    it("should handle repositories with and without topics", async () => {
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);
      (getRepoTopics as jest.Mock)
        .mockResolvedValueOnce(["react", "typescript"]) // First repo has topics
        .mockResolvedValueOnce([]); // Second repo has no topics

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      const response = await SyncGitHub(request);
      const data = await response.json();

      expect(data.count).toBe(2);
      expect(data.topicsFetched).toBe(1); // Only first repo had topics
      expect(data.note).toContain("Found topics for 1");
    });

    it("should provide helpful note when no topics found", async () => {
      (fetchGitHubRepos as jest.Mock).mockResolvedValue(mockRepos);
      (getRepoTopics as jest.Mock).mockResolvedValue([]); // No topics for any repo

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      const response = await SyncGitHub(request);
      const data = await response.json();

      expect(data.topicsFetched).toBe(0);
      expect(data.note).toContain("No topics found");
      expect(data.note).toContain("repo' scope");
    });
  });

  describe("Data Transformation in Sync", () => {
    it("should correctly transform GitHub data to project schema", async () => {
      const repo = {
        name: "awesome-project",
        html_url: "https://github.com/user/awesome-project",
        description: "An awesome project description",
        homepage: "https://awesome.com",
        created_at: "2024-03-15T10:30:00Z",
      };

      (fetchGitHubRepos as jest.Mock).mockResolvedValue([repo]);
      (getRepoTopics as jest.Mock).mockResolvedValue(["react", "nextjs"]);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      await SyncGitHub(request);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: repo.html_url },
        {
          $set: expect.objectContaining({
            title: "awesome-project",
            slug: "awesome-project",
            description: "An awesome project description",
            topics: ["react", "nextjs"],
            githubUrl: repo.html_url,
            liveUrl: "https://awesome.com",
            source: "github",
            dateCreated: new Date(repo.created_at),
            published: true,
          }),
        },
        { upsert: true, new: true }
      );
    });

    it("should handle missing optional fields", async () => {
      const repoWithoutOptionals = {
        name: "minimal-repo",
        html_url: "https://github.com/user/minimal-repo",
        description: null,
        homepage: null,
        created_at: "2024-01-01T00:00:00Z",
      };

      (fetchGitHubRepos as jest.Mock).mockResolvedValue([repoWithoutOptionals]);
      (getRepoTopics as jest.Mock).mockResolvedValue([]);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Project.findOne as jest.Mock).mockResolvedValue(null);
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (logActivity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/projects/sync-github"
      );

      await SyncGitHub(request);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { githubUrl: repoWithoutOptionals.html_url },
        {
          $set: expect.objectContaining({
            description: "No description available",
            liveUrl: "",
            topics: [],
          }),
        },
        { upsert: true, new: true }
      );
    });
  });
});
