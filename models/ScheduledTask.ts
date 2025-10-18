import mongoose, { Schema } from "mongoose";

export interface IScheduledTask extends Document {
  name: string;
  type: string; // 'github-sync', 'blog-sync', 'backup', 'cleanup', etc.
  schedule: string; // Cron expression or interval
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  lastResult?: {
    success: boolean;
    message: string;
    duration?: number;
  };
  runCount: number;
  errorCount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledTaskSchema = new Schema<IScheduledTask>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["github-sync", "blog-sync", "backup", "cleanup", "link-check", "seo-check"],
    },
    schedule: {
      type: String,
      required: true, // e.g., "0 2 * * *" for daily at 2 AM, or "daily", "weekly", "hourly"
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    lastRun: Date,
    nextRun: Date,
    lastResult: {
      success: Boolean,
      message: String,
      duration: Number,
    },
    runCount: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ScheduledTaskSchema.index({ enabled: 1, nextRun: 1 });
ScheduledTaskSchema.index({ type: 1 });

export default mongoose.models.ScheduledTask || mongoose.model<IScheduledTask>("ScheduledTask", ScheduledTaskSchema);

