import mongoose, { Schema } from "mongoose";
import { IProfile } from "@/types";

const ProfileSchema = new Schema<IProfile>(
  {
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    resumePDF: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    location: String,
    socialLinks: {
      github: String,
      linkedin: String,
      facebook: String,
      instagram: String,
      twitter: String,
      hashnode: String,
      portfolio: String,
    },
    heroContent: {
      heading: String,
      subheading: String,
      description: String,
    },
    aboutContent: String,
    languages: [String],
    hobbies: [String],
  },
  {
    timestamps: true,
  }
);

// Index for email lookups (if needed in future)
ProfileSchema.index({ email: 1 });

export default mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

