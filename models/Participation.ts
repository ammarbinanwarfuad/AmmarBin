import mongoose, { Schema } from "mongoose";
import { IParticipation } from "@/types";

const ParticipationSchema = new Schema<IParticipation>(
  {
    title: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
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
    impact: String,
    images: [String],
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
ParticipationSchema.index({ order: 1, startDate: -1 });
ParticipationSchema.index({ startDate: -1 });
ParticipationSchema.index({ organization: 1 });

export default mongoose.models.Participation || mongoose.model<IParticipation>("Participation", ParticipationSchema);

