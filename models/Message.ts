import mongoose, { Schema } from "mongoose";
import { IMessage } from "@/types";

const MessageSchema = new Schema<IMessage>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: String,
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    replied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
MessageSchema.index({ createdAt: -1 }); // For sorting newest first
MessageSchema.index({ email: 1 }); // For searching by email
// Compound indexes for common query patterns
MessageSchema.index({ read: 1, createdAt: -1 }); // For filtering unread messages
MessageSchema.index({ replied: 1, createdAt: -1 }); // For filtering replied messages

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

