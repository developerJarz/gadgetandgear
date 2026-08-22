import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITransaction extends Document {
  type: "income" | "expense" | "refund";
  amount: number;
  description: string;
  category: string;
  method: string; // bKash, Nagad, COD, Bank Transfer, etc.
  reference: string; // orderId, invoiceId, etc.
  order: Types.ObjectId | null;
  date: Date;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["income", "expense", "refund"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" },
    method: { type: String, default: "" },
    reference: { type: String, default: "" },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TransactionSchema.index({ type: 1, date: -1 });
TransactionSchema.index({ reference: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ order: 1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
