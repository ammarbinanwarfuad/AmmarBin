"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Eye } from "lucide-react";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function AdminAnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const { data, isLoading } = useSWR(
    `/api/admin/analytics/visitors?days=${days}`,
    fetcher
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = data || {
    totalViews: 0,
    uniqueVisitors: 0,
    topPages: [],
    topReferrers: [],
    viewsByDate: [],
    viewsByDevice: {},
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Visitor Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Understand your portfolio performance
            </p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Last {days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Unique Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.uniqueVisitors}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Last {days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Avg. Views/Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {days > 0 ? Math.round(stats.totalViews / days) : 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Last {days} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topPages?.length > 0 ? (
              <div className="space-y-4">
                {stats.topPages.map((page: { path: string; views: number }, index: number) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{page.path}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{page.views}</div>
                        <div className="text-xs text-muted-foreground">views</div>
                      </div>
                      <div className="w-32 bg-secondary rounded-full h-2 relative">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(page.views / (stats.topPages[0]?.views || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No page views tracked yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Views by Date - Line Chart */}
        {stats.viewsByDate && stats.viewsByDate.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Daily page views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chart visualization */}
                <div className="relative h-64 w-full">
                  <svg 
                    className="w-full h-full" 
                    viewBox={`0 0 ${stats.viewsByDate.length * 40} 240`}
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="40" height="60" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="60" x2="40" y2="60" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Data points and line */}
                    {(() => {
                      const maxViews = Math.max(...stats.viewsByDate.map((d: { views: number }) => d.views), 1);
                      const points = stats.viewsByDate.map((item: { date: string; views: number }, index: number) => {
                        const x = index * 40 + 20;
                        const y = 220 - (item.views / maxViews) * 200;
                        return { x, y, date: item.date, views: item.views };
                      });
                      
                      // Create path for line
                      const pathData = points.map((p: { x: number; y: number; date: string; views: number }, i: number) => 
                        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                      ).join(' ');
                      
                      return (
                        <>
                          {/* Line */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            className="drop-shadow-sm"
                          />
                          {/* Area fill */}
                          <path
                            d={`${pathData} L ${points[points.length - 1].x} 220 L ${points[0].x} 220 Z`}
                            fill="hsl(var(--primary))"
                            opacity="0.1"
                          />
                          {/* Data points */}
                          {points.map((point: { x: number; y: number; date: string; views: number }, i: number) => (
                            <g key={i}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="hsl(var(--primary))"
                                className="hover:r-6 transition-all cursor-pointer"
                              />
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="hsl(var(--primary))"
                                opacity="0.2"
                                className="hover:r-8 transition-all"
                              />
                              <title>{point.date}: {point.views} views</title>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between items-start pt-2">
                    {stats.viewsByDate.map((item: { date: string; views: number }, index: number) => {
                      const date = new Date(item.date + 'T00:00:00');
                      const isFirst = index === 0;
                      const isLast = index === stats.viewsByDate.length - 1;
                      const showEveryNth = Math.max(1, Math.floor(stats.viewsByDate.length / 7)); // Show ~7 labels max
                      const shouldShow = isFirst || isLast || index % showEveryNth === 0;
                      
                      if (!shouldShow) return null;
                      
                      return (
                        <div
                          key={item.date}
                          className="text-[10px] text-muted-foreground"
                          style={{
                            marginLeft: index === 0 ? '0' : '-50%',
                            marginRight: index === stats.viewsByDate.length - 1 ? '0' : '-50%',
                          }}
                        >
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stats.viewsByDate.length > 0 
                        ? Math.round(stats.totalViews / stats.viewsByDate.length * 10) / 10 
                        : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg per Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.max(...stats.viewsByDate.map((d: { views: number }) => d.views), 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Peak Day</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Daily page views</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-12">
                No data available for this period. Visit your site to generate analytics data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Device Breakdown */}
        {stats.viewsByDevice && Object.keys(stats.viewsByDevice).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Visitors by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(stats.viewsByDevice).map(([device, count]) => {
                  const total = Object.values(stats.viewsByDevice).reduce(
                    (sum: number, c: unknown) => sum + (c as number),
                    0
                  );
                  const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                  return (
                    <div key={device} className="text-center">
                      <div className="text-2xl font-bold">{count as number}</div>
                      <div className="text-sm text-muted-foreground capitalize">{device}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Referrers */}
        {stats.topReferrers && stats.topReferrers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topReferrers.map((ref: { domain: string; visits: number }) => (
                  <div key={ref.domain} className="flex items-center justify-between">
                    <span className="font-medium">{ref.domain}</span>
                    <span className="text-muted-foreground">{ref.visits} visits</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

