import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp?: string;
  altPhone?: string;
  role: "Customer";
  status: "Active" | "Banned";
  ordersCount: number;
  totalSpent: number;
  joinedAt: Date;
  address: string;
  city?: string;
  division: string;
  postalCode?: string;
  avatar?: string;
  wishlist: string[]; // product slugs
  loyaltyPoints: number;
  segment: "New" | "Regular" | "VIP" | "At-Risk" | "Inactive";
  lastOrderDate: Date | null;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    altPhone: { type: String, default: "" },
    role: { type: String, default: "Customer" },
    status: { type: String, enum: ["Active", "Banned"], default: "Active" },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    division: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    avatar: { type: String, default: "" },
    wishlist: { type: [String], default: [] },
    loyaltyPoints: { type: Number, default: 0 },
    segment: {
      type: String,
      enum: ["New", "Regular", "VIP", "At-Risk", "Inactive"],
      default: "New",
    },
    lastOrderDate: { type: Date, default: null },
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ segment: 1 });
UserSchema.index({ totalSpent: -1 });
UserSchema.index({ ordersCount: -1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
