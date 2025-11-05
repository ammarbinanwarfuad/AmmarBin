import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { WebVital } from "@/models/WebVital";

// ⚡ Performance: Cache performance alerts for 1 minute


interface AlertThreshold {
  metric: string;
  threshold: number;
  severity: "warning" | "critical";
}

const THRESHOLDS: AlertThreshold[] = [
  { metric: "LCP", threshold: 4000, severity: "critical" }, // 4s
  { metric: "LCP", threshold: 2500, severity: "warning" }, // 2.5s
  { metric: "INP", threshold: 500, severity: "critical" }, // 500ms
  { metric: "INP", threshold: 200, severity: "warning" }, // 200ms
  { metric: "CLS", threshold: 0.25, severity: "critical" }, // 0.25
  { metric: "CLS", threshold: 0.1, severity: "warning" }, // 0.1
  { metric: "FCP", threshold: 3000, severity: "critical" }, // 3s
  { metric: "FCP", threshold: 1800, severity: "warning" }, // 1.8s
  { metric: "TTFB", threshold: 1800, severity: "critical" }, // 1.8s
  { metric: "TTFB", threshold: 800, severity: "warning" }, // 800ms
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "24");

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    // Get recent metrics with optimized query
    const metrics = await WebVital.find({
      timestamp: { $gte: startDate },
    })
      .select('name value rating timestamp')
      .sort({ timestamp: -1 })
      .limit(5000) // Limit to prevent excessive processing
      .lean()
      .maxTimeMS(500);

    // Calculate alerts
    const alerts: Array<{
      metric: string;
      severity: "warning" | "critical";
      count: number;
      percentage: number;
      avgValue: number;
      threshold: number;
    }> = [];

    for (const threshold of THRESHOLDS) {
      const metricData = metrics.filter((m) => m.name === threshold.metric);
      if (metricData.length === 0) continue;

      const violations = metricData.filter((m) => {
        const value = m.value;
        if (threshold.metric === "CLS") {
          return value >= threshold.threshold;
        }
        return value >= threshold.threshold;
      });

      if (violations.length > 0) {
        const avgValue =
          violations.reduce((sum, m) => sum + m.value, 0) / violations.length;
        const percentage = (violations.length / metricData.length) * 100;

        alerts.push({
          metric: threshold.metric,
          severity: threshold.severity,
          count: violations.length,
          percentage: Math.round(percentage * 10) / 10,
          avgValue: Math.round(avgValue),
          threshold: threshold.threshold,
        });
      }
    }

    // Sort by severity (critical first) then by count
    alerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === "critical" ? -1 : 1;
      }
      return b.count - a.count;
    });

    return NextResponse.json(
      {
        alerts,
        totalMetrics: metrics.length,
        period: `${hours} hours`,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching performance alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance alerts" },
      { status: 500 }
    );
  }
}

