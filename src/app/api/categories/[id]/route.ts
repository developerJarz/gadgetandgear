import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { requirePermission, logAudit, requestMeta, diffFields } from "@/lib/auth";

const EDITABLE = ["name", "slug", "img", "count", "description", "isActive"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("categories");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => EDITABLE.includes(k)));
    const before = await Category.findById(id).lean();
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const category = await Category.findByIdAndUpdate(id, update, { new: true }).lean();
    const changes = diffFields(before as any, update);
    await logAudit("update", "Category", id, auth.user, `Changed ${Object.keys(changes).join(", ") || "nothing"}`, ip, {
      entityName: category!.name,
      changes,
      userAgent,
    });
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("categories");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findByIdAndDelete(id).lean();
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit("delete", "Category", id, auth.user, "Deleted category", ip, { entityName: category.name, userAgent });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
