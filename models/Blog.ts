import mongoose, { Schema } from "mongoose";
import { IBlog } from "@/types";

const BlogSchema = new Schema<IBlog>(
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
    content: {
      type: String,
      required: true,
    },
    excerpt: String,
    featuredImage: String,
    author: {
      type: String,
      default: "Ammar Bin Anwar Fuad",
    },
    tags: [String],
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    publishedDate: Date,
    readTime: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
// Note: slug index is automatically created by unique: true in schema
BlogSchema.index({ published: 1, publishedDate: -1 }); // Composite index for published + recent
BlogSchema.index({ publishedDate: -1 }); // For date sorting
BlogSchema.index({ createdAt: -1 }); // For analytics queries
BlogSchema.index({ tags: 1 }); // For tag filtering

export default mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

