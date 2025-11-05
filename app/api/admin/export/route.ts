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

    const { collections, format = "json" } = await request.json();

    const exportData: Record<string, unknown[]> = {};
    const allCollections = [
      { name: "projects", model: Project },
      { name: "blogs", model: Blog },
      { name: "education", model: Education },
      { name: "experience", model: Experience },
      { name: "skills", model: Skill },
      { name: "certificates", model: Certificate },
      { name: "participations", model: Participation },
    ];

    const collectionsToExport = collections || allCollections.map((c) => c.name);

    for (const col of allCollections) {
      if (collectionsToExport.includes(col.name)) {
        const data = await col.model.find({}).lean();
        exportData[col.name] = data;
      }
    }

    // Log activity
    await logActivity({
      action: "export",
      entityType: "data",
      entityId: "export",
      entityTitle: `Data Export (${format.toUpperCase()})`,
      metadata: {
        collections: collectionsToExport,
        format,
        totalDocuments: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0),
      },
    });

    if (format === "csv") {
      // Convert to CSV format (simplified - one collection at a time)
      const csv = Object.entries(exportData)
        .map(([collectionName, data]) => {
          if (data.length === 0) return `${collectionName}\nNo data\n\n`;
          
          const headers = Object.keys(data[0] as Record<string, unknown>).join(",");
          const rows = data.map((item) =>
            Object.values(item as Record<string, unknown>)
              .map((val) => {
                if (val === null || val === undefined) return "";
                if (typeof val === "object") return JSON.stringify(val).replace(/"/g, '""');
                return String(val).replace(/"/g, '""');
              })
              .map((val) => `"${val}"`)
              .join(",")
          );
          
          return `${collectionName}\n${headers}\n${rows.join("\n")}\n\n`;
        })
        .join("\n---\n\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="portfolio-export-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: exportData,
      timestamp: new Date().toISOString(),
      collections: Object.keys(exportData),
      totalDocuments: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0),
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

