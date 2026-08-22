import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebhook extends Document {
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered: Date | null;
  failCount: number;
  createdAt: Date;
}

const WebhookSchema = new Schema<IWebhook>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: { type: [String], default: [] }, // order.created, order.updated, product.created, etc.
    secret: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    lastTriggered: { type: Date, default: null },
    failCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Webhook: Model<IWebhook> =
  mongoose.models.Webhook || mongoose.model<IWebhook>("Webhook", WebhookSchema);
