import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminData } from "@/lib/admin/fetch-with-auth";

async function AnalyticsSection() {
  const analytics = await fetchAdminData('/api/admin/analytics');
  
  // Show error state if analytics failed to load
  if (!analytics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ Unable to load analytics data. Please refresh the page or check your connection.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Projects', value: (analytics as { totals?: { projects?: number } })?.totals?.projects },
        { label: 'Blogs', value: (analytics as { totals?: { blogs?: number } })?.totals?.blogs },
        { label: 'Messages', value: (analytics as { totals?: { messages?: number } })?.totals?.messages },
        { label: 'Skills', value: (analytics as { totals?: { skills?: number } })?.totals?.skills },
      ].map((m) => (
        <Card key={m.label}>
          <CardHeader>
            <CardTitle>{m.label}</CardTitle>
            <CardDescription>Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{m.value ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              7d: {(analytics as { last7d?: Record<string, number> })?.last7d?.[m.label.toLowerCase()] ?? 0}, 
              30d: {(analytics as { last30d?: Record<string, number> })?.last30d?.[m.label.toLowerCase()] ?? 0}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardAnalytics() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsSection />
    </Suspense>
  );
}

