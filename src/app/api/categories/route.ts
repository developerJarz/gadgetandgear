import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { CATEGORIES } from "@/lib/site-data";
import { requirePermission, logAudit, requestMeta } from "@/lib/auth";
import { slugify } from "@/lib/product-input";

export async function GET() {
  try {
    await connectDB();
    let categories = await Category.find().sort({ name: 1 }).lean();

    // Seed from the storefront catalog so product forms always have categories to pick.
    if (categories.length === 0) {
      await Category.insertMany(
        CATEGORIES.map((c) => ({
          name: c.name,
          slug: c.slug,
          img: typeof c.img === "string" ? c.img : c.img?.src || "",
          count: c.count,
          description: c.description,
          isActive: true,
        }))
      );
      categories = await Category.find().sort({ name: 1 }).lean();
    }

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("categories");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: "Give the category a name." }, { status: 400 });

    const slug = slugify(body.slug || name);
    const existing = await Category.findOne({ slug }).lean();
    if (existing) return NextResponse.json({ error: `${existing.name} already exists.`, existing }, { status: 409 });

    const category = await Category.create({
      name,
      slug,
      img: String(body.img || ""),
      count: String(body.count || "0 models"),
      description: String(body.description || "").slice(0, 500),
      isActive: body.isActive ?? true,
    });
    await logAudit("create", "Category", String(category._id), auth.user, "Created category", ip, { entityName: category.name, userAgent });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
