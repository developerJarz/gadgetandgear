/*
 * Whitelists and validates product payloads from the admin panel so the API
 * never writes arbitrary fields into MongoDB.
 */

const TAGS = ["New", "Bestseller", "Flash Deal", "Pre-order", "Official", ""];

export const PRODUCT_AUDIT_FIELDS = [
  "name", "brand", "category", "price", "was", "costPrice", "img", "gallery", "tag",
  "warranty", "stock", "sku", "isActive", "shortDescription", "description", "seoTitle", "seoDescription",
];

export type FieldErrors = Record<string, string>;

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const num = (v: unknown) => {
  if (v === null || v === "" || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function sanitizeProduct(body: Record<string, any>, partial = false) {
  const out: Record<string, any> = {};
  const errors: FieldErrors = {};

  const name = str(body.name, 200);
  if (name !== undefined) out.name = name;
  if (!partial || name !== undefined) if (!name) errors.name = "Give the product a name.";

  const brand = str(body.brand, 80);
  if (brand !== undefined) out.brand = brand;
  if (!partial || brand !== undefined) if (!brand) errors.brand = "Choose a brand.";

  const category = str(body.category, 80);
  if (category !== undefined) out.category = category;
  if (!partial || category !== undefined) if (!category) errors.category = "Choose a category.";

  const price = num(body.price);
  if (price !== undefined) out.price = price;
  if (!partial || "price" in body) if (!price || price <= 0) errors.price = "Enter a price above ৳0.";

  if ("was" in body) {
    const was = num(body.was);
    out.was = was && was > 0 ? was : null;
    if (out.was !== null && price && out.was <= price) errors.was = "Regular price must be higher than the sale price.";
  }

  for (const key of ["costPrice", "stock", "weight", "rating", "reviews"]) {
    const v = num(body[key]);
    if (v !== undefined) out[key] = Math.max(0, v);
  }
  if (out.rating !== undefined) out.rating = Math.min(5, out.rating);

  for (const [key, max] of [
    ["img", 1000], ["videoUrl", 1000], ["warranty", 120], ["sku", 60], ["barcode", 60],
    ["shortDescription", 400], ["description", 10000], ["seoTitle", 120], ["seoDescription", 300],
  ] as const) {
    const v = str(body[key], max);
    if (v !== undefined) out[key] = v;
  }

  if ("tag" in body) out.tag = TAGS.includes(body.tag) ? body.tag : "";
  if ("isActive" in body) out.isActive = !!body.isActive;
  if (Array.isArray(body.gallery)) out.gallery = body.gallery.filter((u: unknown) => typeof u === "string" && u).slice(0, 12);
  if (Array.isArray(body.seoKeywords)) out.seoKeywords = body.seoKeywords.map(String).map((s: string) => s.trim()).filter(Boolean).slice(0, 20);
  if (body.dimensions && typeof body.dimensions === "object") {
    out.dimensions = {
      length: num(body.dimensions.length) ?? 0,
      width: num(body.dimensions.width) ?? 0,
      height: num(body.dimensions.height) ?? 0,
    };
  }

  // The cover image always leads the gallery.
  if (out.img && out.gallery && !out.gallery.includes(out.img)) out.gallery = [out.img, ...out.gallery].slice(0, 12);

  return { data: out, errors };
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function generateSku(brand: string, category: string) {
  const part = (s: string) => s.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  return `${part(brand)}-${part(category)}-${Date.now().toString(36).slice(-5).toUpperCase()}`;
}
