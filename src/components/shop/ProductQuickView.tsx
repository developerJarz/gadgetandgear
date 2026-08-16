"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  Zap,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  Check,
  ExternalLink,
} from "lucide-react";
import type { Product } from "@/lib/site-data";
import { useCart } from "@/context/CartContext";

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const off = product.was
    ? Math.round(((product.was - product.price) / product.was) * 100)
    : 0;
  const inWish = isInWishlist(product.slug);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-background border border-border rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-secondary/80 backdrop-blur border border-border flex items-center justify-center hover:bg-accent transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Media Column */}
        <div className="relative md:w-1/2 bg-secondary flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border min-h-[260px] md:min-h-[420px]">
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md">
            <Image
              src={product.img}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {product.tag && (
              <span className="absolute top-3 left-3 gradient-brand text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold shadow">
                {product.tag}
              </span>
            )}
            {off > 0 && (
              <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow">
                -{off}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info & Actions Column */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-widest text-primary">
                {product.brand}
              </span>
              <span className="capitalize">{product.category}</span>
            </div>

            <h2 className="font-display font-bold text-xl sm:text-2xl mt-1 leading-snug">
              {product.name}
            </h2>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-success font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock
              </span>
            </div>

            {/* Price Box */}
            <div className="mt-4 p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-baseline gap-3">
              <span className="font-display font-bold text-2xl text-gradient-brand">
                ৳{product.price.toLocaleString()}
              </span>
              {product.was && (
                <span className="text-xs text-muted-foreground line-through">
                  ৳{product.was.toLocaleString()}
                </span>
              )}
              {off > 0 && (
                <span className="text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                  Save ৳{(product.was! - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Specs Highlights */}
            {product.specs && product.specs.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Specs:
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {product.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 rounded-lg bg-card border border-border/80 text-muted-foreground text-[11px] flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty & Services */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-success">
                <ShieldCheck className="w-3.5 h-3.5" />
                {product.warranty || "1 Year Official"}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-primary" /> Express Delivery
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-warning" /> 0% EMI
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-border space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl bg-card p-0.5">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-1.5 hover:bg-accent rounded-lg transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-display font-semibold text-xs">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-1.5 hover:bg-accent rounded-lg transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                className="py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="py-2.5 px-4 rounded-xl gradient-brand text-primary-foreground font-medium text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
              >
                Buy Now
              </button>
            </div>

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => toggleWishlist(product)}
                className={`text-xs font-medium flex items-center gap-1.5 transition ${
                  inWish ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${inWish ? "fill-destructive" : ""}`} />
                {inWish ? "In Wishlist" : "Save for later"}
              </button>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                Full Product Page <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
