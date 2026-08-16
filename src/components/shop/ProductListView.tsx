"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Star,
  ShieldCheck,
  ShoppingBag,
  Eye,
  Zap,
  CheckCircle2,
} from "lucide-react";
import type { Product } from "@/lib/site-data";
import { useCart } from "@/context/CartContext";

const TAG_STYLES: Record<string, string> = {
  New: "bg-primary text-primary-foreground",
  Bestseller: "bg-warning text-brand-dark",
  "Flash Deal": "bg-destructive text-destructive-foreground",
  "Pre-order": "bg-brand-dark text-primary-foreground",
  Official: "bg-success text-brand-dark",
};

interface ProductListViewProps {
  product: Product;
  onQuickView: (p: Product) => void;
}

export function ProductListView({ product, onQuickView }: ProductListViewProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const off = product.was
    ? Math.round(((product.was - product.price) / product.was) * 100)
    : 0;
  const inWish = isInWishlist(product.slug);
  const emiMonthly = Math.round(product.price / 12);

  return (
    <div className="group rounded-2xl border border-border bg-card p-4 sm:p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      {/* Product Image */}
      <div className="relative w-full sm:w-48 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-secondary border border-border/80 shrink-0">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {product.tag && (
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-semibold shadow-sm ${
              TAG_STYLES[product.tag] ?? "bg-background text-foreground"
            }`}
          >
            {product.tag}
          </span>
        )}

        {off > 0 && (
          <span className="absolute top-2.5 right-2.5 text-[11px] font-bold text-destructive bg-background/95 backdrop-blur px-2 py-0.5 rounded-full shadow-sm">
            -{off}%
          </span>
        )}
      </div>

      {/* Product Details Middle Column */}
      <div className="flex-1 space-y-2 w-full">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">
            {product.brand}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-muted-foreground capitalize">
            {product.category}
          </span>
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-display font-semibold text-base sm:text-lg hover:text-primary transition leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-success font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> In Stock (Official BD)
          </span>
        </div>

        {/* Specs highlights */}
        {product.specs && product.specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.specs.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-muted-foreground border border-border/60"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Badges / Warranty */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
          {product.warranty && (
            <span className="flex items-center gap-1 text-success font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> {product.warranty}
            </span>
          )}
          {product.emiAvailable && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Zap className="w-3.5 h-3.5" /> EMI from ৳{emiMonthly.toLocaleString()}/mo
            </span>
          )}
        </div>
      </div>

      {/* Price & Action Buttons Column */}
      <div className="sm:border-l sm:border-border sm:pl-5 w-full sm:w-56 shrink-0 flex flex-col justify-between space-y-3 pt-3 sm:pt-0 border-t border-border sm:border-t-0">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-gradient-brand">
              ৳{product.price.toLocaleString()}
            </span>
            {product.was && (
              <span className="text-xs text-muted-foreground line-through">
                ৳{product.was.toLocaleString()}
              </span>
            )}
          </div>
          {off > 0 && (
            <p className="text-[11px] font-medium text-destructive mt-0.5">
              Save ৳{(product.was! - product.price).toLocaleString()} ({off}% off)
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-2.5 px-4 rounded-xl gradient-brand text-primary-foreground text-xs font-semibold hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onQuickView(product)}
              className="py-2 px-3 rounded-xl border border-border bg-background hover:bg-accent text-xs font-medium transition flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1 ${
                inWish
                  ? "border-destructive text-destructive bg-destructive/10"
                  : "border-border bg-background hover:bg-accent text-muted-foreground"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${inWish ? "fill-destructive" : ""}`} />
              {inWish ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
