import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminData } from "@/lib/admin/fetch-with-auth";

async function RecentSection() {
  const recent = await fetchAdminData('/api/admin/recent');
  
  // Show error state if recent data failed to load
  if (!recent) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ⚠️ Unable to load recent messages. Please refresh the page.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const messages = (recent as { messages?: Array<{ _id: string; name: string; subject?: string }> })?.messages || [];
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent messages</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m: { _id: string; name: string; subject?: string }) => (
              <li key={m._id} className="text-sm">
                <span className="font-medium">{m.name}</span> — {m.subject || 'No subject'}
              </li>
            ))}
          </ul>
        )}
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

