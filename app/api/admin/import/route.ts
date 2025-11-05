import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity-logger";
import Project from "@/models/Project";
import Blog from "@/models/Blog";
import Education from "@/models/Education";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";
import Certificate from "@/models/Certificate";
import Participation from "@/models/Participation";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { data, clearExisting = false } = await request.json();

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid import data" },
        { status: 400 }
      );
    }

    const models: Record<string, typeof Project> = {
      projects: Project,
      blogs: Blog,
      education: Education,
      experience: Experience,
      skills: Skill,
      certificates: Certificate,
      participations: Participation,
    };

    const imported: Record<string, number> = {};

    for (const [collectionName, documents] of Object.entries(data)) {
      const Model = models[collectionName];
      if (!Model || !Array.isArray(documents)) continue;

      // Clear existing if requested
      if (clearExisting) {
        await Model.deleteMany({});
      }

      // Insert documents
      if (documents.length > 0) {
        // Remove _id to allow MongoDB to generate new ones
        const cleanDocs = documents.map((doc: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, __v, ...rest } = doc;
          return rest;
        });

        await Model.insertMany(cleanDocs, { ordered: false });
      }

      imported[collectionName] = documents.length;
    }

    // Log activity
    await logActivity({
      action: "import",
      entityType: "data",
      entityId: "import",
      entityTitle: "Data Import",
      metadata: {
        collections: Object.keys(imported),
        documentsImported: Object.values(imported).reduce((sum, count) => sum + count, 0),
        clearExisting,
      },
    });

    return NextResponse.json({
      success: true,
      imported,
      totalDocuments: Object.values(imported).reduce((sum, count) => sum + count, 0),
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}

