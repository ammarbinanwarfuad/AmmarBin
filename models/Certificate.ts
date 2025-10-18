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

// Performance indexes
CertificateSchema.index({ featured: 1 }); // Speed up featured filter
CertificateSchema.index({ category: 1 }); // Speed up category filter
CertificateSchema.index({ issueDate: -1 }); // Speed up recent certs query
CertificateSchema.index({ published: 1 }); // Speed up published filter
// Compound indexes for common query patterns
CertificateSchema.index({ category: 1, issueDate: -1 }); // Category grouping with date sort
CertificateSchema.index({ published: 1, issueDate: -1 }); // Published certs with date sort

const Certificate =
  models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;

