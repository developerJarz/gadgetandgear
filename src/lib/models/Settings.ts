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
  branding: { logo: string; favicon: string };
  contact: { email: string; phone: string; whatsapp: string; address: string };
  header: {
    showTopBar: boolean;
    announcements: string[];
    quickLinks: { label: string; href: string }[];
    showPromoBadges: boolean;
  };
  hero: {
    image: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
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
    branding: {
      logo: { type: String, default: "" },
      favicon: { type: String, default: "" },
    },
    contact: {
      email: { type: String, default: "gadgetandgear.bd01@gmail.com" },
      phone: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      address: { type: String, default: "Mirpur 2, Dhaka" },
    },
    header: {
      showTopBar: { type: Boolean, default: true },
      announcements: {
        type: [String],
        default: ["Flash deals up to 40% off, today only", "Free delivery inside Dhaka over ৳3,000", "0% EMI up to 24 months"],
      },
      quickLinks: {
        type: [{ label: String, href: String, _id: false }],
        default: [
          { label: "Smartphones", href: "/shop?category=smartphones" },
          { label: "Laptops", href: "/shop?category=laptops" },
          { label: "Earbuds & Audio", href: "/shop?category=earbuds" },
          { label: "Smart Watches", href: "/shop?category=smartwatches" },
          { label: "Monitors", href: "/shop?category=monitors" },
          { label: "Keyboards", href: "/shop?category=keyboards" },
          { label: "Accessories", href: "/shop?category=accessories" },
        ],
      },
      showPromoBadges: { type: Boolean, default: true },
    },
    hero: {
      image: { type: String, default: "" },
      eyebrow: { type: String, default: "New season · 2026 line-up" },
      title: { type: String, default: "Tech that just works." },
      subtitle: {
        type: String,
        default:
          "Bangladesh's premium destination for smartphones, laptops and smart devices, with official warranty, EMI up to 24 months and nationwide delivery.",
      },
      ctaLabel: { type: String, default: "Shop the collection" },
      ctaHref: { type: String, default: "/shop" },
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
