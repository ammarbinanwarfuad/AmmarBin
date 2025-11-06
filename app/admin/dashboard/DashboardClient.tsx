"use client";

import Link from "next/link";
import { DynamicMotion } from "@/components/DynamicMotion";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Briefcase,
  GraduationCap,
  Settings,
  MessageSquare,
  Code,
  Award,
  Github,
  RefreshCw,
  BarChart3,
  Calendar,
  History,
  Image as ImageIcon,
  Clock,
  Database,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { mutate } from 'swr';

interface DashboardClientProps {
  initialData: {
    links?: unknown;
    seo?: unknown;
    system?: unknown;
    webVitals?: unknown;
  };
  analyticsSlot?: React.ReactNode;
  recentSlot?: React.ReactNode;
}

export function DashboardClient({ initialData, analyticsSlot, recentSlot }: DashboardClientProps) {
  const [showLinkDetails, setShowLinkDetails] = useState(false);
  const [showSeoDetails, setShowSeoDetails] = useState(false);
  
  // Use SWR with fallbackData for instant initial render + real-time updates
  const { data: links } = useSWR('/api/admin/link-check', fetcher, {
    fallbackData: initialData.links,
  });
  const { data: seo } = useSWR('/api/admin/seo', fetcher, {
    fallbackData: initialData.seo,
  });
  const { data: system } = useSWR('/api/admin/system', fetcher, {
    fallbackData: initialData.system,
  });
  const { data: webVitals } = useSWR('/api/admin/web-vitals?days=7', fetcher, {
    fallbackData: initialData.webVitals,
  });

  const syncGitHub = async () => {
    toast.loading("Syncing GitHub projects...");
    try {
      const response = await fetch("/api/projects/sync-github", {
        method: "POST",
      });
      toast.dismiss();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync GitHub projects" }));
        toast.error(errorData.error || `Failed to sync GitHub projects: ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      toast.success(`Synced ${data.count} projects from GitHub!`);
      // Refresh SWR caches so other pages (e.g., Admin Projects) update immediately
      mutate('/api/projects');
    } catch (error) {
      toast.dismiss();
      console.error("Error syncing GitHub projects:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing GitHub projects");
    }
  };

  const syncBlogs = async () => {
    toast.loading("Syncing external blogs...");
    try {
      const response = await fetch("/api/blog/sync", {
        method: "POST",
      });
      toast.dismiss();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync blogs" }));
        const errorMsg = errorData.details || errorData.error || `Failed to sync blogs: ${response.statusText}`;
        toast.error(errorMsg);
        console.error("Blog sync error:", errorData);
        return;
      }
      
      const data = await response.json();
      
      // Show debug info in console if count is 0
      if (data.count === 0) {
        console.warn("No blogs synced. Debug info:", data.debug);
        toast.success("No blog post found");
      } else {
        toast.success(`Synced ${data.count} blog posts! (Hashnode: ${data.sources?.hashnode || 0}, GUCC: ${data.sources?.gucc || 0})`);
      }
      // Refresh SWR caches so other pages (e.g., Admin Blog) update immediately
      mutate('/api/blog');
      mutate('/api/admin/recent');
    } catch (error) {
      toast.dismiss();
      console.error("Error syncing blogs:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing blogs");
    }
  };

  const quickActions = [
    {
      title: "Analytics",
      description: "View visitor analytics and insights",
      icon: BarChart3,
      href: "/admin/analytics",
    },
    {
      title: "Calendar",
      description: "Plan and view blog posts calendar",
      icon: Calendar,
      href: "/admin/calendar",
    },
    {
      title: "Activity Log",
      description: "Track all changes and actions",
      icon: History,
      href: "/admin/activity",
    },
    {
      title: "Media Library",
      description: "Browse and manage uploaded assets",
      icon: ImageIcon,
      href: "/admin/media",
    },
    {
      title: "Skills",
      description: "Manage your skills and proficiency levels",
      icon: Award,
      href: "/admin/skills",
    },
    {
      title: "Projects",
      description: "Add and manage your projects",
      icon: Code,
      href: "/admin/projects",
    },
    {
      title: "Experience",
      description: "Update your work experience",
      icon: Briefcase,
      href: "/admin/experience",
    },
    {
      title: "Education",
      description: "Manage your educational background",
      icon: GraduationCap,
      href: "/admin/education",
    },
    {
      title: "Blog",
      description: "Create and manage blog posts",
      icon: FileText,
      href: "/admin/blog",
    },
    {
      title: "Messages",
      description: "View contact form submissions",
      icon: MessageSquare,
      href: "/admin/messages",
    },
    {
      title: "Scheduled Tasks",
      description: "Automate recurring tasks",
      icon: Clock,
      href: "/admin/scheduled-tasks",
    },
    {
      title: "Backup & Restore",
      description: "Backup and restore database",
      icon: Database,
      href: "/admin/backup",
    },
    {
      title: "Export & Import",
      description: "Export or import data",
      icon: Download,
      href: "/admin/export",
    },
    {
      title: "Settings",
      description: "Configure site settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

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

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <DynamicMotion
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <action.icon className="h-8 w-8 mb-2 text-primary" />
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </DynamicMotion>
            ))}
          </div>

          {/* Recent activity - Streamed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            {recentSlot}
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

          {/* Link checker summary */}
          <div className="mt-8">
            <Card>
              <CardHeader><CardTitle>Broken Link Checker</CardTitle><CardDescription>Scans project Live and GitHub links</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>{links ? `${(links as { broken?: unknown[] })?.broken?.length || 0} projects with issues` : 'Running...'}</span>
                  {links && (
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setShowLinkDetails((s) => !s)}
                    >
                      {showLinkDetails ? 'Hide Details' : 'See Details'}
                    </button>
                  )}
                </div>
                {(links as { broken?: Array<{ title: string; live: { ok: boolean; url?: string; status?: number }; github: { ok: boolean; url?: string; status?: number } }> })?.broken && showLinkDetails && (
                  <ul className="space-y-2 text-sm">
                    {((links as { broken?: Array<{ title: string; live: { ok: boolean; url?: string; status?: number }; github: { ok: boolean; url?: string; status?: number } }> })?.broken || []).map((row: { title: string; live: { ok: boolean; url?: string; status?: number }; github: { ok: boolean; url?: string; status?: number } }, idx: number) => (
                      <li key={idx} className="border rounded p-2">
                        <div className="font-medium">{row.title}</div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <span className={row.live.ok ? 'text-green-600' : 'text-red-600'}>
                            Live: {row.live.url || '—'} {row.live.ok ? '(OK)' : `(status ${row.live.status || 'ERR'})`}
                          </span>
                          <span className={row.github.ok ? 'text-green-600' : 'text-red-600'}>
                            GitHub: {row.github.url || '—'} {row.github.ok ? '(OK)' : `(status ${row.github.status || 'ERR'})`}
                          </span>
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

