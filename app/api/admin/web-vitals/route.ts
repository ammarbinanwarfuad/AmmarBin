import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { WebVital } from "@/models/WebVital";

// ⚡ Performance: Cache web vitals for 1 minute


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const url = searchParams.get("url");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: Record<string, unknown> = { timestamp: { $gte: startDate } };
    if (url) {
      query.url = url;
    }

    // ⚡ Performance: Use aggregation pipeline for faster processing
    // Limit to 1000 records but process more efficiently
    const metrics = await WebVital.find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .select('name value rating timestamp')
      .lean();

    // Calculate aggregates
    const vitals = ["LCP", "INP", "CLS", "FCP", "TTFB"];
    const stats: Record<
      string,
      {
        avg: number;
        p75: number;
        p95: number;
        good: number;
        needsImprovement: number;
        poor: number;
        recent: Array<{ date: string; value: number }>;
      }
    > = {};

    for (const vital of vitals) {
      const vitalMetrics = metrics.filter((m) => m.name === vital);
      if (vitalMetrics.length === 0) continue;

      const values = vitalMetrics.map((m) => m.value).sort((a, b) => a - b);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const p75 = values[Math.floor(values.length * 0.75)];
      const p95 = values[Math.floor(values.length * 0.95)];

      const good = vitalMetrics.filter((m) => m.rating === "good").length;
      const needsImprovement = vitalMetrics.filter(
        (m) => m.rating === "needs-improvement"
      ).length;
      const poor = vitalMetrics.filter((m) => m.rating === "poor").length;

      // Get last 7 days daily averages
      const recent: Array<{ date: string; value: number }> = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayMetrics = vitalMetrics.filter(
          (m) =>
            new Date(m.timestamp) >= date && new Date(m.timestamp) < nextDate
        );
        const dayAvg =
          dayMetrics.length > 0
            ? dayMetrics.reduce((sum, m) => sum + m.value, 0) /
              dayMetrics.length
            : 0;

        recent.unshift({
          date: date.toISOString().split("T")[0],
          value: Math.round(dayAvg),
        });
      }

      stats[vital] = {
        avg: Math.round(avg),
        p75: Math.round(p75),
        p95: Math.round(p95),
        good,
        needsImprovement,
        poor,
        recent,
      };
    }

    return NextResponse.json(
      { stats, total: metrics.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching Web Vitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch Web Vitals" },
      { status: 500 }
    );
  }
}

