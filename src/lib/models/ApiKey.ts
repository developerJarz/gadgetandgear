import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApiKey extends Document {
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  isActive: boolean;
  lastUsed: Date | null;
  rateLimit: number;
  createdAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    secret: { type: String, required: true },
    permissions: { type: [String], default: ["read"] },
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date, default: null },
    rateLimit: { type: Number, default: 1000 }, // requests per hour
  },
  { timestamps: true }
);

ApiKeySchema.index({ key: 1 }, { unique: true });

export const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
