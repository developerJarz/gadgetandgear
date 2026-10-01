import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Brand } from "@/lib/models/Brand";
import { OFFICIAL_BRANDS, resolveBrandLogo } from "@/lib/site-data";
import { requirePermission, logAudit, requestMeta } from "@/lib/auth";
import { slugify } from "@/lib/product-input";

export async function GET() {
  try {
    await connectDB();
    let brands = await Brand.find().sort({ name: 1 }).lean();

    // Auto-seed if database collection is empty
    if (!brands || brands.length === 0) {
      const initial = OFFICIAL_BRANDS.map((b) => ({
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        isActive: true,
      }));
      await Brand.insertMany(initial);
      brands = await Brand.find().sort({ name: 1 }).lean();
    }

    // One-time repair: early seeds hotlinked Simple Icons, and several of those URLs
    // now 404 or point at the wrong company. Swap them for the bundled logo files.
    const stale = brands.filter((b) => b.logo?.includes("cdn.simpleicons.org"));
    if (stale.length) {
      const fixes = stale
        .map((b) => ({ id: b._id, logo: resolveBrandLogo(b.name, b.logo) || "" }))
        .filter((f) => f.logo.startsWith("/brands/"));
      if (fixes.length) {
        await Brand.bulkWrite(fixes.map((f) => ({ updateOne: { filter: { _id: f.id }, update: { $set: { logo: f.logo } } } })));
        brands = await Brand.find().sort({ name: 1 }).lean();
      }
    }
    return NextResponse.json(brands);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("brands");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: "Give the brand a name." }, { status: 400 });

    const slug = slugify(body.slug || name);
    const existing = await Brand.findOne({ $or: [{ slug }, { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }] }).lean();
    if (existing) return NextResponse.json({ error: `${existing.name} already exists.`, existing }, { status: 409 });

    const brand = await Brand.create({ name, slug, logo: String(body.logo || ""), isActive: body.isActive ?? true });
    await logAudit("create", "Brand", String(brand._id), auth.user, "Created brand", ip, { entityName: brand.name, userAgent });
    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
