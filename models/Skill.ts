import mongoose, { Schema } from "mongoose";
import { ISkill } from "@/types";

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    proficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    icon: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for admin sorting/filtering
SkillSchema.index({ category: 1 });
SkillSchema.index({ order: 1 });

export default mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);

