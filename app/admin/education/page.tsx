import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EducationClient } from "./EducationClient";
import { connectDB } from "@/lib/db";
import Education from "@/models/Education";
import type { Types } from "mongoose";

interface EducationDoc {
  _id: Types.ObjectId;
  institution: string;
  degree: string;
  field: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  grade?: string;
  location?: string;
  description?: string;
  achievements?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function AdminEducationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  
  await connectDB();
  
  let serializedEducation = [];
  
  const education = await Education.find().sort({ startDate: -1 }).lean<EducationDoc[]>().catch((error) => {
    console.error('Error loading education:', error);
    return [];
  });
  
  // Convert MongoDB objects to plain objects and serialize dates
  serializedEducation = education.map((edu) => ({
    ...edu,
    _id: edu._id.toString(),
    startDate: edu.startDate?.toISOString() || "",
    endDate: edu.endDate?.toISOString() || "",
    current: edu.current || false,
    createdAt: edu.createdAt?.toISOString(),
    updatedAt: edu.updatedAt?.toISOString(),
  }));
  
  return <EducationClient initialEducation={serializedEducation} />;
}
