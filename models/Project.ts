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
    topics: {
      type: [String],
      default: [],
    },
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

// Indexes for common queries
ProjectSchema.index({ dateCreated: -1 });
ProjectSchema.index({ createdAt: -1 }); // For analytics queries
// slug index is automatically created by unique: true in schema
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ published: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ topics: 1 });
// Compound index for featured + date queries
ProjectSchema.index({ featured: 1, dateCreated: -1 });
// Compound index for published + date queries (common for public pages)
ProjectSchema.index({ published: 1, dateCreated: -1 });

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

