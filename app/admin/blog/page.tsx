import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BlogClient } from "./BlogClient";
import { getBlogs } from "@/lib/server/data";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  // Fetch all blogs including unpublished ones for admin
  const blogs = await getBlogs(undefined, true);
  
  return <BlogClient initialBlogs={blogs} />;
}
