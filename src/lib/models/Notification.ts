import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INotification extends Document {
  type: string;
  title: string;
  message: string;
  recipient: Types.ObjectId | null; // null = broadcast
  isRead: boolean;
  link: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "order", "inventory", "payment", "system", "marketing",
        "security", "return", "review", "stock_alert",
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "Staff", default: null },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
