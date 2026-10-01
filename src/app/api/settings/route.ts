import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Settings } from "@/lib/models/Settings";
import { getAuthFromCookie, hasPermission, requirePermission, logAudit, requestMeta, diffFields } from "@/lib/auth";

// Never sent to the storefront: provider credentials.
function publicView(settings: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { emailConfig, smsConfig, __v, ...rest } = settings;
  return rest;
}

const EDITABLE = [
  "storeName", "tagline", "announcementText", "socialLinks", "paymentMethods", "deliveryZones",
  "seoDefaults", "branding", "contact", "header", "hero", "vatRate", "currency", "timezone", "maintenanceMode",
  "emailConfig", "smsConfig",
];

export async function GET() {
  try {
    await connectDB();
    // Not lean: loading a full document fills in defaults for fields added after it was saved.
    const doc = (await Settings.findOne()) || (await Settings.create({}));
    const settings: any = doc.toObject();

    const user = await getAuthFromCookie();
    const full = user && hasPermission(user.role, "settings");
    return NextResponse.json(full ? settings : publicView(settings), {
      headers: full ? { "Cache-Control": "no-store" } : { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission("settings");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const body = await req.json();
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => EDITABLE.includes(k)));

    let settings = await Settings.findOne();
    const before = settings?.toObject() || null;
    if (!settings) {
      settings = await Settings.create(update);
    } else {
      settings.set(update);
      await settings.save();
    }

    const changes = diffFields(before, update);
    // Credentials are recorded as changed, never with their values.
    for (const key of ["emailConfig", "smsConfig"]) if (changes[key]) changes[key] = { from: "•••", to: "•••" };
    await logAudit("update", "Settings", String(settings._id), auth.user, `Changed ${Object.keys(changes).join(", ") || "nothing"}`, ip, {
      entityName: "Store settings",
      changes,
      severity: changes.maintenanceMode || changes.paymentMethods ? "warning" : "info",
      userAgent,
    });
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
