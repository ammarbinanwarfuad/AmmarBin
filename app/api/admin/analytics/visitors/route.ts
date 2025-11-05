import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PageView from "@/models/PageView";

// ⚡ Performance: Cache visitor analytics for 2 minutes


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get page views with optimized query
    const pageViews = await PageView.find({
      createdAt: { $gte: startDate },
    })
      .select('path sessionId referrer device createdAt')
      .lean()
      .maxTimeMS(500);

    // Calculate stats
    const totalViews = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map((pv) => pv.sessionId)).size;

    // Group by path
    const viewsByPath: Record<string, number> = {};
    pageViews.forEach((pv) => {
      viewsByPath[pv.path] = (viewsByPath[pv.path] || 0) + 1;
    });

    // Group by date
    const viewsByDate: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const date = new Date(pv.createdAt).toISOString().split("T")[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    // Group by device
    const viewsByDevice: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const device = pv.device || "unknown";
      viewsByDevice[device] = (viewsByDevice[device] || 0) + 1;
    });

    // Top pages
    const topPages = Object.entries(viewsByPath)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, views: count }));

    // Referrers
    const referrers: Record<string, number> = {};
    pageViews.forEach((pv) => {
      if (pv.referrer) {
        try {
          const url = new URL(pv.referrer);
          const domain = url.hostname.replace("www.", "");
          referrers[domain] = (referrers[domain] || 0) + 1;
        } catch {
          // Invalid referrer URL
        }
      }
    });

    const topReferrers = Object.entries(referrers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, visits: count }));

    return NextResponse.json(
      {
        period: `${days} days`,
        totalViews,
        uniqueVisitors,
        topPages,
        topReferrers,
        viewsByDate: Object.entries(viewsByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, views]) => ({ date, views })),
        viewsByDevice,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching visitor analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor analytics" },
      { status: 500 }
    );
  }
}

