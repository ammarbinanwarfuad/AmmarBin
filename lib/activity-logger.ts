import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";

interface LogActivityParams {
  action: "create" | "update" | "delete" | "login" | "logout" | "sync" | "backup" | "restore" | "export" | "import";
  entityType: string;
  entityId: string;
  entityTitle?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      // Log without user info if no session (e.g., automated tasks)
      return;
    }

    await Activity.create({
      ...params,
      userId: session.user.email,
      userEmail: session.user.email,
    });
  } catch (error) {
    // Don't throw - activity logging shouldn't break the main flow
    console.error("Failed to log activity:", error);
  }
}

