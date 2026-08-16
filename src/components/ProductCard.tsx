"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShieldCheck, ShoppingBag, Eye, Zap } from "lucide-react";
import type { Product } from "@/lib/site-data";
import { useCart } from "@/context/CartContext";

const TAG_STYLES: Record<string, string> = {
  New: "bg-primary text-primary-foreground",
  Bestseller: "bg-warning text-brand-dark",
  "Flash Deal": "bg-destructive text-destructive-foreground",
  "Pre-order": "bg-brand-dark text-primary-foreground",
  Official: "bg-success text-brand-dark",
};

export function ProductCard({
  p,
  onQuickView,
}: {
  p: Product;
  onQuickView?: (p: Product) => void;
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const off = p.was ? Math.round(((p.was - p.price) / p.was) * 100) : 0;
  const inWish = isInWishlist(p.slug);
  const emiMonthly = Math.round(p.price / 12);

  return (
    <div className="group block relative">
      <div className="relative overflow-hidden rounded-2xl bg-secondary border border-border transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
        <Link href={`/product/${p.slug}`} className="block">
          <Image
            src={p.img}
            alt={p.name}
            width={800}
            height={1000}
            loading="lazy"
            className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {p.tag && (
          <span
            className={`absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium shadow-sm pointer-events-none ${
              TAG_STYLES[p.tag] ?? "bg-background text-foreground"
            }`}
          >
            {p.tag}
          </span>
        )}

        {off > 0 && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold text-destructive bg-background/90 backdrop-blur px-2 py-1 rounded-full shadow-sm pointer-events-none">
            -{off}%
          </span>
        )}

        {/* Action icons overlay (Top right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {/* Wishlist Button */}
          <button
            className={`w-8 h-8 rounded-full glass flex items-center justify-center transition shadow-sm ${
              inWish ? "text-destructive bg-destructive/10 !opacity-100" : "hover:text-primary"
            }`}
            aria-label="Wishlist"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(p);
            }}
          >
            <Heart className={`w-3.5 h-3.5 ${inWish ? "fill-destructive" : ""}`} />
          </button>

          {/* Quick Preview Button */}
          {onQuickView && (
            <button
              className="w-8 h-8 rounded-full glass flex items-center justify-center hover:text-primary transition shadow-sm"
              aria-label="Quick Preview"
              title="Quick Preview"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(p);
              }}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Wishlist button visible when saved or mobile */}
        {inWish && (
          <button
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass flex items-center justify-center text-destructive bg-destructive/10 group-hover:hidden"
            aria-label="In Wishlist"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(p);
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-destructive" />
          </button>
        )}

        {/* Quick Add To Cart Button overlay */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            className="flex-1 py-2.5 rounded-full gradient-brand text-primary-foreground text-xs font-medium shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5 hover:opacity-95 transition"
            onClick={(e) => {
              e.preventDefault();
              addToCart(p);
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to cart
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {p.brand}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="w-3 h-3 fill-warning text-warning" /> {p.rating}
            <span className="opacity-60">({p.reviews})</span>
          </div>
        </div>

        <Link href={`/product/${p.slug}`} className="block">
          <p className="text-sm font-medium mt-0.5 line-clamp-2 hover:text-primary transition">
            {p.name}
          </p>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display font-semibold text-base">
            ৳{p.price.toLocaleString()}
          </span>
          {p.was && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{p.was.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-1 text-[10px]">
          {p.warranty && (
            <span className="flex items-center gap-1 text-success">
              <ShieldCheck className="w-3 h-3" /> {p.warranty}
            </span>
          )}
          {p.emiAvailable && (
            <span className="flex items-center gap-0.5 text-muted-foreground ml-auto">
              <Zap className="w-2.5 h-2.5 text-primary" /> ৳{emiMonthly.toLocaleString()}/mo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

