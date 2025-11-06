import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

async function RecentSection() {
  const recent = await fetchAdminData('/api/admin/recent');
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {((recent as { messages?: Array<{ _id: string; name: string; subject?: string }> })?.messages || []).map((m: { _id: string; name: string; subject?: string }) => (
            <li key={m._id} className="text-sm">
              <span className="font-medium">{m.name}</span> — {m.subject}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RecentSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardRecent() {
  return (
    <Suspense fallback={<RecentSkeleton />}>
      <RecentSection />
    </Suspense>
  );
}

