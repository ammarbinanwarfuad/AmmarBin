import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExperienceClient from "./ExperienceClient";

export default async function AdminExperiencePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  return <ExperienceClient />;
}
