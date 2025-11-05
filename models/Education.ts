import mongoose, { Schema } from "mongoose";
import { IEducation } from "@/types";

const EducationSchema = new Schema<IEducation>(
  {
    institution: {
      type: String,
      required: true,
    },
    institutionLogo: String,
    degree: {
      type: String,
      required: true,
    },
    field: {
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
    grade: String,
    location: String,
    description: String,
    achievements: [String],
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
EducationSchema.index({ order: 1, startDate: -1 });
EducationSchema.index({ startDate: -1 });
EducationSchema.index({ institution: 1 });

export default mongoose.models.Education || mongoose.model<IEducation>("Education", EducationSchema);

