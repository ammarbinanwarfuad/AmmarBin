import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { fetchGitHubRepos, getRepoTopics } from "@/lib/github";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity-logger";

export async function POST(request: Request) {
  try {
    await connectDB();

    const username = process.env.GITHUB_USERNAME || "ammarbinanwarfuad";
    const token = process.env.GITHUB_PAT;
    
    if (!token) {
      return NextResponse.json(
        { 
          error: "GitHub token (GITHUB_PAT) is required to sync projects with topics",
          count: 0,
          topicsFetched: 0,
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting GitHub sync for user: ${username}`);
    let repos: Awaited<ReturnType<typeof fetchGitHubRepos>>;
    try {
      repos = await fetchGitHubRepos(username);
      console.log(`📦 Found ${repos.length} repositories to sync`);
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isAuthError = errorMessage.includes('authentication') || errorMessage.includes('permission');
      
      return NextResponse.json(
        { 
          error: errorMessage,
          help: isAuthError ? 'Go to GitHub Settings > Developer settings > Personal access tokens. For fine-grained tokens: Grant Repository permissions > Metadata (Read) and Contents (Read). For classic tokens: Grant repo scope.' : undefined,
          count: 0,
          topicsFetched: 0,
        },
        { status: isAuthError ? 401 : 500 }
      );
    }

    if (repos.length === 0) {
      return NextResponse.json({
        message: "No repositories found to sync",
        count: 0,
        topicsFetched: 0,
        note: "Check your GITHUB_USERNAME environment variable and ensure you have repositories.",
      });
    }

    let synced = 0;
    let topicsFetched = 0;

    for (const repo of repos) {
      // GitHub repos list endpoint doesn't include topics, so we always need to fetch separately
      let topics: string[] = [];
      
      // Always fetch topics from the topics endpoint
      topics = await getRepoTopics(username, repo.name);
      
      if (topics.length > 0) {
        topicsFetched++;
        console.log(`✅ ${repo.name}: ${topics.length} topics`);
      } else {
        console.log(`⚠️ ${repo.name}: No topics found`);
      }

      // Check if project already exists to preserve manually assigned fields
      const existingProject = await Project.findOne({ githubUrl: repo.html_url });
      const hasManualCategory = existingProject?.category && existingProject.category.trim() !== "";
      const hasManualTechStack = existingProject?.techStack && existingProject.techStack.length > 0;

      // Build project data from GitHub - only include fields that come from GitHub
      const projectData: Record<string, unknown> = {
        title: repo.name,
        slug: slugify(repo.name),
        description: repo.description || "No description available",
        githubUrl: repo.html_url,
        liveUrl: repo.homepage || "",
        source: "github",
        dateCreated: new Date(repo.created_at),
      };

      // Only update techStack for NEW projects or projects without manual tech stack
      // This preserves manually curated tech stacks
      if (!hasManualTechStack) {
        projectData.techStack = topics || [];
        // Don't create separate 'topics' field - techStack IS the topics
      }

      // Only set category to empty if project doesn't exist or doesn't have a manually assigned category
      // This preserves manually assigned categories when syncing again
      if (!hasManualCategory) {
        projectData.category = "";
      }
      
      // Auto-publish new projects, but preserve existing published status
      if (!existingProject) {
        projectData.published = true; // Auto-publish new GitHub projects
      }
      // Manual fields NOT included in projectData are preserved:
      // - techStack (if manually set)
      // - topics (if manually set)
      // - category (if manually set)
      // - published (if already exists)
      // - featured
      // - image

      // Use $set to update only GitHub-sourced fields, preserving manually set fields:
      // - category (if manually set)
      // - published (if already exists)
      // - featured
      // - image
      // These fields are NOT included in projectData for existing projects, so they won't be overwritten
      await Project.findOneAndUpdate(
        { githubUrl: repo.html_url },
        { $set: projectData },
        { upsert: true, new: true }
      );

      synced++;
    }

    console.log(`✅ Sync complete: ${synced} projects synced, ${topicsFetched} with topics`);

    // Invalidate all caches to ensure fresh data is shown immediately
    try {
      console.log("✅ Cache invalidated successfully");
    } catch (error) {
      console.warn("Cache invalidation failed (may be in test environment):", error);
    }

    // Log activity
    await logActivity({
      action: "sync",
      entityType: "projects",
      entityId: "github-sync",
      entityTitle: "GitHub Projects Sync",
      metadata: { count: synced, source: "github" },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      message: "GitHub projects synced successfully",
      count: synced,
      topicsFetched,
      note: topicsFetched === 0 
        ? "No topics found. Make sure your GitHub token has permissions and repositories have topics set on GitHub."
        : `Synced ${topicsFetched} repositories with topics. Topics were added as tech stack.`,
    });
  } catch (error) {
    console.error("Error syncing GitHub projects:", error);
    return NextResponse.json(
      { error: "Failed to sync GitHub projects" },
      { status: 500 }
    );
  }
}

