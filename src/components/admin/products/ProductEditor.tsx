"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { SearchSelect, type SelectOption } from "@/components/admin/SearchSelect";
import { MediaInput } from "@/components/admin/media/MediaInput";
import { GalleryInput } from "@/components/admin/media/GalleryInput";
import { BrandLogo } from "@/components/BrandLogo";

export interface ProductRecord {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  was: number | null;
  costPrice?: number;
  img: string;
  gallery?: string[];
  rating: number;
  reviews: number;
  tag?: string;
  warranty?: string;
  stock?: number;
  sku?: string;
  barcode?: string;
  shortDescription?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive?: boolean;
}

export interface BrandOption { _id: string; name: string; logo?: string; isActive?: boolean }
export interface CategoryOption { _id: string; name: string; slug: string; isActive?: boolean }

const TAGS = ["New", "Bestseller", "Flash Deal", "Pre-order", "Official"];
const WARRANTY_PRESETS = ["No warranty", "6 months", "1 year official", "2 years official"];

type FormState = {
  name: string; brand: string; category: string; tag: string; isActive: boolean;
  img: string; gallery: string[];
  price: string; was: string; costPrice: string;
  stock: string; sku: string; barcode: string; warranty: string;
  shortDescription: string; description: string;
  seoTitle: string; seoDescription: string;
  rating: string; reviews: string;
};

const emptyForm = (brand = "", category = ""): FormState => ({
  name: "", brand, category, tag: "", isActive: true,
  img: "", gallery: [],
  price: "", was: "", costPrice: "",
  stock: "0", sku: "", barcode: "", warranty: "",
  shortDescription: "", description: "",
  seoTitle: "", seoDescription: "",
  rating: "4.5", reviews: "0",
});

const fromProduct = (p: ProductRecord): FormState => ({
  name: p.name, brand: p.brand, category: p.category, tag: p.tag || "", isActive: p.isActive !== false,
  img: p.img || "", gallery: p.gallery?.length ? p.gallery : p.img ? [p.img] : [],
  price: String(p.price ?? ""), was: p.was ? String(p.was) : "", costPrice: p.costPrice ? String(p.costPrice) : "",
  stock: String(p.stock ?? 0), sku: p.sku || "", barcode: p.barcode || "", warranty: p.warranty || "",
  shortDescription: p.shortDescription || "", description: p.description || "",
  seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "",
  rating: String(p.rating ?? 0), reviews: String(p.reviews ?? 0),
});

interface ProductEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Product to edit; a record without _id is treated as a duplicate to create. */
  product: ProductRecord | Partial<ProductRecord> | null;
  brands: BrandOption[];
  categories: CategoryOption[];
  onBrandCreated: (b: BrandOption) => void;
  onCategoryCreated: (c: CategoryOption) => void;
  onSaved: () => void;
}

const inputClass = (invalid?: boolean) =>
  `w-full px-3 py-2.5 rounded-xl border bg-background text-sm transition focus:outline-none focus:ring-2 focus:ring-ring ${
    invalid ? "border-destructive" : "border-border"
  }`;

function Field({ label, htmlFor, error, hint, children, className = "" }: {
  label: string; htmlFor?: string; error?: string; hint?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
      {error ? <p className="text-[11px] text-destructive mt-1">{error}</p> : hint ? <p className="text-[11px] text-muted-foreground mt-1">{hint}</p> : null}
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 py-6 first:pt-2 border-b border-border last:border-0">
      <h3 className="font-display font-semibold text-base">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const SECTIONS = [
  { id: "pe-basics", label: "Basics" },
  { id: "pe-media", label: "Photos" },
  { id: "pe-pricing", label: "Pricing" },
  { id: "pe-stock", label: "Stock" },
  { id: "pe-details", label: "Details" },
  { id: "pe-seo", label: "Search" },
];

export function ProductEditor({ open, onOpenChange, product, brands, categories, onBrandCreated, onCategoryCreated, onSaved }: ProductEditorProps) {
  const editingId = product && "_id" in product ? product._id : undefined;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [initial, setInitial] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const next = product?.name
      ? fromProduct(product as ProductRecord)
      : emptyForm(brands.find((b) => b.isActive !== false)?.name || "", categories.find((c) => c.isActive !== false)?.slug || "");
    setForm(next);
    setInitial(next);
    setErrors({});
    setAdvancedOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const price = Number(form.price) || 0;
  const was = Number(form.was) || 0;
  const cost = Number(form.costPrice) || 0;
  const discount = was > price && price > 0 ? Math.round(((was - price) / was) * 100) : 0;
  const margin = price > 0 && cost > 0 ? Math.round(((price - cost) / price) * 100) : null;

  const brandOptions: SelectOption[] = brands.map((b) => ({ value: b.name, label: b.name, icon: <BrandLogo name={b.name} stored={b.logo} className="h-4 w-10" />, hint: b.isActive === false ? "hidden" : undefined }));
  const categoryOptions: SelectOption[] = categories.map((c) => ({ value: c.slug, label: c.name, hint: c.isActive === false ? "hidden" : undefined }));

  const createBrand = async (name: string) => {
    const res = await fetch("/api/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (res.status === 409 && data.existing) return data.existing.name as string;
    if (!res.ok) {
      toast.error(data.error || "Couldn't add the brand.");
      return null;
    }
    onBrandCreated(data);
    toast.success(`Added brand ${data.name}`);
    return data.name as string;
  };

  const createCategory = async (name: string) => {
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (res.status === 409 && data.existing) return data.existing.slug as string;
    if (!res.ok) {
      toast.error(data.error || "Couldn't add the category.");
      return null;
    }
    onCategoryCreated(data);
    toast.success(`Added category ${data.name}`);
    return data.slug as string;
  };

  const requestClose = (next: boolean) => {
    if (!next && dirty && !saving && !window.confirm("Discard your unsaved changes to this product?")) return;
    onOpenChange(next);
  };

  const save = async () => {
    if (saving) return;
    const clientErrors: Record<string, string> = {};
    if (!form.name.trim()) clientErrors.name = "Give the product a name.";
    if (!form.brand) clientErrors.brand = "Choose a brand.";
    if (!form.category) clientErrors.category = "Choose a category.";
    if (!(price > 0)) clientErrors.price = "Enter a price above ৳0.";
    if (was && was <= price) clientErrors.was = "Regular price must be higher than the sale price.";
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      document.getElementById(`pe-field-${Object.keys(clientErrors)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    const body = {
      ...form,
      price,
      was: was || null,
      costPrice: cost,
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      img: form.img || form.gallery[0] || "",
    };
    try {
      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        toast.error(data.error || "Couldn't save the product.");
        return;
      }
      toast.success(editingId ? "Product saved" : "Product published");
      setInitial(form);
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  // Ctrl/Cmd + S saves while the editor is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const seoTitle = form.seoTitle || form.name || "Product name";
  const seoDesc = form.seoDescription || form.shortDescription || "Add a short description so shoppers know what makes this product worth buying.";

  return (
    <Sheet open={open} onOpenChange={requestClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-border">
          <SheetTitle className="font-display text-xl pr-8">{editingId ? "Edit product" : product?.name ? "Duplicate product" : "New product"}</SheetTitle>
          <SheetDescription className="text-xs mt-0.5">
            {editingId ? `SKU ${form.sku || "not set"}` : "Fill in the basics and a cover photo; everything else is optional."}
          </SheetDescription>
          <nav className="flex gap-1 mt-3 -mx-1 overflow-x-auto scrollbar-none" aria-label="Form sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 scrollbar-thin">
          <Section id="pe-basics" title="Basics">
            <Field label="Product name" htmlFor="pe-field-name" error={errors.name}>
              <input id="pe-field-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Galaxy S24 Ultra 12/256GB Titanium Black" className={inputClass(!!errors.name)} autoFocus={!editingId} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Brand" htmlFor="pe-field-brand" error={errors.brand} hint="Type to search, or add a new brand.">
                <SearchSelect id="pe-field-brand" options={brandOptions} value={form.brand} onChange={(v) => set("brand", v)} placeholder="Choose a brand" searchPlaceholder="Search brands" onCreate={createBrand} createNoun="brand" invalid={!!errors.brand} />
              </Field>
              <Field label="Category" htmlFor="pe-field-category" error={errors.category} hint="Type to search, or add a new category.">
                <SearchSelect id="pe-field-category" options={categoryOptions} value={form.category} onChange={(v) => set("category", v)} placeholder="Choose a category" searchPlaceholder="Search categories" onCreate={createCategory} createNoun="category" invalid={!!errors.category} />
              </Field>
            </div>
            <Field label="Badge">
              <div className="flex flex-wrap gap-1.5">
                {["", ...TAGS].map((t) => (
                  <button
                    key={t || "none"}
                    type="button"
                    onClick={() => set("tag", t)}
                    aria-pressed={form.tag === t}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      form.tag === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {t || "None"}
                  </button>
                ))}
              </div>
            </Field>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/40 transition text-left"
              aria-pressed={form.isActive}
            >
              {form.isActive ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <span className="flex-1">
                <span className="block text-sm font-medium">{form.isActive ? "Visible in the store" : "Hidden from the store"}</span>
                <span className="block text-[11px] text-muted-foreground">{form.isActive ? "Shoppers can find and buy it." : "Only staff can see it here."}</span>
              </span>
              <span className={`w-9 h-5 rounded-full flex items-center px-0.5 transition ${form.isActive ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
                <span className="w-4 h-4 rounded-full bg-white shadow" />
              </span>
            </button>
          </Section>

          <Section id="pe-media" title="Photos" description="Everything uploads to Cloudinary. Upload a file, paste a link, or pick from the library.">
            <MediaInput label="Cover photo" value={form.img} onChange={(url) => {
              set("img", url);
              if (url && !form.gallery.includes(url)) setForm((f) => ({ ...f, img: url, gallery: [url, ...f.gallery].slice(0, 12) }));
            }} folder="products" hint="Square, at least 800×800, on a clean background" />
            <GalleryInput
              label="Gallery"
              value={form.gallery}
              onChange={(urls) => setForm((f) => ({ ...f, gallery: urls, img: f.img && !urls.includes(f.img) ? urls[0] || "" : f.img || urls[0] || "" }))}
              folder="products"
              coverUrl={form.img}
              onSetCover={(url) => set("img", url)}
            />
          </Section>

          <Section id="pe-pricing" title="Pricing">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Sale price (৳)" htmlFor="pe-field-price" error={errors.price}>
                <input id="pe-field-price" inputMode="decimal" type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" className={inputClass(!!errors.price)} />
              </Field>
              <Field label="Regular price (৳)" htmlFor="pe-field-was" error={errors.was} hint={discount ? `Shows as ${discount}% off` : "Leave empty if not on sale"}>
                <input id="pe-field-was" inputMode="decimal" type="number" min="0" value={form.was} onChange={(e) => set("was", e.target.value)} placeholder="Optional" className={inputClass(!!errors.was)} />
              </Field>
              <Field label="Cost price (৳)" htmlFor="pe-field-cost" hint={margin !== null ? <span className={margin < 0 ? "text-destructive" : ""}>{margin}% margin</span> : "Private, for margin reports"}>
                <input id="pe-field-cost" inputMode="decimal" type="number" min="0" value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="Optional" className={inputClass()} />
              </Field>
            </div>
          </Section>

          <Section id="pe-stock" title="Stock">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Units in stock" htmlFor="pe-field-stock" hint={Number(form.stock) <= 5 ? "Low stock warning will show" : undefined}>
                <input id="pe-field-stock" type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputClass()} />
              </Field>
              <Field label="SKU" htmlFor="pe-field-sku" hint={editingId ? undefined : "Generated if left empty"}>
                <input id="pe-field-sku" value={form.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} placeholder="Auto" className={`${inputClass()} font-mono`} />
              </Field>
              <Field label="Barcode" htmlFor="pe-field-barcode">
                <input id="pe-field-barcode" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Optional" className={`${inputClass()} font-mono`} />
              </Field>
            </div>
            <Field label="Warranty" htmlFor="pe-field-warranty">
              <input id="pe-field-warranty" value={form.warranty} onChange={(e) => set("warranty", e.target.value)} placeholder="e.g. 1 year official" className={inputClass()} />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {WARRANTY_PRESETS.map((w) => (
                  <button key={w} type="button" onClick={() => set("warranty", w)} className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-accent transition">
                    {w}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section id="pe-details" title="Details">
            <Field label="Short description" htmlFor="pe-field-short" hint={`${form.shortDescription.length}/400 · Shown on product cards and in search results`}>
              <textarea id="pe-field-short" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value.slice(0, 400))} rows={2} className={`${inputClass()} resize-none`} />
            </Field>
            <Field label="Full description" htmlFor="pe-field-desc" hint="Specs, what's in the box, compatibility">
              <textarea id="pe-field-desc" value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} className={`${inputClass()} resize-y`} />
            </Field>
          </Section>

          <Section id="pe-seo" title="Search appearance" description="How this product looks on Google. Defaults to the name and short description.">
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-[11px] text-muted-foreground truncate">gadgetandgear.bd › product › {form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) : "…"}</p>
              <p className="text-[15px] text-primary font-medium leading-snug mt-0.5 line-clamp-1">{seoTitle}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{seoDesc}</p>
            </div>
            <Field label="Page title" htmlFor="pe-field-seo-title" hint={`${form.seoTitle.length}/60`}>
              <input id="pe-field-seo-title" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value.slice(0, 120))} placeholder={form.name} className={inputClass(form.seoTitle.length > 60)} />
            </Field>
            <Field label="Meta description" htmlFor="pe-field-seo-desc" hint={`${form.seoDescription.length}/160`}>
              <textarea id="pe-field-seo-desc" value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value.slice(0, 300))} rows={2} placeholder={form.shortDescription} className={`${inputClass(form.seoDescription.length > 160)} resize-none`} />
            </Field>

            <button type="button" onClick={() => setAdvancedOpen((o) => !o)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} /> Rating override
            </button>
            {advancedOpen && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rating (0–5)" htmlFor="pe-field-rating">
                  <input id="pe-field-rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set("rating", e.target.value)} className={inputClass()} />
                </Field>
                <Field label="Review count" htmlFor="pe-field-reviews">
                  <input id="pe-field-reviews" type="number" min="0" value={form.reviews} onChange={(e) => set("reviews", e.target.value)} className={inputClass()} />
                </Field>
              </div>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-3 border-t border-border bg-background">
          <span className="text-[11px] text-muted-foreground hidden sm:block">
            {dirty ? "Unsaved changes" : "No changes"} · <kbd className="font-sans">Ctrl</kbd>+<kbd className="font-sans">S</kbd> to save
          </span>
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={() => requestClose(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Save product" : "Publish product"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
