import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaff extends Document {
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  avatar: string;
  joinedAt: Date;
  lastActive: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["Admin", "Manager", "Staff"], default: "Staff" },
    avatar: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
