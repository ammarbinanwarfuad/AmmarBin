import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ScheduledTask from "@/models/ScheduledTask";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    await ScheduledTask.findByIdAndDelete(id);

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting scheduled task:", error);
    return NextResponse.json(
      { error: "Failed to delete scheduled task" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const task = await ScheduledTask.findById(id);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Execute the task manually
    const startTime = Date.now();
    let success = false;
    let message = "";

    try {
      // Execute based on task type
      if (task.type === "github-sync") {
        const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/projects/sync-github`, {
          method: "POST",
        });
        success = response.ok;
        const data = await response.json();
        message = success ? `Synced ${data.count || 0} projects` : "Failed to sync";
      } else if (task.type === "blog-sync") {
        const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/blog/sync`, {
          method: "POST",
        });
        success = response.ok;
        const data = await response.json();
        message = success ? `Synced ${data.count || 0} blogs` : "Failed to sync";
      } else {
        message = "Task type not implemented";
      }

      const duration = Date.now() - startTime;

      // Update task
      task.lastRun = new Date();
      task.nextRun = calculateNextRun(task.schedule);
      task.runCount = (task.runCount || 0) + 1;
      if (!success) {
        task.errorCount = (task.errorCount || 0) + 1;
      }
      task.lastResult = {
        success,
        message,
        duration,
      };
      await task.save();
    } catch (error) {
      task.lastResult = {
        success: false,
        message: String(error),
        duration: Date.now() - startTime,
      };
      task.errorCount = (task.errorCount || 0) + 1;
      await task.save();
    }

    return NextResponse.json({
      success: true,
      result: task.lastResult,
    });
  } catch (error) {
    console.error("Error executing scheduled task:", error);
    return NextResponse.json(
      { error: "Failed to execute scheduled task" },
      { status: 500 }
    );
  }
}

function calculateNextRun(schedule: string): Date {
  const now = new Date();
  const next = new Date(now);

  if (schedule === "daily") {
    next.setDate(next.getDate() + 1);
    next.setHours(2, 0, 0, 0);
  } else if (schedule === "weekly") {
    next.setDate(next.getDate() + 7);
    next.setHours(2, 0, 0, 0);
  } else if (schedule === "hourly") {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(2, 0, 0, 0);
  }

  return next;
}

