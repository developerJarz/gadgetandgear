import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IStockMovement extends Document {
  product: Types.ObjectId;
  type: "Stock In" | "Stock Out" | "Adjustment" | "Return";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference: string; // orderId or returnId
  performedBy: Types.ObjectId;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["Stock In", "Stock Out", "Adjustment", "Return"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, default: "" },
    reference: { type: String, default: "" },
    performedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

StockMovementSchema.index({ product: 1, createdAt: -1 });
StockMovementSchema.index({ type: 1 });
StockMovementSchema.index({ createdAt: -1 });

export const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement ||
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
