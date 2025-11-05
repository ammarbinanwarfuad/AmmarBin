import mongoose, { Schema } from "mongoose";
import { ISetting } from "@/types";

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

