import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  tagline: string;
  announcementText: string;
  socialLinks: { instagram: string; facebook: string; youtube: string };
  paymentMethods: {
    bkash: boolean;
    nagad: boolean;
    rocket: boolean;
    sslcommerz: boolean;
    cod: boolean;
  };
  deliveryZones: string[];
}

const SettingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: "GadgetHub BD" },
    tagline: { type: String, default: "Premium Electronics & Gadgets in Bangladesh" },
    announcementText: { type: String, default: "⚡ Flash deals up to 40% off" },
    socialLinks: {
      instagram: { type: String, default: "#" },
      facebook: { type: String, default: "#" },
      youtube: { type: String, default: "#" },
    },
    paymentMethods: {
      bkash: { type: Boolean, default: true },
      nagad: { type: Boolean, default: true },
      rocket: { type: Boolean, default: true },
      sslcommerz: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
    },
    deliveryZones: { type: [String], default: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"] },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
