import mongoose, { Schema } from "mongoose";
import { IExperience } from "@/types";

const ExperienceSchema = new Schema<IExperience>(
  {
    company: {
      type: String,
      required: true,
    },
    companyLogo: String,
    role: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false,
    },
    location: String,
    description: String,
    responsibilities: [String],
    skills: [String],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
ExperienceSchema.index({ order: 1, startDate: -1 });
ExperienceSchema.index({ startDate: -1 });
ExperienceSchema.index({ company: 1 });

export default mongoose.models.Experience || mongoose.model<IExperience>("Experience", ExperienceSchema);

