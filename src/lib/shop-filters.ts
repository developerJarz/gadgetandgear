import type { Product } from "@/lib/site-data";
import { CATEGORIES } from "@/lib/site-data";

/*
 * Shop filtering, kept framework-free so the page, the filter panel and the
 * URL all agree on one definition of "matches".
 */

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "reviews" | "discount" | "newest";
export type ViewMode = "grid" | "list";

export interface ShopState {
  q: string;
  category: string; // "all" or a category slug
  brands: string[];
  min: number | null;
  max: number | null;
  tags: string[];
  minRating: number; // 0 = any
  minDiscount: number; // percent, 0 = any
  emi: boolean;
  sort: SortKey;
  view: ViewMode;
}

export const DEFAULT_STATE: ShopState = {
  q: "", category: "all", brands: [], min: null, max: null, tags: [],
  minRating: 0, minDiscount: 0, emi: false, sort: "featured", view: "grid",
};

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "discount", label: "Biggest discount" },
  { id: "rating", label: "Top rated" },
  { id: "reviews", label: "Most reviewed" },
  { id: "newest", label: "New arrivals" },
];

export const TAGS = ["Flash Deal", "Bestseller", "New", "Pre-order", "Official"] as const;
export const RATING_STEPS = [4.9, 4.8, 4.7];
export const DISCOUNT_STEPS = [20, 15, 10, 5];
export const PRICE_BANDS = [
  { label: "Under ৳10k", min: null, max: 10000 },
  { label: "৳10k–30k", min: 10000, max: 30000 },
  { label: "৳30k–60k", min: 30000, max: 60000 },
  { label: "৳60k–1.2 lakh", min: 60000, max: 120000 },
  { label: "Over ৳1.2 lakh", min: 120000, max: null },
] as const;

export const discountOf = (p: Product) => (p.was && p.was > p.price ? Math.round(((p.was - p.price) / p.was) * 100) : 0);

/* ─── URL <-> state ─── */

const list = (v: string | null) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
const flag = (v: string | null) => v === "1" || v === "true";

export function parseState(params: URLSearchParams): ShopState {
  const sort = params.get("sort") as SortKey | null;
  return {
    q: params.get("q") || "",
    category: params.get("category") || "all",
    // Accept both ?brand=A,B and repeated ?brand=A&brand=B (header links use the single form).
    brands: params.getAll("brand").flatMap((b) => list(b)),
    min: num(params.get("min")),
    max: num(params.get("max")),
    tags: params.getAll("tag").flatMap((t) => list(t)),
    minRating: num(params.get("rating")) || 0,
    minDiscount: num(params.get("off")) || 0,
    emi: flag(params.get("emi")),
    sort: sort && SORTS.some((s) => s.id === sort) ? sort : "featured",
    view: params.get("view") === "list" ? "list" : "grid",
  };
}

export function toQuery(s: ShopState): string {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set("q", s.q.trim());
  if (s.category !== "all") p.set("category", s.category);
  if (s.brands.length) p.set("brand", s.brands.join(","));
  if (s.min !== null) p.set("min", String(s.min));
  if (s.max !== null) p.set("max", String(s.max));
  if (s.tags.length) p.set("tag", s.tags.join(","));
  if (s.minRating) p.set("rating", String(s.minRating));
  if (s.minDiscount) p.set("off", String(s.minDiscount));
  if (s.emi) p.set("emi", "1");
  if (s.sort !== "featured") p.set("sort", s.sort);
  if (s.view !== "grid") p.set("view", s.view);
  return p.toString();
}

/* ─── Matching ─── */

export type Facet = "q" | "category" | "brands" | "price" | "tags" | "rating" | "discount" | "emi";

const categoryName = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name.toLowerCase()]));

function haystack(p: Product) {
  return [p.name, p.brand, p.category, categoryName[p.category] || "", p.tag || "", ...(p.specs || [])].join(" ").toLowerCase();
}

/** Every word in the query must appear somewhere ("samsung 256" finds Samsung 256GB models). */
export function matchesQuery(p: Product, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack(p);
  return words.every((w) => hay.includes(w));
}

/** True when the product passes every filter except `skip` (used for facet counts). */
export function matches(p: Product, s: ShopState, skip?: Facet): boolean {
  if (skip !== "q" && !matchesQuery(p, s.q)) return false;
  if (skip !== "category" && s.category !== "all" && p.category !== s.category) return false;
  if (skip !== "brands" && s.brands.length && !s.brands.includes(p.brand)) return false;
  if (skip !== "price" && ((s.min !== null && p.price < s.min) || (s.max !== null && p.price > s.max))) return false;
  if (skip !== "tags" && s.tags.length && !(p.tag && s.tags.includes(p.tag))) return false;
  if (skip !== "rating" && s.minRating && p.rating < s.minRating) return false;
  if (skip !== "discount" && s.minDiscount && discountOf(p) < s.minDiscount) return false;
  if (skip !== "emi" && s.emi && !p.emiAvailable) return false;
  return true;
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const out = [...list];
  switch (sort) {
    case "price-asc": return out.sort((a, b) => a.price - b.price);
    case "price-desc": return out.sort((a, b) => b.price - a.price);
    case "rating": return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "reviews": return out.sort((a, b) => b.reviews - a.reviews);
    case "discount": return out.sort((a, b) => discountOf(b) - discountOf(a));
    case "newest": {
      const rank = (p: Product) => (p.tag === "New" ? 0 : p.tag === "Pre-order" ? 1 : 2);
      return out.sort((a, b) => rank(a) - rank(b));
    }
    default: return out;
  }
}

/** Counts for every filter option, each computed with all *other* filters applied. */
export function facetCounts(products: Product[], s: ShopState) {
  const by = (skip: Facet) => products.filter((p) => matches(p, s, skip));
  const count = <T,>(items: Product[], key: (p: Product) => T) => {
    const m = new Map<T, number>();
    for (const p of items) m.set(key(p), (m.get(key(p)) || 0) + 1);
    return m;
  };

  const forCategory = by("category");
  const forBrand = by("brands");
  const forPrice = by("price");
  const forTags = by("tags");
  const forRating = by("rating");
  const forDiscount = by("discount");
  const forEmi = by("emi");
  const prices = forPrice.map((p) => p.price);

  return {
    categories: count(forCategory, (p) => p.category),
    categoryTotal: forCategory.length,
    brands: count(forBrand, (p) => p.brand),
    tags: count(forTags, (p) => p.tag),
    rating: Object.fromEntries(RATING_STEPS.map((r) => [r, forRating.filter((p) => p.rating >= r).length])),
    discount: Object.fromEntries(DISCOUNT_STEPS.map((d) => [d, forDiscount.filter((p) => discountOf(p) >= d).length])),
    emi: forEmi.filter((p) => p.emiAvailable).length,
    priceBands: PRICE_BANDS.map((b) => forPrice.filter((p) => (b.min === null || p.price >= b.min) && (b.max === null || p.price <= b.max)).length),
    priceBounds: prices.length ? [Math.min(...prices), Math.max(...prices)] as [number, number] : [0, 0] as [number, number],
  };
}

export type FacetCounts = ReturnType<typeof facetCounts>;

/** Number of active filters (search and sort don't count). */
export function activeFilterCount(s: ShopState) {
  return s.brands.length + s.tags.length + (s.min !== null || s.max !== null ? 1 : 0) + (s.minRating ? 1 : 0) + (s.minDiscount ? 1 : 0) + (s.emi ? 1 : 0);
}

export const formatTaka = (n: number) => `৳${n.toLocaleString("en-IN")}`;
