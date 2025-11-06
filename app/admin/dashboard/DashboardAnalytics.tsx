import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Internal API fetcher for server-side
async function fetchAdminData(url: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}${url}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function AnalyticsSection() {
  const analytics = await fetchAdminData('/api/admin/analytics');
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {analytics && [
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
            <div className="text-3xl font-bold">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">
              7d: {(analytics as { last7d?: Record<string, number> })?.last7d?.[m.label.toLowerCase()]}, 
              30d: {(analytics as { last30d?: Record<string, number> })?.last30d?.[m.label.toLowerCase()]}
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

