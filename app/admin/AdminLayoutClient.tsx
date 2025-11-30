"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Award,
  Code,
  Briefcase,
  GraduationCap,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  KeyRound,
  BadgeCheck,
  History,
  Image as ImageIcon,
  BarChart3,
  Database,
  Download,
  Clock,
  Calendar,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, router, pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      // Clear all client-side storage
      if (typeof window !== 'undefined') {
        // Clear cache storage
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Clear local storage
        localStorage.clear();
        
        // Clear session storage
        sessionStorage.clear();
      }
      
      // Sign out with redirect disabled
      await signOut({ redirect: false });
      
      // Wait longer for session destruction to complete (300ms for production)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force hard navigation to login page with cache bust and logout flag
      window.location.href = `/admin/login?logout=true&t=${Date.now()}`;
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: manual navigation with cache bust
      window.location.href = `/admin/login?logout=true&t=${Date.now()}`;
    }
  };

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ✅ FIXED: Redirect to login if not authenticated, but don't show skeleton
  // Let each page handle its own loading state with custom skeletons
if (status === "loading") {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
  
  // If not authenticated, redirect will happen via useEffect
  if (!session) {
    return null;
  }

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/calendar", icon: Calendar, label: "Calendar" },
    { href: "/admin/activity", icon: History, label: "Activity Log" },
    { href: "/admin/media", icon: ImageIcon, label: "Media Library" },
    { href: "/admin/skills", icon: Award, label: "Skills" },
    { href: "/admin/projects", icon: Code, label: "Projects" },
    { href: "/admin/experience", icon: Briefcase, label: "Experience" },
    { href: "/admin/education", icon: GraduationCap, label: "Education" },
    { href: "/admin/certifications", icon: BadgeCheck, label: "Certifications" },
    { href: "/admin/blog", icon: FileText, label: "Blog" },
    { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
    { href: "/admin/scheduled-tasks", icon: Clock, label: "Scheduled Tasks" },
    { href: "/admin/backup", icon: Database, label: "Backup & Restore" },
    { href: "/admin/export", icon: Download, label: "Export & Import" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/change-password", icon: KeyRound, label: "Change Password" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {session.user?.email}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-foreground"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="w-full gap-2 hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
