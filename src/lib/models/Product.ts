import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  was: number | null;
  costPrice: number;
  img: string;
  gallery: string[];
  videoUrl: string;
  rating: number;
  reviews: number;
  tag?: "New" | "Bestseller" | "Flash Deal" | "Pre-order" | "Official" | "";
  warranty?: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  variants: IProductVariant[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  isActive: boolean;
  stock: number;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    attributes: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    was: { type: Number, default: null },
    costPrice: { type: Number, default: 0 },
    img: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    videoUrl: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    tag: {
      type: String,
      enum: ["New", "Bestseller", "Flash Deal", "Pre-order", "Official", ""],
      default: "",
    },
    warranty: { type: String, default: "" },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    sku: { type: String, default: "" },
    barcode: { type: String, default: "" },
    variants: { type: [ProductVariantSchema], default: [] },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    seoKeywords: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ name: "text", description: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
