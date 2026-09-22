"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Monitor,
  Keyboard,
  Tablet,
  Volume2,
  Plane,
  Zap,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { CATEGORIES } from "@/lib/site-data";

const ICON_MAP: Record<string, any> = {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Monitor,
  Keyboard,
  Tablet,
  Volume2,
  Plane,
  Zap,
  Tag,
};

interface CategoryShowcaseProps {
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  totalProductsCount: number;
}

export function CategoryShowcase({
  activeCategory,
  onSelectCategory,
  totalProductsCount,
}: CategoryShowcaseProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.slug === activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Scroll Container with sleek controls */}
      <div className="relative flex items-center">
        {/* Left scroll button */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute -left-3.5 z-10 w-8 h-8 rounded-full border border-border bg-background/95 backdrop-blur shadow-md items-center justify-center hover:bg-accent transition hover:scale-105 active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable category list */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto py-1.5 px-1 -mx-5 px-5 sm:mx-0 sm:px-1 scrollbar-none scroll-smooth w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* "All" button */}
          <button
            onClick={() => onSelectCategory("all")}
            className={`shrink-0 group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
              activeCategory === "all"
                ? "gradient-brand text-primary-foreground border-transparent shadow-md shadow-primary/20 scale-[1.02]"
                : "border-border bg-card/80 hover:bg-accent text-foreground hover:border-primary/40"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                activeCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>All Gadgets</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {/* Individual Category Pills */}
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Smartphone;
            const isSelected = activeCategory === cat.slug;

            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`shrink-0 group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "gradient-brand text-primary-foreground border-transparent shadow-md shadow-primary/20 scale-[1.02]"
                    : "border-border bg-card/80 hover:bg-accent text-foreground hover:border-primary/40"
                }`}
              >
                <div className="relative w-6 h-6 rounded-lg overflow-hidden bg-secondary border border-border/50 shrink-0">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {cat.count.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute -right-3.5 z-10 w-8 h-8 rounded-full border border-border bg-background/95 backdrop-blur shadow-md items-center justify-center hover:bg-accent transition hover:scale-105 active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slim Category Context Bar when a category is selected */}
      {selectedCategoryObj && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs animate-fade-up">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {selectedCategoryObj.name}:
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              {selectedCategoryObj.description}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
            <span className="font-medium text-foreground">{selectedCategoryObj.count}</span>
            <span className="mx-1">·</span>
            <span>Brands: {selectedCategoryObj.popularBrands.slice(0, 3).join(", ")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

