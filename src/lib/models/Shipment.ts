import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IShipment extends Document {
  order: Types.ObjectId;
  orderId: string;
  courier: string;
  trackingNumber: string;
  status: "Pending" | "Picked Up" | "In Transit" | "Out for Delivery" | "Delivered" | "Failed" | "Returned";
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  cost: number;
  weight: number;
  notes: string;
  timeline: { status: string; timestamp: Date; note: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderId: { type: String, required: true },
    courier: { type: String, required: true },
    trackingNumber: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Failed", "Returned"],
      default: "Pending",
    },
    estimatedDelivery: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cost: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

ShipmentSchema.index({ order: 1 });
ShipmentSchema.index({ orderId: 1 });
ShipmentSchema.index({ trackingNumber: 1 });
ShipmentSchema.index({ status: 1 });

export const Shipment: Model<IShipment> =
  mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema);
