import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/profile`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  const profile = await res.json();
  
  return <SettingsClient initialProfile={profile} />;
}
