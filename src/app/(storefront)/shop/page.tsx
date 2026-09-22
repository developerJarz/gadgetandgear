"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Grid3X3,
  LayoutGrid,
  ListFilter,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Zap,
  SlidersHorizontal,
  RotateCcw,
  PackageOpen,
  ArrowUpDown,
} from "lucide-react";
import { CATEGORIES, PRODUCTS, Product } from "@/lib/site-data";
import { ProductCard } from "@/components/ProductCard";
import { CategoryShowcase } from "@/components/shop/CategoryShowcase";
import {
  ShopFilters,
  ActiveFilterChips,
  FilterState,
  INITIAL_FILTERS,
  PRICE_PRESETS,
} from "@/components/shop/ShopFilters";
import { ProductQuickView } from "@/components/shop/ProductQuickView";
import { ProductListView } from "@/components/shop/ProductListView";

const SORTS = [
  { id: "featured", label: "Featured & Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated (★)" },
  { id: "discount", label: "Biggest Discount (%)" },
  { id: "newest", label: "Newest Arrivals" },
] as const;

type SortOption = (typeof SORTS)[number]["id"];
type ViewMode = "grid-large" | "grid-compact" | "list";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial category & brand from URL query params
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand");
  const initialQuery = searchParams.get("q") || "";

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    category: initialCategory,
    selectedBrands: initialBrand ? [initialBrand] : [],
    searchQuery: initialQuery,
  }));

  const [sort, setSort] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-large");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync state if URL query params change
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlBrand = searchParams.get("brand");
    const urlQ = searchParams.get("q");

    if (urlCategory && urlCategory !== filters.category) {
      setFilters((prev) => ({ ...prev, category: urlCategory }));
    }
    if (urlBrand && !filters.selectedBrands.includes(urlBrand)) {
      setFilters((prev) => ({ ...prev, selectedBrands: [urlBrand] }));
    }
    if (urlQ !== null && urlQ !== filters.searchQuery) {
      setFilters((prev) => ({ ...prev, searchQuery: urlQ }));
    }
  }, [searchParams]);

  // Handle category change and optionally sync URL
  const handleCategorySelect = (categorySlug: string) => {
    setFilters((prev) => ({ ...prev, category: categorySlug }));
    if (categorySlug === "all") {
      router.push("/shop", { scroll: false });
    } else {
      router.push(`/shop?category=${categorySlug}`, { scroll: false });
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    router.push("/shop", { scroll: false });
  };

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (filters.category !== "all" && p.category !== filters.category) {
        return false;
      }

      // Keyword search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTag = p.tag?.toLowerCase().includes(q);
        const matchesSpecs = p.specs?.some((s) => s.toLowerCase().includes(q));
        if (
          !matchesName &&
          !matchesBrand &&
          !matchesCategory &&
          !matchesTag &&
          !matchesSpecs
        ) {
          return false;
        }
      }

      // Brand filter
      if (
        filters.selectedBrands.length > 0 &&
        !filters.selectedBrands.includes(p.brand)
      ) {
        return false;
      }

      // Price filter
      if (
        p.price < filters.priceRange[0] ||
        p.price > filters.priceRange[1]
      ) {
        return false;
      }

      // Tags filter (Flash Deal, Bestseller, etc.)
      if (
        filters.selectedTags.length > 0 &&
        (!p.tag || !filters.selectedTags.includes(p.tag))
      ) {
        return false;
      }

      // Minimum rating
      if (filters.minRating > 0 && p.rating < filters.minRating) {
        return false;
      }

      // Official warranty only
      if (
        filters.officialOnly &&
        (!p.warranty || !p.warranty.toLowerCase().includes("official"))
      ) {
        return false;
      }

      // EMI available only
      if (filters.emiOnly && !p.emiAvailable) {
        return false;
      }

      // In stock only
      if (filters.inStockOnly && p.inStock === false) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "discount":
        return list.sort((a, b) => {
          const offA = a.was ? (a.was - a.price) / a.was : 0;
          const offB = b.was ? (b.was - b.price) / b.was : 0;
          return offB - offA;
        });
      case "newest":
        return list.sort((a, b) => (b.tag === "New" ? 1 : 0) - (a.tag === "New" ? 1 : 0));
      case "featured":
      default:
        return list;
    }
  }, [filteredProducts, sort]);

  // Fallback recommended products for empty states
  const recommendedProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.tag === "Bestseller" || p.tag === "Flash Deal").slice(0, 4);
  }, []);

  return (
    <>
      {/* 1. NARROW & SLEEK SHOP HEADER WITH SEARCH & BREADCRUMBS */}
      <section className="border-b border-border bg-card/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,oklch(0.88_0.08_260/.3),transparent_60%)]" />
        
        <div className="container-x py-4 sm:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Breadcrumbs & Compact Title */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition">
                  Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">Shop</span>
                {filters.category !== "all" && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-primary font-semibold capitalize">
                      {CATEGORIES.find((c) => c.slug === filters.category)?.name || filters.category}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-baseline gap-2.5 mt-1">
                <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                  {filters.category === "all" ? (
                    <>Shop <span className="text-gradient-brand">All Gadgets</span></>
                  ) : (
                    <span>{CATEGORIES.find((c) => c.slug === filters.category)?.name || "Gadgets"}</span>
                  )}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {sortedProducts.length} items
                </span>
              </div>
            </div>

            {/* Right: Integrated Search Input & Trust Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder="Search model, brand, specs..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-background/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, searchQuery: "" }))
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Compact Badges */}
              <div className="hidden xl:flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border/80 text-success">
                  <ShieldCheck className="w-3 h-3" /> Official Warranty
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border/80 text-primary">
                  <Zap className="w-3 h-3" /> 0% EMI
                </span>
              </div>
            </div>
          </div>

          {/* Compact Category Showcase Strip */}
          <div className="mt-4 pt-3.5 border-t border-border/60">
            <CategoryShowcase
              activeCategory={filters.category}
              onSelectCategory={handleCategorySelect}
              totalProductsCount={PRODUCTS.length}
            />
          </div>

          {/* Quick Price Range Filter Bar */}
          <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" /> Price:
            </span>
            {PRICE_PRESETS.map((preset) => {
              const isActive =
                filters.priceRange[0] === preset.min &&
                filters.priceRange[1] === preset.max;
              return (
                <button
                  key={preset.label}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [preset.min, preset.max],
                    }))
                  }
                  className={`px-3 py-1 text-xs rounded-full border shrink-0 transition font-medium ${
                    isActive
                      ? "gradient-brand text-primary-foreground border-transparent shadow-sm font-semibold"
                      : "border-border/80 bg-background/80 hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN CATALOG SECTION (SIDEBAR + PRODUCTS GRID/LIST) */}
      <section className="container-x py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar (Desktop) + Mobile Drawer */}
          <ShopFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            products={PRODUCTS}
            totalMatches={sortedProducts.length}
          />

          {/* Products Content Area */}
          <div className="flex-1 w-full space-y-5">
            {/* Control Toolbar */}
            <div className="p-4 rounded-2xl border border-border bg-card/80 backdrop-blur shadow-sm flex flex-wrap items-center justify-between gap-4">
              {/* Product Counter & Mobile filter trigger */}
              <div className="flex items-center gap-3">
                <p className="text-xs sm:text-sm font-medium">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {sortedProducts.length}
                  </span>{" "}
                  of {PRODUCTS.length} products
                </p>
              </div>

              {/* Toolbar Actions: Sort & View Modes */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium cursor-pointer transition"
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle Buttons */}
                <div className="hidden sm:flex items-center border border-border rounded-xl p-1 bg-secondary/50">
                  <button
                    onClick={() => setViewMode("grid-large")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "grid-large"
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="4 columns grid view"
                    title="4 Columns Grid"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setViewMode("grid-compact")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "grid-compact"
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="3 columns grid view"
                    title="3 Columns Grid"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="List view"
                    title="Detailed List View"
                  >
                    <ListFilter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            <ActiveFilterChips
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />

            {/* Products Display */}
            {sortedProducts.length === 0 ? (
              /* Empty State */
              <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-secondary/20 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="font-display font-bold text-xl">
                    No gadgets match your filters
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Try adjusting your search keyword, relaxing price ranges, or removing specific brand filters.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-brand text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>

                {/* Recommendations */}
                <div className="pt-8 mt-8 border-t border-border text-left">
                  <p className="font-display font-semibold text-sm mb-4">
                    Or check out these popular gadgets:
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {recommendedProducts.map((p) => (
                      <ProductCard
                        key={p.slug}
                        p={p}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : viewMode === "list" ? (
              /* List View Mode */
              <div className="space-y-3.5">
                {sortedProducts.map((p) => (
                  <ProductListView
                    key={p.slug}
                    product={p}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              /* Grid View Mode (Large or Compact) */
              <div
                className={`grid gap-4 lg:gap-6 ${
                  viewMode === "grid-compact"
                    ? "grid-cols-2 md:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {sortedProducts.map((p) => (
                  <ProductCard
                    key={p.slug}
                    p={p}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. BOTTOM PROMOTIONAL BANNER */}
      <section className="container-x pb-16">
        <div className="rounded-3xl border border-border bg-gradient-to-r from-brand-dark via-primary/90 to-brand-dark p-8 sm:p-12 text-primary-foreground relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-primary blur-3xl opacity-40" />
          <div className="relative max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs uppercase tracking-wider font-semibold">
              <Zap className="w-3.5 h-3.5" /> Need Assistance?
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              Can&apos;t decide which gadget is right for you?
            </h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Our certified gadget specialists are available 7 days a week to help you choose the best specs, configure custom laptop builds, or advise on 0% EMI financing.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="px-6 py-3 rounded-full bg-background text-foreground font-semibold text-xs hover:bg-accent transition shadow-lg"
              >
                Chat with Expert
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 rounded-full glass border border-white/20 text-xs font-semibold hover:bg-white/10 transition"
              >
                Visit Stores in Dhaka
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground font-display">
            Loading Gadget Catalog...
          </p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
