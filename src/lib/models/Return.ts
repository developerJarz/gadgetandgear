import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReturnItem {
  productSlug: string;
  productName: string;
  qty: number;
  price: number;
}

export interface IReturn extends Document {
  order: Types.ObjectId;
  orderId: string;
  items: IReturnItem[];
  reason: string;
  status: "Requested" | "Approved" | "Rejected" | "Received" | "Refunded";
  refundAmount: number;
  refundMethod: string;
  customerNote: string;
  adminNote: string;
  processedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    productSlug: String,
    productName: String,
    qty: Number,
    price: Number,
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderId: { type: String, required: true },
    items: [ReturnItemSchema],
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Received", "Refunded"],
      default: "Requested",
    },
    refundAmount: { type: Number, default: 0 },
    refundMethod: { type: String, default: "" },
    customerNote: { type: String, default: "" },
    adminNote: { type: String, default: "" },
    processedBy: { type: Schema.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true }
);

ReturnSchema.index({ order: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ createdAt: -1 });

export const Return: Model<IReturn> =
  mongoose.models.Return || mongoose.model<IReturn>("Return", ReturnSchema);
