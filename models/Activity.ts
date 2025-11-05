import mongoose, { Schema } from "mongoose";

export interface IActivity extends Document {
  action: string; // 'create', 'update', 'delete'
  entityType: string; // 'project', 'blog', 'education', etc.
  entityId: string;
  entityTitle?: string;
  userId: string;
  userEmail: string;
  changes?: Record<string, unknown>; // Before/after values for updates
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "login", "logout", "sync", "backup", "restore", "export", "import"],
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    entityTitle: String,
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1 });
ActivitySchema.index({ userId: 1 });
// Compound indexes for common query patterns
ActivitySchema.index({ entityType: 1, createdAt: -1 }); // For filtering by type and sorting by date
ActivitySchema.index({ action: 1, createdAt: -1 }); // For filtering by action and sorting by date
ActivitySchema.index({ entityType: 1, action: 1, createdAt: -1 }); // For combined filters

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

