import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CertificationsClient } from "./CertificationsClient";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export default async function AdminCertificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  // Fetch certifications directly from database (admin sees all, including unpublished)
  let certifications = [];
  
  try {
    await connectDB();
    const certificates = await Certificate.find({})
      .select('_id title issuer category issueDate expiryDate credentialId verificationUrl certificateImage skills description featured published')
      .sort({ issueDate: -1 })
      .lean()
      .maxTimeMS(5000);
    
    certifications = JSON.parse(JSON.stringify(certificates));
  } catch (error) {
    console.error("Error fetching certificates in admin:", error);
    // certifications remains empty array
  }
  
  return <CertificationsClient initialCertifications={certifications} />;
}
