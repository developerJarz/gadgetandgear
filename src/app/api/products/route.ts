import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { requirePermission, logAudit, requestMeta } from "@/lib/auth";
import { sanitizeProduct, slugify, generateSku } from "@/lib/product-input";

const SORTABLE = ["createdAt", "updatedAt", "name", "price", "stock", "rating"];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const sortParam = searchParams.get("sort") || "createdAt";
    const sort = SORTABLE.includes(sortParam) ? sortParam : "createdAt";
    const order = searchParams.get("order") || "desc";
    const status = searchParams.get("status");
    const tag = searchParams.get("tag");

    const filter: any = {};
    if (category && category !== "all") filter.category = category;
    if (brand && brand !== "all") filter.brand = brand;
    if (tag && tag !== "all") filter.tag = tag;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (status === "low-stock") filter.stock = { $lte: 5 };
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { brand: { $regex: safe, $options: "i" } },
        { sku: { $regex: safe, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("products");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { data, errors } = sanitizeProduct(await req.json());
    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Some fields need attention.", fields: errors }, { status: 400 });
    }

    const slug = `${slugify(data.name)}-${Date.now().toString(36)}`;
    if (!data.sku) data.sku = generateSku(data.brand, data.category);

    const product = await Product.create({ ...data, slug });
    await logAudit("create", "Product", String(product._id), auth.user, `Created product at ৳${product.price.toLocaleString()}`, ip, {
      entityName: product.name,
      userAgent,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
