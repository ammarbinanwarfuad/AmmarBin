import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

// ⚡ Performance: Cache system status for 30 seconds
// NOTE: System status is protected to prevent information disclosure
// It reveals environment variable presence and database connectivity

export async function GET() {
  try {
    // Check authentication - system status should be protected
    // to prevent information disclosure about environment setup
    const session = await getServerSession(authOptions);
    if (!session) {
      console.warn("[Admin API] Unauthorized access attempt to /api/admin/system");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
  } catch (error) {
    console.error("[Admin API] Error in /api/admin/system:", error);
    return NextResponse.json({ error: 'System status failed' }, { status: 500 });
  }
}


