"use client";

import { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Star,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BRANDS, CATEGORIES, Product } from "@/lib/site-data";

export interface FilterState {
  searchQuery: string;
  category: string;
  selectedBrands: string[];
  priceRange: [number, number];
  selectedTags: string[];
  minRating: number;
  officialOnly: boolean;
  emiOnly: boolean;
  inStockOnly: boolean;
}

export const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  category: "all",
  selectedBrands: [],
  priceRange: [0, 350000],
  selectedTags: [],
  minRating: 0,
  officialOnly: false,
  emiOnly: false,
  inStockOnly: false,
};

export const PRICE_PRESETS = [
  { label: "All Prices", min: 0, max: 350000 },
  { label: "Under ৳10,000", min: 0, max: 10000 },
  { label: "৳10,000 – ৳20,000", min: 10000, max: 20000 },
  { label: "৳20,000 – ৳30,000", min: 20000, max: 30000 },
  { label: "৳30,000 – ৳40,000", min: 30000, max: 40000 },
  { label: "৳40,000 – ৳60,000", min: 40000, max: 60000 },
  { label: "৳60,000 – ৳100,000", min: 60000, max: 100000 },
  { label: "Above ৳100,000", min: 100000, max: 350000 },
];

const TAG_OPTIONS = ["Flash Deal", "Bestseller", "New", "Pre-order", "Official"];

interface ShopFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  products: Product[];
  totalMatches: number;
}

export function ShopFilters({
  filters,
  onChange,
  onReset,
  products,
  totalMatches,
}: ShopFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    price: true,
    tags: true,
    services: true,
    rating: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBrandToggle = (brand: string) => {
    const next = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand];
    onChange({ ...filters, selectedBrands: next });
  };

  const handleTagToggle = (tag: string) => {
    const next = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];
    onChange({ ...filters, selectedTags: next });
  };

  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    filters.selectedBrands.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 350000 ? 1 : 0) +
    filters.selectedTags.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.officialOnly ? 1 : 0) +
    (filters.emiOnly ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  // Count products per brand based on current category
  const brandCounts = BRANDS.reduce((acc, brand) => {
    acc[brand] = products.filter(
      (p) =>
        (filters.category === "all" || p.category === filters.category) &&
        p.brand.toLowerCase() === brand.toLowerCase()
    ).length;
    return acc;
  }, {} as Record<string, number>);

  const filterContent = (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-base">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full gradient-brand text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" /> Reset all
          </button>
        )}
      </div>

      {/* Instant Search in Filter Panel */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search model, brand..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range & Quick Presets */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Price Range
          </span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            {/* Quick Price Preset Chips */}
            <div className="space-y-1">
              {PRICE_PRESETS.map((preset) => {
                const isActive =
                  filters.priceRange[0] === preset.min &&
                  filters.priceRange[1] === preset.max;
                const count = products.filter((p) => {
                  const matchesCat = filters.category === "all" || p.category === filters.category;
                  return matchesCat && p.price >= preset.min && p.price <= preset.max;
                }).length;

                return (
                  <button
                    key={preset.label}
                    onClick={() =>
                      onChange({
                        ...filters,
                        priceRange: [preset.min, preset.max],
                      })
                    }
                    className={`w-full px-2.5 py-1.5 text-xs rounded-xl border flex items-center justify-between transition font-medium ${
                      isActive
                        ? "gradient-brand text-primary-foreground border-transparent shadow-sm"
                        : "border-border/80 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className={`text-[10px] font-mono ${isActive ? "text-primary-foreground/90 font-bold" : "text-muted-foreground"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Min / Max inputs */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <span className="text-[10px] text-muted-foreground">Min (৳)</span>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      priceRange: [Number(e.target.value) || 0, filters.priceRange[1]],
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="text-muted-foreground mt-4 text-xs">–</span>
              <div className="flex-1">
                <span className="text-[10px] text-muted-foreground">Max (৳)</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      priceRange: [filters.priceRange[0], Number(e.target.value) || 350000],
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Brands
          </span>
          {expandedSections.brands ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {expandedSections.brands && (
          <div className="mt-3 space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {BRANDS.map((brand) => {
              const checked = filters.selectedBrands.includes(brand);
              const count = brandCounts[brand] || 0;
              return (
                <label
                  key={brand}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                    checked
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent/60 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={checked ? "text-foreground font-semibold" : ""}>
                      {brand}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Deals & Badges */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("tags")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Badges & Deals
          </span>
          {expandedSections.tags ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {expandedSections.tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((tag) => {
              const active = filters.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    active
                      ? "gradient-brand text-primary-foreground border-transparent shadow-sm"
                      : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Services & Guarantees */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("services")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Services & Warranty
          </span>
          {expandedSections.services ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {expandedSections.services && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={filters.officialOnly}
                onChange={(e) =>
                  onChange({ ...filters, officialOnly: e.target.checked })
                }
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Official BD Warranty
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={filters.emiOnly}
                onChange={(e) =>
                  onChange({ ...filters, emiOnly: e.target.checked })
                }
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> 0% EMI Available
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Customer Rating
          </span>
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {expandedSections.rating && (
          <div className="mt-3 space-y-1.5">
            {[4.8, 4.5, 4.0].map((r) => (
              <button
                key={r}
                onClick={() =>
                  onChange({
                    ...filters,
                    minRating: filters.minRating === r ? 0 : r,
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition ${
                  filters.minRating === r
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                  <span>{r}★ & above</span>
                </div>
                {filters.minRating === r && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 p-5 rounded-2xl border border-border bg-card/70 backdrop-blur shadow-sm">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-xs font-medium hover:bg-accent transition shadow-sm"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full gradient-brand text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom/Slide Drawer Modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-h-[85vh] bg-background border-t border-border rounded-t-3xl p-6 overflow-y-auto shadow-2xl z-10 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-lg">Filter Products</h3>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {filterContent}

            <div className="mt-6 pt-4 border-t border-border flex gap-3 sticky bottom-0 bg-background pb-2">
              <button
                onClick={() => {
                  onReset();
                  setMobileOpen(false);
                }}
                className="flex-1 py-3 rounded-xl border border-border text-xs font-medium"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-3 rounded-xl gradient-brand text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/20"
              >
                Show {totalMatches} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Active Filter Chips component for quick removal
export function ActiveFilterChips({
  filters,
  onChange,
  onReset,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}) {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.searchQuery) {
    chips.push({
      label: `"${filters.searchQuery}"`,
      onRemove: () => onChange({ ...filters, searchQuery: "" }),
    });
  }

  if (filters.category !== "all") {
    const cat = CATEGORIES.find((c) => c.slug === filters.category);
    chips.push({
      label: `Category: ${cat?.name || filters.category}`,
      onRemove: () => onChange({ ...filters, category: "all" }),
    });
  }

  filters.selectedBrands.forEach((b) => {
    chips.push({
      label: b,
      onRemove: () =>
        onChange({
          ...filters,
          selectedBrands: filters.selectedBrands.filter((brand) => brand !== b),
        }),
    });
  });

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 350000) {
    chips.push({
      label: `৳${filters.priceRange[0].toLocaleString()} - ৳${filters.priceRange[1].toLocaleString()}`,
      onRemove: () => onChange({ ...filters, priceRange: [0, 350000] }),
    });
  }

  filters.selectedTags.forEach((t) => {
    chips.push({
      label: t,
      onRemove: () =>
        onChange({
          ...filters,
          selectedTags: filters.selectedTags.filter((tag) => tag !== t),
        }),
    });
  });

  if (filters.officialOnly) {
    chips.push({
      label: "Official Warranty",
      onRemove: () => onChange({ ...filters, officialOnly: false }),
    });
  }

  if (filters.emiOnly) {
    chips.push({
      label: "0% EMI",
      onRemove: () => onChange({ ...filters, emiOnly: false }),
    });
  }

  if (filters.minRating > 0) {
    chips.push({
      label: `★ ${filters.minRating}+`,
      onRemove: () => onChange({ ...filters, minRating: 0 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-xs text-muted-foreground font-medium mr-1">
        Active Filters:
      </span>
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-primary/10 border border-primary/25 text-primary font-medium"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="hover:text-destructive transition"
            aria-label="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onReset}
        className="text-xs text-muted-foreground hover:text-destructive font-medium underline underline-offset-2 ml-2 transition"
      >
        Clear all
      </button>
    </div>
  );
}
