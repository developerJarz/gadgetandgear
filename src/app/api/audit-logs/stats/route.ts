import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/auth";

const RANGES: Record<string, { ms: number; bucket: "hour" | "day"; buckets: number }> = {
  "24h": { ms: 24 * 3600e3, bucket: "hour", buckets: 24 },
  "7d": { ms: 7 * 24 * 3600e3, bucket: "day", buckets: 7 },
  "30d": { ms: 30 * 24 * 3600e3, bucket: "day", buckets: 30 },
};

/* GET /api/audit-logs/stats?range=24h|7d|30d */
export async function GET(req: NextRequest) {
  const auth = await requireRole(["Admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const rangeKey = new URL(req.url).searchParams.get("range") || "24h";
    const range = RANGES[rangeKey] || RANGES["24h"];
    const now = Date.now();
    const start = new Date(now - range.ms);
    const match = { createdAt: { $gte: start } };

    const bucketFormat = range.bucket === "hour" ? "%Y-%m-%dT%H:00" : "%Y-%m-%d";

    const [byAction, byEntity, byUser, bySeverity, timeline, onlineNow, filterValues] = await Promise.all([
      AuditLog.aggregate([{ $match: match }, { $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([{ $match: match }, { $group: { _id: "$entity", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([
        { $match: { ...match, performedByName: { $ne: "System" } } },
        { $group: { _id: "$performedByName", role: { $last: "$performedByRole" }, count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AuditLog.aggregate([{ $match: match }, { $group: { _id: "$severity", count: { $sum: 1 } } }]),
      AuditLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: bucketFormat, date: "$createdAt", timezone: "Asia/Dhaka" } },
            total: { $sum: 1 },
            warnings: { $sum: { $cond: [{ $in: ["$severity", ["warning", "critical"]] }, 1, 0] } },
          },
        },
      ]),
      AuditLog.distinct("performedByName", {
        createdAt: { $gte: new Date(now - 15 * 60e3) },
        performedByName: { $ne: "System" },
      }),
      Promise.all([AuditLog.distinct("action"), AuditLog.distinct("entity"), AuditLog.distinct("performedByName")]),
    ]);

    // Fill empty buckets so the chart has a continuous axis (labels in Dhaka time, UTC+6).
    const fmt = (d: Date) => {
      const local = new Date(d.getTime() + 6 * 3600e3).toISOString();
      return range.bucket === "hour" ? `${local.slice(0, 13)}:00` : local.slice(0, 10);
    };
    const step = range.bucket === "hour" ? 3600e3 : 24 * 3600e3;
    const map = new Map(timeline.map((t: any) => [t._id, t]));
    const series = Array.from({ length: range.buckets }, (_, i) => {
      const key = fmt(new Date(now - (range.buckets - 1 - i) * step));
      const hit: any = map.get(key);
      return { bucket: key, total: hit?.total || 0, warnings: hit?.warnings || 0 };
    });

    const severity = Object.fromEntries(bySeverity.map((s: any) => [s._id || "info", s.count]));
    const failedLogins = byAction.find((a: any) => a._id === "login_failed")?.count || 0;

    return NextResponse.json({
      range: rangeKey,
      total: byAction.reduce((n: number, a: any) => n + a.count, 0),
      severity: { info: severity.info || 0, warning: severity.warning || 0, critical: severity.critical || 0 },
      failedLogins,
      onlineNow,
      byAction: byAction.map((a: any) => ({ action: a._id, count: a.count })),
      byEntity: byEntity.map((e: any) => ({ entity: e._id, count: e.count })),
      byUser: byUser.map((u: any) => ({ name: u._id, role: u.role, count: u.count, lastSeen: u.lastSeen })),
      series,
      filters: {
        actions: filterValues[0].sort(),
        entities: filterValues[1].sort(),
        users: filterValues[2].sort(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
