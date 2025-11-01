import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectsClient } from "./ProjectsClient";
import { getProjects } from "@/lib/server/data";

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  // Fetch all projects including unpublished ones for admin
  const projects = await getProjects({ includeUnpublished: true });
  
  return <ProjectsClient initialProjects={projects} />;
}
