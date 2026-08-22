import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  type: "Flash Sale" | "Seasonal" | "Promotion" | "Email" | "SMS" | "Push";
  status: "Draft" | "Active" | "Scheduled" | "Ended" | "Paused";
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  coupons: string[];
  targetAudience: string;
  channels: string[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Flash Sale", "Seasonal", "Promotion", "Email", "SMS", "Push"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Scheduled", "Ended", "Paused"],
      default: "Draft",
    },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    coupons: { type: [String], default: [] },
    targetAudience: { type: String, default: "All" },
    channels: { type: [String], default: [] },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

CampaignSchema.index({ status: 1, startDate: -1 });
CampaignSchema.index({ type: 1 });

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
