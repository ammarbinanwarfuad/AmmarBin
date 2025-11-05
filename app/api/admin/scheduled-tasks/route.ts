import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ScheduledTask from "@/models/ScheduledTask";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const tasks = await ScheduledTask.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const task = await ScheduledTask.create(data);

    // Calculate next run time based on schedule
    task.nextRun = calculateNextRun(data.schedule);
    await task.save();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating scheduled task:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { _id, ...updateData } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Recalculate next run if schedule changed
    if (updateData.schedule) {
      updateData.nextRun = calculateNextRun(updateData.schedule);
    }

    const task = await ScheduledTask.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating scheduled task:", error);
    return NextResponse.json(
      { error: "Failed to update scheduled task" },
      { status: 500 }
    );
  }
}

function calculateNextRun(schedule: string): Date {
  const now = new Date();
  const next = new Date(now);

  // Handle simple intervals
  if (schedule === "daily") {
    next.setDate(next.getDate() + 1);
    next.setHours(2, 0, 0, 0); // 2 AM
  } else if (schedule === "weekly") {
    next.setDate(next.getDate() + 7);
    next.setHours(2, 0, 0, 0);
  } else if (schedule === "hourly") {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
  } else {
    // Default: daily at 2 AM
    next.setDate(next.getDate() + 1);
    next.setHours(2, 0, 0, 0);
  }

  return next;
}

