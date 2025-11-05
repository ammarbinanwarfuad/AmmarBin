import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { logActivity } from "@/lib/activity-logger";

export async function POST(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty array of IDs" },
        { status: 400 }
      );
    }

    const messagesToDelete = await Message.find({ _id: { $in: ids } });

    if (messagesToDelete.length === 0) {
      return NextResponse.json(
        { error: "No messages found to delete" },
        { status: 404 }
      );
    }

    const result = await Message.deleteMany({ _id: { $in: ids } });

    await logActivity({
      action: "delete",
      entityType: "messages",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} message(s)`,
      metadata: {
        count: result.deletedCount,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      message: `${result.deletedCount} message(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting messages:", error);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    );
  }
}

