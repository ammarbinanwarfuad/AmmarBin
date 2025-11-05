"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Filter, X } from "lucide-react";
import { format } from "date-fns";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Activity {
  _id: string;
  action: string;
  entityType: string;
  entityTitle?: string;
  userEmail: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export default function AdminActivityPage() {
  const { status } = useSession();
  const router = useRouter();
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const queryParams = new URLSearchParams();
  if (entityFilter) queryParams.set("entityType", entityFilter);
  if (actionFilter) queryParams.set("action", actionFilter);

  const { data, isLoading, error } = useSWR(
    `/api/admin/activity?${queryParams.toString()}`,
    fetcher
  );

  const activities: Activity[] = data?.activities || [];
  const entityTypes = Array.from(new Set(activities.map((a) => a.entityType)));
  const actions = Array.from(new Set(activities.map((a) => a.action)));

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "text-green-600 bg-green-50";
      case "update":
        return "text-blue-600 bg-blue-50";
      case "delete":
        return "text-red-600 bg-red-50";
      case "sync":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground mt-2">
            Track all changes and actions in your portfolio
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Entity Type</label>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All Types</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All Actions</option>
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
              {(entityFilter || actionFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEntityFilter("");
                      setActionFilter("");
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              {data?.total || 0} total activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-destructive">Failed to load activities</p>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.entityType}</span>
                        {activity.entityTitle && (
                          <>
                            <span className="text-muted-foreground">—</span>
                            <span className="text-muted-foreground">{activity.entityTitle}</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        by {activity.userEmail} • {format(new Date(activity.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

