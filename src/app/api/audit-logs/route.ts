import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/auth";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
 * GET /api/audit-logs
 *   page, limit, action, entity, user, severity, search, from, to (ISO dates)
 *   since (ISO) returns only entries newer than that, for live polling
 */
export async function GET(req: NextRequest) {
  const auth = await requireRole(["Admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");
    const user = searchParams.get("user");
    const severity = searchParams.get("severity");
    const search = searchParams.get("search")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const since = searchParams.get("since");

    const filter: Record<string, any> = {};
    if (action && action !== "all") filter.action = action;
    if (entity && entity !== "all") filter.entity = entity;
    if (user && user !== "all") filter.performedByName = user;
    if (severity && severity !== "all") filter.severity = severity;
    if (search) {
      const rx = { $regex: escape(search), $options: "i" };
      filter.$or = [{ details: rx }, { entityName: rx }, { performedByName: rx }, { ip: rx }];
    }
    const created: Record<string, Date> = {};
    if (from) created.$gte = new Date(from);
    if (to) created.$lte = new Date(to);
    if (since) created.$gt = new Date(since);
    if (Object.keys(created).length) filter.createdAt = created;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(since ? 0 : (page - 1) * limit).limit(limit).lean(),
      since ? Promise.resolve(0) : AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
