import mongoose, { Schema } from "mongoose";
import { IProject } from "@/types";

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    techStack: [String],
    category: {
      type: String,
      default: "",
    },
    liveUrl: String,
    githubUrl: String,
    videoUrl: String,
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["manual", "github"],
      default: "manual",
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
// Note: slug index is automatically created by unique: true in schema
ProjectSchema.index({ published: 1, dateCreated: -1 }); // Composite index for published + recent
ProjectSchema.index({ featured: 1, dateCreated: -1 }); // Composite index for featured + date
ProjectSchema.index({ featured: 1 }); // Speed up featured filter
ProjectSchema.index({ dateCreated: -1 }); // For date sorting
ProjectSchema.index({ createdAt: -1 }); // For analytics queries
ProjectSchema.index({ category: 1 }); // For category filtering
ProjectSchema.index({ techStack: 1 }); // For tech stack filtering

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

