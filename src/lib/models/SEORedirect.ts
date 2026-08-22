import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISEORedirect extends Document {
  fromPath: string;
  toPath: string;
  type: "301" | "302";
  isActive: boolean;
  createdAt: Date;
}

const SEORedirectSchema = new Schema<ISEORedirect>(
  {
    fromPath: { type: String, required: true },
    toPath: { type: String, required: true },
    type: { type: String, enum: ["301", "302"], default: "301" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SEORedirectSchema.index({ fromPath: 1 }, { unique: true });

export const SEORedirect: Model<ISEORedirect> =
  mongoose.models.SEORedirect ||
  mongoose.model<ISEORedirect>("SEORedirect", SEORedirectSchema);
