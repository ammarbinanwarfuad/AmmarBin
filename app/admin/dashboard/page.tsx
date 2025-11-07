import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardRecent } from "./DashboardRecent";
import { fetchAdminData } from "@/lib/admin/fetch-with-auth";

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
