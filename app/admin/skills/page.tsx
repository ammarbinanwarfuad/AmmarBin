import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkillsClient } from "./SkillsClient";

export default async function AdminSkillsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/skills`, {
    cache: 'no-store',
  });
  const { skills } = await res.json();
  
  return <SkillsClient initialSkills={skills} />;
}
