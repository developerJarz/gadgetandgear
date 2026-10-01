import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMediaAsset extends Document {
  publicId: string;
  url: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width: number;
  height: number;
  originalFilename: string;
  folder: string;
  source: "upload" | "link";
  sourceUrl: string;
  tags: string[];
  uploadedBy: Types.ObjectId | null;
  uploadedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], default: "image" },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    originalFilename: { type: String, default: "" },
    folder: { type: String, default: "" },
    source: { type: String, enum: ["upload", "link"], default: "upload" },
    sourceUrl: { type: String, default: "" },
    tags: { type: [String], default: [] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Staff", default: null },
    uploadedByName: { type: String, default: "System" },
  },
  { timestamps: true }
);

MediaAssetSchema.index({ createdAt: -1 });
MediaAssetSchema.index({ folder: 1 });
MediaAssetSchema.index({ originalFilename: "text", tags: "text" });

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
