import mongoose, { Schema, Document, Model } from "mongoose";

export type StaffRoleType =
  | "Super Admin"
  | "Admin"
  | "Manager"
  | "Marketing"
  | "Inventory"
  | "Accountant"
  | "Support"
  | "Delivery"
  | "Staff";

export interface ILoginRecord {
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
}

export interface IStaff extends Document {
  name: string;
  email: string;
  password: string;
  role: StaffRoleType;
  avatar: string;
  joinedAt: Date;
  lastActive: Date;
  isActive: boolean;
  permissions: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  loginHistory: ILoginRecord[];
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoginRecordSchema = new Schema<ILoginRecord>(
  {
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean, default: true },
  },
  { _id: false }
);

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    role: {
      type: String,
      enum: [
        "Super Admin", "Admin", "Manager", "Marketing", "Inventory",
        "Accountant", "Support", "Delivery", "Staff",
      ],
      default: "Staff",
    },
    avatar: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    permissions: { type: [String], default: [] },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: "" },
    loginHistory: { type: [LoginRecordSchema], default: [] },
    phone: { type: String, default: "" },
  },
  { timestamps: true }
);

StaffSchema.index({ email: 1 }, { unique: true });
StaffSchema.index({ role: 1 });
StaffSchema.index({ isActive: 1 });

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
