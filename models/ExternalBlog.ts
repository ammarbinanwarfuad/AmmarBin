import mongoose, { Schema } from "mongoose";
import { IExternalBlog } from "@/types";

const ExternalBlogSchema = new Schema<IExternalBlog>(
  {
    source: {
      type: String,
      required: true,
      enum: ["gucc", "hashnode"],
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: String,
    excerpt: String,
    featuredImage: String,
    author: {
      type: String,
      default: "Ammar Bin Anwar Fuad",
    },
    url: {
      type: String,
      required: true,
    },
    publishedDate: Date,
    readTime: {
      type: Number,
      default: 0,
    },
    tags: [String],
    lastFetched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
ExternalBlogSchema.index({ source: 1, publishedDate: -1 });
ExternalBlogSchema.index({ slug: 1 }, { unique: true });
ExternalBlogSchema.index({ publishedDate: -1 });

export default mongoose.models.ExternalBlog || mongoose.model<IExternalBlog>("ExternalBlog", ExternalBlogSchema);

