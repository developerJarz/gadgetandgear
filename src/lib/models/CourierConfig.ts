import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourierConfig extends Document {
  name: string;
  slug: string;
  isActive: boolean;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  webhookUrl: string;
  defaultCost: number;
  zones: { name: string; cost: number }[];
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const CourierConfigSchema = new Schema<ICourierConfig>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // pathao, steadfast, redx, paperfly, ecourier
    isActive: { type: Boolean, default: false },
    apiKey: { type: String, default: "" },
    secretKey: { type: String, default: "" },
    baseUrl: { type: String, default: "" },
    webhookUrl: { type: String, default: "" },
    defaultCost: { type: Number, default: 0 },
    zones: [
      {
        name: { type: String },
        cost: { type: Number },
      },
    ],
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

CourierConfigSchema.index({ slug: 1 }, { unique: true });

export const CourierConfig: Model<ICourierConfig> =
  mongoose.models.CourierConfig ||
  mongoose.model<ICourierConfig>("CourierConfig", CourierConfigSchema);
