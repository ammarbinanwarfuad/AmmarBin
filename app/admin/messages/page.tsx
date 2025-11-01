import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesClient } from "./MessagesClient";

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/contact?page=1&limit=50`, {
    cache: 'no-store',
  });
  const data = await res.json();
  
  return <MessagesClient initialData={data} />;
}
