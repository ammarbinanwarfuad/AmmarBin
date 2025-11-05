import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

// ⚡ Performance: Add timeout and parallel checking
const CHECK_TIMEOUT = 2000; // 2 seconds max per URL (reduced from 3s)

async function check(url?: string | null): Promise<{ url: string | null; ok: boolean; status: number }> {
  if (!url) return { url: null, ok: false, status: 0 };
  
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);
    
    const res = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    const result = { url, ok: res.ok, status: res.status };
    
    return result;
  } catch {
    // Timeout or network error
    const result = { url, ok: false, status: 0 };
    return result;
  }
}

export async function GET() {
  try {
    await connectDB();
    const Project = (await import("@/models/Project")).default;
    const projects = await Project.find({}).select('title liveUrl githubUrl').lean();

    // ⚡ Performance: Check all URLs in parallel (not sequential)
    const results = await Promise.all(
      projects.map(async (p: unknown) => {
        const project = p as { title?: string; liveUrl?: string | null; githubUrl?: string | null };
        // Check both URLs in parallel for each project
        const [live, github] = await Promise.all([
          check(project.liveUrl),
          check(project.githubUrl),
        ]);
        return {
          title: project.title || 'Untitled',
          live,
          github,
        };
      })
    );

    const broken = results.filter(r => !(r.live.ok && r.github.ok));
    
    return NextResponse.json(
      { results, broken },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to check links' }, { status: 500 });
  }
}


