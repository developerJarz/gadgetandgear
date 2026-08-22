import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  entity: string;
  entityId: string;
  performedBy: Types.ObjectId | null;
  performedByName: string;
  details: string;
  ip: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true }, // "create", "update", "delete", "login", etc.
    entity: { type: String, required: true }, // "Product", "Order", "User", etc.
    entityId: { type: String, default: "" },
    performedBy: { type: Schema.Types.ObjectId, ref: "Staff", default: null },
    performedByName: { type: String, default: "System" },
    details: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
