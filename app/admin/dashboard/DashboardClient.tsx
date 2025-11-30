"use client";

import { DynamicMotion } from "@/components/DynamicMotion";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Github,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { mutate } from 'swr';

interface DashboardClientProps {
  initialData?: {
    analytics?: unknown;
    system?: unknown;
  } | null;
  analyticsSlot?: React.ReactNode;
  recentSlot?: React.ReactNode;
}

export function DashboardClient({ initialData, analyticsSlot }: DashboardClientProps) {
  const [showSeoDetails, setShowSeoDetails] = useState(false);
  
  // ✅ OPTIMIZED: Use batch endpoint for critical data (analytics + system)
  const { data: batchData, isLoading, error: batchError } = useSWR(
    '/api/admin/batch?endpoints=analytics,system',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );
  
  // Extract data from batch response
  const analytics = batchData?.analytics || initialData?.analytics;
  const system = batchData?.system || initialData?.system;
  
  // ✅ PROGRESSIVE: Load non-critical data separately (won't block initial render)
  const { data: seo } = useSWR('/api/admin/seo', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: webVitals } = useSWR('/api/admin/web-vitals?days=7', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: recentMessages } = useSWR('/api/contact?limit=5', fetcher, {
    revalidateOnFocus: false,
  });

  // Log errors to console for debugging
  if (batchError) console.error('Batch API error:', batchError);

  // ✅ OPTIMIZED:  // Show spinner only if critical data is loading
  if (isLoading && !analytics && !system) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Only show error if we have errors AND no data at all after loading
  if (batchError && !analytics && !system) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to Load Dashboard</CardTitle>
            <CardDescription>
              There was an error loading the dashboard data. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const syncGitHub = async () => {
    const toastId = toast.loading("Syncing GitHub projects...", {
      duration: Infinity, // Keep toast visible until we explicitly update it
    });
    try {
      const response = await fetch("/api/projects/sync-github", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync GitHub projects" }));
        const errorMsg = errorData.error || `Failed to sync GitHub projects: ${response.statusText}`;
        const helpMsg = errorData.help;
        
        toast.error(
          <div>
            <div className="font-semibold">{errorMsg}</div>
            {helpMsg && <div className="text-xs mt-1">{helpMsg}</div>}
          </div>,
          { id: toastId, duration: 8000 }
        );
        return;
      }
      
      const data = await response.json();
      toast.success(`Synced ${data.count} projects from GitHub!`, { id: toastId });
      // Refresh SWR caches so other pages (e.g., Admin Projects) update immediately
      mutate('/api/projects');
    } catch (error) {
      console.error("Error syncing GitHub projects:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing GitHub projects", { id: toastId });
    }
  };

  const syncBlogs = async () => {
    const toastId = toast.loading("Syncing external blogs...", {
      duration: Infinity, // Keep toast visible until we explicitly update it
    });
    try {
      const response = await fetch("/api/blog/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync blogs" }));
        const errorMsg = errorData.details || errorData.error || `Failed to sync blogs: ${response.statusText}`;
        toast.error(errorMsg, { id: toastId });
        console.error("Blog sync error:", errorData);
        return;
      }
      
      const data = await response.json();
      
      // Show debug info in console if count is 0
      if (data.count === 0) {
        console.warn("No blogs synced. Debug info:", data.debug);
        toast.success("No blog post found", { id: toastId });
      } else {
        toast.success(`Synced ${data.count} blog posts! (Hashnode: ${data.sources?.hashnode || 0}, GUCC: ${data.sources?.gucc || 0})`, { id: toastId });
      }
      // Refresh SWR caches so other pages (e.g., Admin Blog) update immediately
      mutate('/api/blog');
      mutate('/api/admin/recent');
    } catch (error) {
      console.error("Error syncing blogs:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing blogs", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="mx-auto max-w-7xl">
        <DynamicMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back! Manage your portfolio content here.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Projects</CardTitle>
                <CardDescription className="text-xs">Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">
                  {analytics?.totals?.projects ?? '...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  7d: {analytics?.last7d?.projects ?? 0}, 30d: {analytics?.last30d?.projects ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Blogs</CardTitle>
                <CardDescription className="text-xs">Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">
                  {analytics?.totals?.blogs ?? '...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  7d: {analytics?.last7d?.blogs ?? 0}, 30d: {analytics?.last30d?.blogs ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Messages</CardTitle>
                <CardDescription className="text-xs">Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">
                  {analytics?.totals?.messages ?? '...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  7d: {analytics?.last7d?.messages ?? 0}, 30d: {analytics?.last30d?.messages ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Skills</CardTitle>
                <CardDescription className="text-xs">Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">
                  {analytics?.totals?.skills ?? '...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  7d: {analytics?.last7d?.skills ?? 0}, 30d: {analytics?.last30d?.skills ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics glance - Streamed */}
          {analyticsSlot}

          {/* Sync Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" /> GitHub Projects
                </CardTitle>
                <CardDescription>
                  Sync your latest GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={syncGitHub} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Sync GitHub Projects
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> External Blogs
                </CardTitle>
                <CardDescription>
                  Fetch latest posts from GUCC & Hashnode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={syncBlogs} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Sync Blogs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity - Streamed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>No latest messages</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages?.messages && recentMessages.messages.length > 0 ? (
                  <div className="space-y-3">
                    {recentMessages.messages.slice(0, 5).map((msg: { _id: string; name: string; email: string; subject?: string; message: string; read: boolean; createdAt: string }) => (
                      <div key={msg._id} className="border-b border-border pb-3 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{msg.name}</div>
                            <div className="text-xs text-muted-foreground">{msg.email}</div>
                            {msg.subject && (
                              <div className="text-xs font-medium mt-1">{msg.subject}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {msg.message}
                            </div>
                          </div>
                          {!msg.read && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No messages yet</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>SEO Issues</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>{seo ? `${(seo as { issues?: unknown[] })?.issues?.length || 0} issues across ${(seo as { total?: number })?.total || 0} posts` : 'Loading...'}</span>
                  {seo && (
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setShowSeoDetails((s) => !s)}
                    >
                      {showSeoDetails ? 'Hide Details' : 'See Details'}
                    </button>
                  )}
                </div>
                {(seo as { issues?: Array<{ slug: string; title: string; missingMeta?: boolean; missingImage?: boolean; shortContent?: boolean }> })?.issues && showSeoDetails && (
                  <ul className="space-y-2 text-sm">
                    {((seo as { issues?: Array<{ slug: string; title: string; missingMeta?: boolean; missingImage?: boolean; shortContent?: boolean }> })?.issues || []).map((i: { slug: string; title: string; missingMeta?: boolean; missingImage?: boolean; shortContent?: boolean }) => (
                      <li key={i.slug} className="border rounded p-2">
                        <div className="font-medium">{i.title}</div>
                        <div className="text-xs text-muted-foreground">/{i.slug}</div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {!i.missingMeta ? null : <span className="text-red-600">Missing meta description</span>}
                          {!i.missingImage ? null : <span className="text-red-600">Missing cover image</span>}
                          {!i.shortContent ? null : <span className="text-yellow-600">Short content (&lt; 300 words)</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System health */}
          <div className="mt-8">
            <Card>
              <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm">DB latency: {(system as { dbLatencyMs?: number })?.dbLatencyMs} ms</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ENV: NEXTAUTH_URL {(system as { env?: { NEXTAUTH_URL?: boolean } })?.env?.NEXTAUTH_URL ? '✓' : '✗'}, 
                  Cloudinary {(system as { env?: { CLOUDINARY?: boolean } })?.env?.CLOUDINARY ? '✓' : '✗'}, 
                  GitHub {(system as { env?: { GITHUB_USERNAME?: boolean } })?.env?.GITHUB_USERNAME ? '✓' : '✗'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Web Vitals */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Web Vitals Performance</CardTitle>
                <CardDescription>Core Web Vitals metrics (last 7 days)</CardDescription>
              </CardHeader>
              <CardContent>
                {(webVitals as { stats?: Record<string, { avg: number; good: number; needsImprovement: number; poor: number }> })?.stats ? (
                  <div className="space-y-4">
                    {['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].map((vital) => {
                      const stats = (webVitals as { stats?: Record<string, { avg: number; good: number; needsImprovement: number; poor: number }> })?.stats?.[vital];
                      if (!stats) return null;
                      
                      const ratingColor = {
                        good: 'text-green-600',
                        'needs-improvement': 'text-yellow-600',
                        poor: 'text-red-600',
                      }[stats.avg < (vital === 'CLS' ? 0.1 : vital === 'TTFB' ? 800 : vital === 'FCP' ? 1800 : vital === 'LCP' ? 2500 : vital === 'INP' ? 200 : 100) ? 'good' : stats.avg < (vital === 'CLS' ? 0.25 : vital === 'TTFB' ? 1800 : vital === 'FCP' ? 3000 : vital === 'LCP' ? 4000 : vital === 'INP' ? 500 : 300) ? 'needs-improvement' : 'poor'] || 'text-gray-600';
                      
                      return (
                        <div key={vital} className="border-b border-border pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{vital}</span>
                            <span className={`text-sm ${ratingColor}`}>
                              {vital === 'CLS' ? stats.avg.toFixed(3) : `${stats.avg}ms`}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>✓ {stats.good}</span>
                            <span className="text-yellow-600">⚠ {stats.needsImprovement}</span>
                            <span className="text-red-600">✗ {stats.poor}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                      Total metrics collected: {(webVitals as { total?: number })?.total || 0}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Loading metrics...</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Note about implementation */}
          <Card className="mt-8 bg-accent/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The full admin CMS implementation for CRUD
                operations on each section is ready to be built out. The API
                routes, models, and basic structure are in place. Individual
                admin pages for managing Skills, Projects, Experience, etc. can
                be added as needed.
              </p>
            </CardContent>
          </Card>
        </DynamicMotion>
      </div>
    </div>
  );
}

