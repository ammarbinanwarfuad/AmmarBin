import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

// ⚡ Performance: Cache system status for 30 seconds


export async function GET() {
  try {
    const started = Date.now();
    await connectDB();
    const pingMs = Date.now() - started;

    const env = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      CLOUDINARY: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      GITHUB_USERNAME: !!process.env.GITHUB_USERNAME,
    };

    return NextResponse.json(
      { dbLatencyMs: pingMs, env },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'System status failed' }, { status: 500 });
  }
}


