import mongoose, { Schema, Document } from "mongoose";

export interface IPageView extends Document {
  path: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  device?: string; // 'desktop', 'mobile', 'tablet'
  browser?: string;
  sessionId: string;
  duration?: number; // Time spent on page in seconds
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    path: {
      type: String,
      required: true,
      index: true,
    },
    referrer: String,
    userAgent: String,
    ipAddress: String,
    country: String,
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
    },
    browser: String,
    sessionId: {
      type: String,
      required: true,
    },
    duration: Number,
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
PageViewSchema.index({ createdAt: -1 });
PageViewSchema.index({ path: 1, createdAt: -1 });
PageViewSchema.index({ sessionId: 1 });

export default mongoose.models.PageView || mongoose.model<IPageView>("PageView", PageViewSchema);

