"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, m, useDragControls } from "motion/react";
import {
  ChevronRight, LayoutGrid, Rows3, Search, SlidersHorizontal, X, PackageOpen, ArrowUpDown,
  Smartphone, Laptop, Headphones, Watch, Monitor, Keyboard, Tablet, Volume2, Radio, Zap, Tag, Star,
} from "lucide-react";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/site-data";
import { ProductCard } from "@/components/ProductCard";
import { ProductListView } from "@/components/shop/ProductListView";
import { ProductQuickView } from "@/components/shop/ProductQuickView";
import { FilterPanel, ALL_BRAND_NAMES } from "@/components/shop/FilterPanel";
import {
  DEFAULT_STATE, SORTS, activeFilterCount, facetCounts, formatTaka, matches, parseState, sortProducts, toQuery,
  type Facet, type ShopState, type SortKey,
} from "@/lib/shop-filters";

const PAGE_SIZE = 24;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  smartphones: Smartphone, laptops: Laptop, earbuds: Headphones, headphones: Headphones, smartwatches: Watch,
  monitors: Monitor, keyboards: Keyboard, tablets: Tablet, speakers: Volume2, drones: Radio, power: Zap, accessories: Tag,
};

/* Removable chips for everything that narrows the results. */
function activeChips(s: ShopState): { key: string; label: string; patch: Partial<ShopState>; facet: Facet }[] {
  const chips: { key: string; label: string; patch: Partial<ShopState>; facet: Facet }[] = [];
  if (s.q.trim()) chips.push({ key: "q", label: `“${s.q.trim()}”`, patch: { q: "" }, facet: "q" });
  for (const b of s.brands) chips.push({ key: `b-${b}`, label: b, patch: { brands: s.brands.filter((x) => x !== b) }, facet: "brands" });
  if (s.min !== null || s.max !== null)
    chips.push({
      key: "price",
      label: s.min !== null && s.max !== null ? `${formatTaka(s.min)} – ${formatTaka(s.max)}` : s.min !== null ? `From ${formatTaka(s.min)}` : `Up to ${formatTaka(s.max!)}`,
      patch: { min: null, max: null },
      facet: "price",
    });
  if (s.emi) chips.push({ key: "emi", label: "0% EMI", patch: { emi: false }, facet: "emi" });
  if (s.minDiscount) chips.push({ key: "off", label: `${s.minDiscount}%+ off`, patch: { minDiscount: 0 }, facet: "discount" });
  for (const t of s.tags) chips.push({ key: `t-${t}`, label: t, patch: { tags: s.tags.filter((x) => x !== t) }, facet: "tags" });
  if (s.minRating) chips.push({ key: "rating", label: `${s.minRating}★ and up`, patch: { minRating: 0 }, facet: "rating" });
  return chips;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ShopState>(() => parseState(new URLSearchParams(searchParams.toString())));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const lastWritten = useRef(toQuery(state));
  const resultsRef = useRef<HTMLDivElement>(null);

  // Links elsewhere (header search, mega menus, back button) change the URL: adopt it.
  useEffect(() => {
    const incoming = parseState(new URLSearchParams(searchParams.toString()));
    const qs = toQuery(incoming);
    if (qs !== lastWritten.current) {
      lastWritten.current = qs;
      setState(incoming);
    }
  }, [searchParams]);

  // Keep the URL in step with the filters, so any view can be shared or bookmarked.
  useEffect(() => {
    const qs = toQuery(state);
    if (qs === lastWritten.current) return;
    lastWritten.current = qs;
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  }, [state]);

  const update = (patch: Partial<ShopState>) => setState((s) => ({ ...s, ...patch }));
  const clearFilters = () => setState((s) => ({ ...DEFAULT_STATE, category: s.category, sort: s.sort, view: s.view }));

  // Filtering 145 items is cheap, but deferring keeps typing smooth while the grid re-renders.
  const deferred = useDeferredValue(state);
  const results = useMemo(() => sortProducts(PRODUCTS.filter((p) => matches(p, deferred)), deferred.sort), [deferred]);
  const counts = useMemo(() => facetCounts(PRODUCTS, deferred), [deferred]);

  // New filters start from the first page.
  const filterKey = toQuery({ ...deferred, view: "grid" });
  useEffect(() => setVisibleCount(PAGE_SIZE), [filterKey]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const chips = activeChips(state);
  const filterCount = activeFilterCount(state);
  const category = CATEGORIES.find((c) => c.slug === state.category);
  const visible = results.slice(0, visibleCount);
  const isStale = deferred !== state;

  // When nothing matches, suggest the single change that brings the most back.
  const rescues = useMemo(() => {
    if (results.length) return [];
    return activeChips(deferred)
      .map((c) => ({ ...c, n: PRODUCTS.filter((p) => matches(p, { ...deferred, ...c.patch })).length }))
      .filter((c) => c.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);
  }, [results.length, deferred]);

  const title = state.q.trim() ? `Results for “${state.q.trim()}”` : category ? category.name : "All products";

  return (
    <>
      <section className="container-x pt-6 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {category ? (
            <>
              <button onClick={() => update({ category: "all" })} className="hover:text-foreground transition-colors">Shop</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium" aria-current="page">{category.name}</span>
            </>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">Shop</span>
          )}
        </nav>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {results.length} {results.length === 1 ? "product" : "products"}
            {category && !state.q && <span className="hidden sm:inline"> · {category.tagline}</span>}
          </p>
        </div>

        {/* Category rail with live counts */}
        <div className="relative mt-5 -mx-5 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 sm:px-0 pb-1 snap-x">
            {[{ slug: "all", name: "All", count: counts.categoryTotal }, ...CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, count: counts.categories.get(c.slug) || 0 }))].map((c) => {
              const active = state.category === c.slug;
              const Icon = CATEGORY_ICONS[c.slug] || LayoutGrid;
              return (
                <button
                  key={c.slug}
                  onClick={() => update({ category: c.slug })}
                  aria-pressed={active}
                  disabled={!active && c.count === 0}
                  className={`relative snap-start shrink-0 inline-flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-xl border text-sm transition-colors disabled:opacity-40 ${
                    active ? "border-transparent text-primary-foreground" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {active && <m.span layoutId="category-pill" transition={{ type: "spring", stiffness: 500, damping: 40 }} className="absolute inset-0 rounded-xl gradient-brand -z-0" />}
                  <Icon className={`relative w-4 h-4 ${active ? "" : "text-primary"}`} />
                  <span className="relative font-medium">{c.name}</span>
                  <span className={`relative text-xs tabular-nums ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="grid lg:grid-cols-[264px_1fr] gap-8 items-start">
          {/* Desktop filters: sticky, scroll on their own */}
          <aside className="hidden lg:block sticky top-[7.75rem] max-h-[calc(100vh-8.75rem)] overflow-y-auto scrollbar-thin pr-2 -mr-2" aria-label="Filters">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">Filters</h2>
              {filterCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-medium text-primary hover:underline">Clear all ({filterCount})</button>
              )}
            </div>
            <FilterPanel state={state} counts={counts} onChange={update} brandNames={ALL_BRAND_NAMES} />
          </aside>

          <div ref={resultsRef} className="min-w-0 scroll-mt-32">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  value={state.q}
                  onChange={(e) => update({ q: e.target.value })}
                  placeholder={category ? `Search in ${category.name.toLowerCase()}` : "Search model, brand or spec"}
                  aria-label="Search products"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring [&::-webkit-search-cancel-button]:hidden"
                />
                {state.q && (
                  <button onClick={() => update({ q: "" })} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Clear search">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setSheetOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {filterCount > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">{filterCount}</span>}
              </button>

              <label className="relative inline-flex items-center">
                <span className="sr-only">Sort by</span>
                <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <select
                  value={state.sort}
                  onChange={(e) => update({ sort: e.target.value as SortKey })}
                  className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <ChevronRight className="absolute right-2.5 w-3.5 h-3.5 rotate-90 text-muted-foreground pointer-events-none" />
              </label>

              <div className="hidden sm:flex p-1 rounded-xl border border-border bg-card" role="radiogroup" aria-label="Layout">
                {([
                  { id: "grid", icon: LayoutGrid, label: "Grid" },
                  { id: "list", icon: Rows3, label: "List" },
                ] as const).map((v) => (
                  <button
                    key={v.id}
                    role="radio"
                    aria-checked={state.view === v.id}
                    aria-label={v.label}
                    title={v.label}
                    onClick={() => update({ view: v.id })}
                    className={`relative p-1.5 rounded-lg transition-colors ${state.view === v.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {state.view === v.id && <m.span layoutId="view-toggle" transition={{ type: "spring", stiffness: 500, damping: 40 }} className="absolute inset-0 rounded-lg bg-primary/10" />}
                    <v.icon className="relative w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters */}
            <AnimatePresence initial={false}>
              {chips.length > 0 && (
                <m.div
                  key="chips"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-1.5 pt-3">
                    <AnimatePresence initial={false} mode="popLayout">
                      {chips.map((c) => (
                        <m.button
                          layout
                          key={c.key}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => update(c.patch)}
                          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
                          aria-label={`Remove filter ${c.label}`}
                        >
                          {c.label} <X className="w-3 h-3" />
                        </m.button>
                      ))}
                    </AnimatePresence>
                    {chips.length > 1 && (
                      <button onClick={() => setState((s) => ({ ...DEFAULT_STATE, category: s.category, sort: s.sort, view: s.view }))} className="text-xs text-muted-foreground hover:text-foreground px-1.5 underline-offset-2 hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className={`mt-5 transition-opacity duration-150 ${isStale ? "opacity-60" : ""}`} aria-live="polite" aria-busy={isStale}>
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-14 px-6 text-center">
                  <PackageOpen className="w-10 h-10 mx-auto text-muted-foreground" />
                  <h2 className="font-display font-semibold text-xl mt-3">Nothing matches all of these filters</h2>
                  {rescues.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mt-1.5">Try removing one of them:</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {rescues.map((r) => (
                          <button key={r.key} onClick={() => update(r.patch)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-sm hover:border-primary/40 transition-colors">
                            <X className="w-3.5 h-3.5 text-muted-foreground" /> Remove {r.label}
                            <span className="text-xs text-muted-foreground">({r.n})</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button onClick={() => setState(DEFAULT_STATE)} className="mt-4 px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium">
                      Show all products
                    </button>
                  )}
                </div>
              ) : state.view === "list" ? (
                <ul className="space-y-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visible.map((p) => (
                      <m.li
                        key={p.slug}
                        layout="position"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                      >
                        <ProductListView product={p} onQuickView={setQuickView} />
                      </m.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visible.map((p) => (
                      <m.li
                        key={p.slug}
                        layout="position"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                      >
                        <ProductCard p={p} onQuickView={setQuickView} />
                      </m.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {results.length > 0 && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground tabular-nums">
                    Showing {visible.length} of {results.length}
                  </p>
                  <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
                    <m.div className="h-full bg-primary rounded-full" animate={{ width: `${(visible.length / results.length) * 100}%` }} transition={{ duration: 0.4, ease: EASE_OUT }} />
                  </div>
                  {visible.length < results.length && (
                    <button
                      onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                      className="mt-1 px-6 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 hover:bg-accent/40 transition-colors"
                    >
                      Show {Math.min(PAGE_SIZE, results.length - visible.length)} more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Help banner */}
      <section className="container-x pb-16">
        <div className="rounded-3xl bg-brand-dark text-white p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary/30 blur-3xl" aria-hidden />
          <div className="relative max-w-xl">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Not sure which one to pick?</h2>
            <p className="text-sm text-white/70 mt-2">Tell us what you need and our team will compare models, warranty and EMI options for you, seven days a week.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <Link href="/contact" className="px-5 py-3 rounded-xl bg-white text-brand-dark text-sm font-semibold hover:bg-white/90 transition-colors">Ask an expert</Link>
            <Link href="/shop?sort=rating" className="px-5 py-3 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-1.5">
              <Star className="w-4 h-4" /> See top rated
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile filter sheet */}
      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} count={results.length} filterCount={filterCount} onClear={clearFilters}>
        <FilterPanel state={state} counts={counts} onChange={update} brandNames={ALL_BRAND_NAMES} />
      </FilterSheet>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

function FilterSheet({ open, onClose, count, filterCount, onClear, children }: {
  open: boolean; onClose: () => void; count: number; filterCount: number; onClear: () => void; children: React.ReactNode;
}) {
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div key="sheet" className="fixed inset-0 z-[60] lg:hidden" initial="closed" animate="open" exit="closed">
          <m.div
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            variants={{ open: { y: "0%" }, closed: { y: "100%" } }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="absolute inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl bg-background border-t border-border shadow-2xl flex flex-col"
          >
            <div onPointerDown={(e) => drag.start(e)} className="touch-none cursor-grab active:cursor-grabbing pt-2.5 pb-3 px-5 border-b border-border">
              <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center justify-between mt-3">
                <h2 className="font-display font-semibold text-lg">Filters</h2>
                <div className="flex items-center gap-1">
                  {filterCount > 0 && <button onClick={onClear} className="px-2 py-1 text-sm text-primary font-medium">Clear all</button>}
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-accent" aria-label="Close filters"><X className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
            <div className="p-4 border-t border-border pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button onClick={onClose} className="w-full py-3 rounded-xl gradient-brand text-primary-foreground font-semibold text-sm tabular-nums">
                {count ? `Show ${count} ${count === 1 ? "product" : "products"}` : "No products match"}
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10">
          <div className="h-9 w-56 rounded-lg bg-muted animate-pulse" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />)}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
