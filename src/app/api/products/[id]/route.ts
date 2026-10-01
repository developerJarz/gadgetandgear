import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { requirePermission, logAudit, requestMeta, diffFields } from "@/lib/auth";
import { sanitizeProduct, PRODUCT_AUDIT_FIELDS } from "@/lib/product-input";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("products");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const before = await Product.findById(id).lean();
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, errors } = sanitizeProduct(await req.json(), true);
    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Some fields need attention.", fields: errors }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true }).lean();
    const changes = diffFields(before as any, data, PRODUCT_AUDIT_FIELDS);
    const changed = Object.keys(changes);
    const priceChange = changes.price ? ` · price ৳${Number(changes.price.from).toLocaleString()} → ৳${Number(changes.price.to).toLocaleString()}` : "";
    await logAudit(
      "update",
      "Product",
      id,
      auth.user,
      changed.length ? `Changed ${changed.join(", ")}${priceChange}` : "Saved without changes",
      ip,
      { entityName: product!.name, changes, userAgent }
    );
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("products");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAudit("delete", "Product", id, auth.user, `Deleted product (SKU ${product.sku || "none"})`, ip, {
      entityName: product.name,
      userAgent,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
