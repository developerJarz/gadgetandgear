import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrderItem {
  productSlug: string;
  productName: string;
  qty: number;
  price: number;
  sku?: string;
}

export interface IStatusTimeline {
  status: string;
  timestamp: Date;
  note: string;
  by: string;
}

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  division: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded" | "Partial";
  paymentRef: string;
  courier: string;
  trackingNumber: string;
  couponCode: string;
  couponDiscount: number;
  statusTimeline: IStatusTimeline[];
  notes: string;
  userId: Types.ObjectId | null;
  refundAmount: number;
  refundStatus: "None" | "Requested" | "Processing" | "Completed";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productSlug: String,
    productName: String,
    qty: Number,
    price: Number,
    sku: { type: String, default: "" },
  },
  { _id: false }
);

const StatusTimelineSchema = new Schema<IStatusTimeline>(
  {
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    by: { type: String, default: "System" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    division: { type: String, default: "Dhaka" },
    items: [OrderItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
    paymentMethod: { type: String, default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "Partial"],
      default: "Pending",
    },
    paymentRef: { type: String, default: "" },
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    statusTimeline: { type: [StatusTimelineSchema], default: [] },
    notes: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    refundAmount: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ["None", "Requested", "Processing", "Completed"],
      default: "None",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentMethod: 1 });
OrderSchema.index({ division: 1 });
OrderSchema.index({ orderId: 1 }, { unique: true });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
