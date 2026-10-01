"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Copy, Star, PackageOpen, ImageOff, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { ProductEditor, type ProductRecord, type BrandOption, type CategoryOption } from "@/components/admin/products/ProductEditor";
import { cldThumb } from "@/lib/cloudinary-url";

type StatusFilter = "all" | "active" | "inactive" | "low-stock";
type SortKey = "newest" | "name" | "price-asc" | "price-desc" | "stock";

const selectClass = "px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRecord | Partial<ProductRecord> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/products?limit=500");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProducts(data.products || []);
  };

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetch("/api/categories").then((r) => r.json()).then((d) => Array.isArray(d) && setCategories(d)),
      fetch("/api/brands").then((r) => r.json()).then((d) => Array.isArray(d) && setBrands(d)),
    ])
      .catch(() => toast.error("Couldn't load the catalog. Refresh to try again."))
      .finally(() => setLoading(false));
  }, []);

  const categoryName = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.name])), [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (brandFilter !== "all" && p.brand !== brandFilter) return false;
      if (status === "active" && p.isActive === false) return false;
      if (status === "inactive" && p.isActive !== false) return false;
      if (status === "low-stock" && (p.stock ?? 0) > 5) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
    });
    const sorters: Record<SortKey, (a: ProductRecord, b: ProductRecord) => number> = {
      newest: () => 0,
      name: (a, b) => a.name.localeCompare(b.name),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      stock: (a, b) => (a.stock ?? 0) - (b.stock ?? 0),
    };
    return sort === "newest" ? list : [...list].sort(sorters[sort]);
  }, [products, search, catFilter, brandFilter, status, sort]);

  const stats = useMemo(
    () => ({
      total: products.length,
      hidden: products.filter((p) => p.isActive === false).length,
      lowStock: products.filter((p) => (p.stock ?? 0) <= 5).length,
      noPhoto: products.filter((p) => !p.img).length,
    }),
    [products]
  );

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (p: ProductRecord) => {
    setEditing(p);
    setEditorOpen(true);
  };
  const openDuplicate = (p: ProductRecord) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, slug, sku, ...rest } = p;
    setEditing({ ...rest, name: `${p.name} (copy)` });
    setEditorOpen(true);
  };

  const toggleActive = async (p: ProductRecord) => {
    const next = p.isActive === false;
    setProducts((list) => list.map((x) => (x._id === p._id ? { ...x, isActive: next } : x)));
    const res = await fetch(`/api/products/${p._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    if (!res.ok) {
      setProducts((list) => list.map((x) => (x._id === p._id ? { ...x, isActive: !next } : x)));
      toast.error((await res.json().catch(() => ({}))).error || "Couldn't change visibility.");
    } else {
      toast.success(next ? `${p.name} is visible` : `${p.name} is hidden`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${deleteTarget._id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error || "Couldn't delete the product.");
      return;
    }
    setProducts((list) => list.filter((x) => x._id !== deleteTarget._id));
    toast.success("Product deleted");
    setDeleteTarget(null);
  };

  const filtersActive = catFilter !== "all" || brandFilter !== "all" || status !== "all" || search;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading catalog…" : `${stats.total} products · ${stats.hidden} hidden`}
          </p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {/* Attention strip: only shows what needs work */}
      {!loading && (stats.lowStock > 0 || stats.noPhoto > 0) && (
        <div className="flex flex-wrap gap-2">
          {stats.lowStock > 0 && (
            <button onClick={() => setStatus(status === "low-stock" ? "all" : "low-stock")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${status === "low-stock" ? "bg-warning/15 border-warning/40 text-foreground" : "border-border hover:border-warning/40"}`}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning mr-1.5 align-middle" />
              {stats.lowStock} low on stock
            </button>
          )}
          {stats.noPhoto > 0 && (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground">
              <ImageOff className="inline w-3 h-3 mr-1 -mt-0.5" />
              {stats.noPhoto} without a photo
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, brand or SKU" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2">
          <select aria-label="Category" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={selectClass}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
          </select>
          <select aria-label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={selectClass}>
            <option value="all">All brands</option>
            {brands.map((b) => <option key={b._id} value={b.name}>{b.name}</option>)}
          </select>
          <select aria-label="Visibility" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass}>
            <option value="all">Any status</option>
            <option value="active">Visible</option>
            <option value="inactive">Hidden</option>
            <option value="low-stock">Low stock</option>
          </select>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${selectClass} pl-8 w-full`}>
              <option value="newest">Newest</option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Price, low first</option>
              <option value="price-desc">Price, high first</option>
              <option value="stock">Stock, low first</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Product</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Rating</th>
                <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Visible</th>
                <th className="text-right py-3 px-4 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 px-4" colSpan={7}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-muted animate-pulse" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                          <div className="h-2.5 w-1/4 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading &&
                filtered.map((p) => {
                  const discount = p.was && p.was > p.price ? Math.round(((p.was - p.price) / p.was) * 100) : 0;
                  const stock = p.stock ?? 0;
                  return (
                    <tr key={p._id} className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${p.isActive === false ? "opacity-60" : ""}`}>
                      <td className="py-2.5 px-4">
                        <button onClick={() => openEdit(p)} className="flex items-center gap-3 text-left group">
                          <div className="w-11 h-11 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {p.img ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={cldThumb(p.img, 96)} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <ImageOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.brand}
                              {p.sku && <span className="font-mono ml-1.5 opacity-70">{p.sku}</span>}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="py-2.5 px-4 hidden md:table-cell text-muted-foreground">{categoryName[p.category] || p.category}</td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <p className="font-display font-semibold tabular-nums">৳{p.price.toLocaleString()}</p>
                        {discount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            <span className="line-through">৳{p.was!.toLocaleString()}</span> <span className="text-success font-medium">−{discount}%</span>
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-4 hidden sm:table-cell">
                        <span className={`tabular-nums text-xs font-medium ${stock === 0 ? "text-destructive" : stock <= 5 ? "text-warning" : "text-muted-foreground"}`}>
                          {stock === 0 ? "Out of stock" : `${stock} left`}
                        </span>
                        {p.tag && <span className="block text-[10px] mt-0.5 text-primary font-medium">{p.tag}</span>}
                      </td>
                      <td className="py-2.5 px-4 hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          {p.rating} <span className="text-muted-foreground">({p.reviews})</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 hidden sm:table-cell">
                        <button
                          role="switch"
                          aria-checked={p.isActive !== false}
                          aria-label={`${p.isActive === false ? "Show" : "Hide"} ${p.name}`}
                          onClick={() => toggleActive(p)}
                          className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${p.isActive !== false ? "bg-primary justify-end" : "bg-muted justify-start"}`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow" />
                        </button>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => openEdit(p)} className="p-2 hover:bg-accent rounded-lg transition" title="Edit"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => openDuplicate(p)} className="p-2 hover:bg-accent rounded-lg transition hidden sm:block" title="Duplicate"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-2 hover:bg-destructive/10 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <PackageOpen className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    {filtersActive ? (
                      <>
                        <p className="font-medium">No products match these filters</p>
                        <button
                          onClick={() => {
                            setSearch("");
                            setCatFilter("all");
                            setBrandFilter("all");
                            setStatus("all");
                          }}
                          className="mt-2 text-sm text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Your catalog is empty</p>
                        <button onClick={openNew} className="mt-2 text-sm text-primary hover:underline">Add your first product</button>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        product={editing}
        brands={brands}
        categories={categories}
        onBrandCreated={(b) => setBrands((list) => [...list, b].sort((x, y) => x.name.localeCompare(y.name)))}
        onCategoryCreated={(c) => setCategories((list) => [...list, c].sort((x, y) => x.name.localeCompare(y.name)))}
        onSaved={() => fetchProducts().catch(() => toast.error("Saved, but the list didn't refresh. Reload the page."))}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => !deleting && setDeleteTarget(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h3 id="del-title" className="font-display font-semibold text-lg">Delete this product?</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{deleteTarget.name} will be removed from the store. To keep it but stop selling it, hide it instead.</p>
            <div className="flex gap-3 mt-6">
              <button autoFocus onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Keep it</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
