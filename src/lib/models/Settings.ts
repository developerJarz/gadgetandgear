import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  tagline: string;
  announcementText: string;
  socialLinks: { instagram: string; facebook: string; youtube: string; twitter: string; tiktok: string };
  paymentMethods: {
    bkash: boolean;
    nagad: boolean;
    rocket: boolean;
    sslcommerz: boolean;
    cod: boolean;
    card: boolean;
  };
  deliveryZones: string[];
  seoDefaults: {
    siteTitle: string;
    siteDescription: string;
    ogImage: string;
    robotsTxt: string;
  };
  emailConfig: {
    provider: string;
    fromEmail: string;
    fromName: string;
    apiKey: string;
  };
  smsConfig: {
    provider: string;
    apiKey: string;
    senderId: string;
  };
  vatRate: number;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
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
      twitter: { type: String, default: "#" },
      tiktok: { type: String, default: "#" },
    },
    paymentMethods: {
      bkash: { type: Boolean, default: true },
      nagad: { type: Boolean, default: true },
      rocket: { type: Boolean, default: true },
      sslcommerz: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
      card: { type: Boolean, default: false },
    },
    deliveryZones: {
      type: [String],
      default: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"],
    },
    seoDefaults: {
      siteTitle: { type: String, default: "GadgetHub BD — Premium Electronics" },
      siteDescription: { type: String, default: "Shop the latest gadgets and electronics in Bangladesh" },
      ogImage: { type: String, default: "" },
      robotsTxt: { type: String, default: "" },
    },
    emailConfig: {
      provider: { type: String, default: "" },
      fromEmail: { type: String, default: "" },
      fromName: { type: String, default: "" },
      apiKey: { type: String, default: "" },
    },
    smsConfig: {
      provider: { type: String, default: "" },
      apiKey: { type: String, default: "" },
      senderId: { type: String, default: "" },
    },
    vatRate: { type: Number, default: 15 }, // Bangladesh VAT rate
    currency: { type: String, default: "BDT" },
    timezone: { type: String, default: "Asia/Dhaka" },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
