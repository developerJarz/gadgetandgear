import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWarehouse extends Document {
  name: string;
  location: string;
  address: string;
  phone: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    location: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    capacity: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warehouse: Model<IWarehouse> =
  mongoose.models.Warehouse || mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);
