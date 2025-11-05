import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    const Project = (await import("@/models/Project")).default;
    const Blog = (await import("@/models/Blog")).default;
    const Message = (await import("@/models/Message")).default;
    const Skill = (await import("@/models/Skill")).default;

    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ⚡ Performance: Run all queries in parallel (12 queries total) with timeouts
    const [
      projects, blogs, messages, skills,
      p7, b7, m7, s7,
      p30, b30, m30, s30,
    ] = await Promise.all([
      // Totals
      Project.countDocuments({}).maxTimeMS(500),
      Blog.countDocuments({}).maxTimeMS(500),
      Message.countDocuments({}).maxTimeMS(500),
      Skill.countDocuments({}).maxTimeMS(500),
      // Last 7 days
      Project.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
      Blog.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
      Message.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
      Skill.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
      // Last 30 days
      Project.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
      Blog.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
      Message.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
      Skill.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
    ]);

    return NextResponse.json(
      {
        totals: { projects, blogs, messages, skills },
        last7d: { projects: p7, blogs: b7, messages: m7, skills: s7 },
        last30d: { projects: p30, blogs: b30, messages: m30, skills: s30 },
        generatedAt: now.toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}


