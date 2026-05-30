import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";
import { connectDB } from "@/lib/db";
import { getCached, CACHE_TTL } from "@/lib/redis-cache";

export default async function AdminDashboard() {
  // NOTE: We do NOT redirect here if session is null.
  // proxy.ts middleware handles unauthenticated access at the edge.
  // A server-side redirect here caused an infinite loop:
  //   getServerSession null → redirect to /admin/login
  //   → login page redirected back → getServerSession null again.
  // AdminLayoutClient handles the client-side auth check as fallback.
  const session = await getServerSession(authOptions).catch(() => null);

  // ✅ OPTIMIZED: Prefetch critical data server-side for instant render
  // ⚠️ IMPORTANT: Wrapped in try-catch to prevent login blocking
  let initialData = null;
  if (!session) {
    // Not authenticated — skip data fetching, client will redirect
    return <DashboardClient initialData={null} />;
  }

  try {
    await connectDB();

    // Fetch analytics and system data in parallel server-side with timeout
    const fetchWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T | null> => {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
      return Promise.race([promise, timeout]);
    };

    const [analytics, systemData] = await Promise.all([
      // Fetch analytics with caching and timeout
      fetchWithTimeout(
        getCached(
          'analytics:admin',
          async () => {
            const Project = (await import("@/models/Project")).default;
            const Blog = (await import("@/models/Blog")).default;
            const Message = (await import("@/models/Message")).default;
            const Skill = (await import("@/models/Skill")).default;

            const now = new Date();
            const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const [
              projects, blogs, messages, skills,
              p7, b7, m7, s7,
              p30, b30, m30, s30,
            ] = await Promise.all([
              Project.countDocuments({}).maxTimeMS(500),
              Blog.countDocuments({}).maxTimeMS(500),
              Message.countDocuments({}).maxTimeMS(500),
              Skill.countDocuments({}).maxTimeMS(500),
              Project.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
              Blog.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
              Message.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
              Skill.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(500),
              Project.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
              Blog.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
              Message.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
              Skill.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(500),
            ]);

            return {
              totals: { projects, blogs, messages, skills },
              last7d: { projects: p7, blogs: b7, messages: m7, skills: s7 },
              last30d: { projects: p30, blogs: b30, messages: m30, skills: s30 },
              generatedAt: now.toISOString(),
            };
          },
          CACHE_TTL.ANALYTICS
        ),
        2000 // 2 second timeout
      ).catch(() => null),

      // Fetch system health with timeout
      fetchWithTimeout(
        (async () => {
          const Message = (await import("@/models/Message")).default;
          const startTime = Date.now();
          const [messageCount, unreadCount] = await Promise.all([
            Message.countDocuments().maxTimeMS(500),
            Message.countDocuments({ read: false }).maxTimeMS(500),
          ]);
          const dbLatencyMs = Date.now() - startTime;

          return {
            database: 'connected',
            messageCount,
            unreadCount,
            dbLatencyMs,
            env: {
              NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
              CLOUDINARY: !!(
                process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET
              ),
              GITHUB_USERNAME: !!process.env.GITHUB_USERNAME,
            },
            nodeVersion: process.version,
            platform: process.platform,
            timestamp: new Date().toISOString(),
          };
        })(),
        2000 // 2 second timeout
      ).catch(() => null),
    ]);

    // Only set initialData if we got valid data
    if (analytics || systemData) {
      initialData = {
        analytics: analytics || undefined,
        system: systemData || undefined,
      };
    }
  } catch (error) {
    console.error('Failed to prefetch dashboard data:', error);
    // Continue anyway - client will fetch data
    // This ensures login always works even if DB is slow/down
  }

  return <DashboardClient initialData={initialData} />;
}
