import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: "Customer";
  status: "Active" | "Banned";
  ordersCount: number;
  totalSpent: number;
  joinedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    role: { type: String, default: "Customer" },
    status: { type: String, enum: ["Active", "Banned"], default: "Active" },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
