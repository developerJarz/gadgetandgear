import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AuditSeverity = "info" | "warning" | "critical";

export interface IAuditLog extends Document {
  action: string;
  entity: string;
  entityId: string;
  entityName: string;
  performedBy: Types.ObjectId | null;
  performedByName: string;
  performedByRole: string;
  details: string;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  severity: AuditSeverity;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true }, // "create", "update", "delete", "login", "upload", etc.
    entity: { type: String, required: true }, // "Product", "Order", "Media", etc.
    entityId: { type: String, default: "" },
    entityName: { type: String, default: "" },
    performedBy: { type: Schema.Types.ObjectId, ref: "Staff", default: null },
    performedByName: { type: String, default: "System" },
    performedByRole: { type: String, default: "" },
    details: { type: String, default: "" },
    changes: { type: Schema.Types.Mixed, default: null },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
