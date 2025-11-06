import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardRecent } from "./DashboardRecent";

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
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch fast data immediately, stream slow data
  const [links, seo, system, webVitals] = await Promise.all([
    fetchAdminData('/api/admin/link-check'),
    fetchAdminData('/api/admin/seo'),
    fetchAdminData('/api/admin/system'),
    fetchAdminData('/api/admin/web-vitals?days=7'),
  ]);

  return (
    <DashboardClient
      initialData={{
        links,
        seo,
        system,
        webVitals,
      }}
      analyticsSlot={<DashboardAnalytics />}
      recentSlot={<DashboardRecent />}
    />
  );
}
