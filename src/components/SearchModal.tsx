"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/site-data";
import type { Product } from "@/lib/site-data";

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  // Escape closes; the page behind doesn't scroll while searching.
  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsSearchOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen flex items-start justify-center p-3 pt-4 sm:p-4 sm:pt-24 pointer-events-none">
        <div role="dialog" aria-modal="true" aria-label="Search products" className="pointer-events-auto relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
          {/* Search Bar */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search className="w-5 h-5 text-primary shrink-0 ml-2" />
            <input
              autoFocus
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  setIsSearchOpen(false);
                  router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              placeholder="Search smartphones, laptops, earbuds, brands..."
              className="w-full bg-transparent text-base focus:outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground p-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 hover:bg-accent rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Categories */}
          {!query && (
            <div className="p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["iPhone", "Galaxy", "MacBook", "Sony ANC", "Mechanical Keyboard", "Smartwatch"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary text-xs font-medium border border-border transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 divide-y divide-border/40">
              <p className="text-xs font-medium text-muted-foreground px-2 pb-2">
                Found {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              {results.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/50 transition group pt-3"
                >
                  <div className="w-14 h-14 rounded-xl bg-background border border-border overflow-hidden shrink-0 relative">
                    <Image src={p.img} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{p.brand}</p>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition line-clamp-1">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="font-display font-bold">৳{p.price.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Star className="w-3 h-3 fill-warning text-warning" /> {p.rating}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                </Link>
              ))}
              {results.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No gadgets match your search. Try searching for iPhone, ASUS, or Sony.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
