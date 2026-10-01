import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "./mongodb";
import { Staff, type StaffRoleType } from "./models/Staff";
import { AuditLog } from "./models/AuditLog";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const COOKIE_NAME = "gh_admin_token";
const TOKEN_EXPIRY = "7d";

/* ─── Password Utilities ─── */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ─── JWT Utilities ─── */

export interface JWTPayload {
  staffId: string;
  email: string;
  name: string;
  role: StaffRoleType;
  permissions: string[];
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/* ─── Cookie Auth ─── */

export async function setAuthCookie(payload: JWTPayload): Promise<void> {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCustomerAuthFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_customer_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAnyAuthFromCookie(): Promise<JWTPayload | null> {
  const adminAuth = await getAuthFromCookie();
  if (adminAuth) return adminAuth;
  return getCustomerAuthFromCookie();
}


/* ─── RBAC Permission Maps ─── */

const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": ["*"],
  Admin: ["*"],
  Manager: [
    "dashboard", "products", "categories", "brands", "orders", "inventory",
    "returns", "users", "reviews", "analytics", "finance", "reports",
    "coupons", "campaigns", "marketing", "blog", "seo", "media",
  ],
  Marketing: [
    "dashboard", "coupons", "campaigns", "marketing", "blog", "seo", "media",
    "analytics", "reviews",
  ],
  Inventory: [
    "dashboard", "products", "categories", "brands", "inventory",
    "suppliers", "warehouses",
  ],
  Accountant: [
    "dashboard", "finance", "reports", "analytics", "orders",
  ],
  Support: [
    "dashboard", "orders", "returns", "users", "reviews",
  ],
  Delivery: [
    "dashboard", "orders", "couriers",
  ],
  Staff: [
    "dashboard", "products", "orders",
  ],
};

export function hasPermission(role: string, resource: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(resource);
}

/* ─── Auth Middleware for API Routes ─── */

export async function requireAuth(
  req?: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { user: auth };
}

export async function requireRole(
  roles: StaffRoleType[],
  req?: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  if (!roles.includes(result.user.role as StaffRoleType) && result.user.role !== "Super Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

/** Like requireAuth, but also checks the role's RBAC permission for a resource. */
export async function requirePermission(
  resource: string
): Promise<{ user: JWTPayload } | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (!hasPermission(result.user.role, resource)) {
    return NextResponse.json({ error: `Your role can't manage ${resource}.` }, { status: 403 });
  }
  return result;
}

/** Client IP and user agent for audit entries. */
export function requestMeta(req: NextRequest): { ip: string; userAgent: string } {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return {
    ip: forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "",
    userAgent: req.headers.get("user-agent") || "",
  };
}

/** Field-level diff between two plain objects, limited to the given keys (or the keys of `after`). */
export function diffFields(
  before: Record<string, any> | null | undefined,
  after: Record<string, any>,
  keys?: string[]
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of keys || Object.keys(after)) {
    if (["_id", "__v", "createdAt", "updatedAt", "slug"].includes(key)) continue;
    const from = before?.[key];
    const to = after[key];
    if (to === undefined) continue;
    if (JSON.stringify(from ?? null) !== JSON.stringify(to ?? null)) {
      changes[key] = { from: from ?? null, to: to ?? null };
    }
  }
  return changes;
}

/* ─── Audit Logging Helper ─── */

export interface AuditMeta {
  entityName?: string;
  changes?: Record<string, { from: unknown; to: unknown }> | null;
  severity?: "info" | "warning" | "critical";
  userAgent?: string;
}

export async function logAudit(
  action: string,
  entity: string,
  entityId: string,
  user: JWTPayload | null,
  details?: string,
  ip?: string,
  meta: AuditMeta = {}
) {
  try {
    await connectDB();
    const severity =
      meta.severity || (action === "delete" || action === "login_failed" ? "warning" : "info");
    await AuditLog.create({
      action,
      entity,
      entityId,
      entityName: meta.entityName || "",
      performedBy: user?.staffId || null,
      performedByName: user?.name || "System",
      performedByRole: user?.role || "",
      details: details || "",
      changes: meta.changes && Object.keys(meta.changes).length ? meta.changes : null,
      severity,
      ip: ip || "",
      userAgent: meta.userAgent || "",
    });
  } catch {
    // Audit log should never block the main operation
    console.error("Failed to create audit log");
  }
}

/* ─── Notification Helper ─── */

export async function createNotification(
  type: string,
  title: string,
  message: string,
  link?: string,
  recipientId?: string | null,
  data?: Record<string, unknown>
) {
  try {
    await connectDB();
    const { Notification } = await import("./models/Notification");
    await Notification.create({
      type,
      title,
      message,
      recipient: recipientId || null,
      link: link || "",
      data: data || {},
    });
  } catch {
    console.error("Failed to create notification");
  }
}
