import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInventory extends Document {
  product: Types.ObjectId;
  sku: string;
  barcode: string;
  stock: number;
  reservedStock: number;
  lowThreshold: number;
  costPrice: number;
  warehouse: Types.ObjectId;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastRestocked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    barcode: { type: String, default: "" },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    lowThreshold: { type: Number, default: 10 },
    costPrice: { type: Number, default: 0 },
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    lastRestocked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InventorySchema.index({ product: 1 });
InventorySchema.index({ sku: 1 }, { unique: true });
InventorySchema.index({ stock: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ warehouse: 1 });

// Auto-compute status before save
InventorySchema.pre("save", function () {
  if (this.stock <= 0) this.status = "Out of Stock";
  else if (this.stock <= this.lowThreshold) this.status = "Low Stock";
  else this.status = "In Stock";
});

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);
