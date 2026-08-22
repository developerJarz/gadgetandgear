import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICMSPage extends Document {
  title: string;
  slug: string;
  content: string;
  status: "Draft" | "Published" | "Archived";
  seoTitle: string;
  seoDescription: string;
  template: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CMSPageSchema = new Schema<ICMSPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    template: { type: String, default: "default" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CMSPageSchema.index({ slug: 1 }, { unique: true });
CMSPageSchema.index({ status: 1 });

export const CMSPage: Model<ICMSPage> =
  mongoose.models.CMSPage || mongoose.model<ICMSPage>("CMSPage", CMSPageSchema);
