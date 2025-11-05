import mongoose, { Schema, models } from "mongoose";
import type { ICertificate } from "@/types";

const CertificateSchema = new Schema<ICertificate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    credentialId: {
      type: String,
      default: "",
    },
    verificationUrl: {
      type: String,
      default: "",
    },
    certificateImage: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
CertificateSchema.index({ category: 1 });
CertificateSchema.index({ issueDate: -1 });
CertificateSchema.index({ featured: 1 });
CertificateSchema.index({ published: 1 });
// Compound index for aggregation queries (category grouping)
CertificateSchema.index({ category: 1, issueDate: -1 });
// Compound index for published + date queries (common for public pages)
CertificateSchema.index({ published: 1, issueDate: -1 });

const Certificate =
  models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;

