"use client";

import Link from "next/link";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <>
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container-x flex items-center justify-between text-xs">
          <Link href="/shop" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>
          <span className="text-muted-foreground">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <section className="container-x py-10 lg:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-primary-foreground">
            <Heart className="w-5 h-5 fill-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl">My Wishlist</h1>
            <p className="text-sm text-muted-foreground">Your saved favorite tech items</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-xl">Your Wishlist is Empty</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Save your favorite smartphones, laptops, and audio gear to view or purchase them later.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-6 py-3 rounded-full text-xs font-medium hover:opacity-90 shadow-lg shadow-primary/25"
            >
              <ShoppingBag className="w-4 h-4" /> Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
