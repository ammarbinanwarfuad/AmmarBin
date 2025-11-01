import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MediaClient } from "./MediaClient";

export default async function AdminMediaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  // Fetch initial media data from Cloudinary
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/media`, {
    cache: 'no-store',
  }).catch(() => null);
  
  const media = res ? await res.json().catch(() => ({ resources: [] })) : { resources: [] };
  
  return <MediaClient initialMedia={media} />;
}
