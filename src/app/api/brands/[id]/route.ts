import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Brand } from "@/lib/models/Brand";
import { requirePermission, logAudit, requestMeta, diffFields } from "@/lib/auth";

const EDITABLE = ["name", "logo", "isActive"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("brands");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => EDITABLE.includes(k)));
    const before = await Brand.findById(id).lean();
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const brand = await Brand.findByIdAndUpdate(id, update, { new: true }).lean();
    const changes = diffFields(before as any, update);
    await logAudit("update", "Brand", id, auth.user, `Changed ${Object.keys(changes).join(", ") || "nothing"}`, ip, {
      entityName: brand!.name,
      changes,
      userAgent,
    });
    return NextResponse.json(brand);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("brands");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const brand = await Brand.findByIdAndDelete(id).lean();
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit("delete", "Brand", id, auth.user, "Deleted brand", ip, { entityName: brand.name, userAgent });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
