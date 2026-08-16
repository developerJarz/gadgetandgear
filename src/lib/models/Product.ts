import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  was: number | null;
  img: string;
  rating: number;
  reviews: number;
  tag?: "New" | "Bestseller" | "Flash Deal" | "Pre-order" | "Official";
  warranty?: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    was: { type: Number, default: null },
    img: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    tag: { type: String, enum: ["New", "Bestseller", "Flash Deal", "Pre-order", "Official", ""], default: "" },
    warranty: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
