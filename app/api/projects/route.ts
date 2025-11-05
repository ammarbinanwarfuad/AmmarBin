import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const topicsParam = searchParams.get("topics");

    // If admin is authenticated, show all projects (including unpublished)
    // Otherwise, only show published projects
    const query: Record<string, unknown> = {};
    if (!session) {
      query.published = true; // Only show published projects for public users
    }
    
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (topicsParam) {
      const topics = topicsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (topics.length > 0) {
        // AND semantics
        (query as Record<string, unknown>).topics = { $all: topics };
      }
    }

    const projects = await Project.find(query)
      .sort({ dateCreated: -1 })
      .lean()
      .maxTimeMS(500); // Timeout for faster TTFB
      
    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const project = await Project.create(data);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

