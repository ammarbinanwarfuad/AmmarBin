import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function DashboardRecent() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading recent messages...</p>}>
      <RecentSection />
    </Suspense>
  );
}

