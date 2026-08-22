import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentConfig extends Document {
  name: string;
  slug: string; // bkash, nagad, rocket, sslcommerz, cod, card
  isActive: boolean;
  merchantId: string;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  callbackUrl: string;
  sandboxMode: boolean;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentConfigSchema = new Schema<IPaymentConfig>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false },
    merchantId: { type: String, default: "" },
    apiKey: { type: String, default: "" },
    secretKey: { type: String, default: "" },
    baseUrl: { type: String, default: "" },
    callbackUrl: { type: String, default: "" },
    sandboxMode: { type: Boolean, default: true },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PaymentConfigSchema.index({ slug: 1 }, { unique: true });

export const PaymentConfig: Model<IPaymentConfig> =
  mongoose.models.PaymentConfig ||
  mongoose.model<IPaymentConfig>("PaymentConfig", PaymentConfigSchema);
