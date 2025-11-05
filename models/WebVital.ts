import mongoose, { Schema, Document } from "mongoose";

export interface IWebVital extends Document {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  url: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

const WebVitalSchema = new Schema<IWebVital>(
  {
    name: { type: String, required: true, index: true },
    value: { type: Number, required: true },
    rating: {
      type: String,
      enum: ["good", "needs-improvement", "poor"],
      required: true,
    },
    url: { type: String, required: true, index: true },
    userAgent: String,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
WebVitalSchema.index({ name: 1, timestamp: -1 });
WebVitalSchema.index({ url: 1, timestamp: -1 });
WebVitalSchema.index({ rating: 1, timestamp: -1 });

export const WebVital =
  mongoose.models.WebVital || mongoose.model<IWebVital>("WebVital", WebVitalSchema);

