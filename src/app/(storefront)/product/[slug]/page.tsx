"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Heart,
  ChevronRight, Check, Share2, Plus, Minus, Zap,
} from "lucide-react";
import { PRODUCTS } from "@/lib/site-data";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "warranty">("overview");

  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  ).slice(0, 4);

  const off = product.was ? Math.round(((product.was - product.price) / product.was) * 100) : 0;
  const inWish = isInWishlist(product.slug);

  const handleBuyNow = () => {
    addToCart(product, qty);
    router.push("/checkout");
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container-x flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="capitalize">{product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      {/* Main Details Section */}
      <section className="container-x py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-secondary border border-border group shadow-lg">
              <Image
                src={product.img}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.tag && (
                <span className="absolute top-4 left-4 gradient-brand text-primary-foreground text-xs uppercase tracking-widest px-3 py-1 rounded-full font-medium shadow-md">
                  {product.tag}
                </span>
              )}
              {off > 0 && (
                <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Save {off}%
                </span>
              )}
            </div>
          </div>

          {/* Product Meta & Actions */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{product.brand}</p>
              <h1 className="font-display font-bold text-3xl lg:text-4xl mt-1 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-success font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> In Stock (Official BD Warranty)
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex items-baseline gap-4">
              <span className="font-display font-bold text-3xl text-gradient-brand">
                ৳{product.price.toLocaleString()}
              </span>
              {product.was && (
                <span className="text-base text-muted-foreground line-through">
                  ৳{product.was.toLocaleString()}
                </span>
              )}
              {off > 0 && (
                <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                  You save ৳{(product.was! - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>{product.warranty || "1 Year Official Warranty"}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span>Same-day Dhaka Express Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                <RefreshCw className="w-4 h-4 text-primary shrink-0" />
                <span>7 Days Replacement Guarantee</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span>0% EMI Available up to 12 Months</span>
              </div>
            </div>

            {/* Quantity Selector + Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-muted-foreground uppercase">Quantity:</span>
                <div className="flex items-center border border-border rounded-xl bg-card p-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 hover:bg-accent rounded-lg transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-display font-semibold text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-2 hover:bg-accent rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => addToCart(product, qty)}
                  className="py-3.5 px-6 rounded-2xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-2xl gradient-brand text-primary-foreground font-medium text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  Buy Now ৳{(product.price * qty).toLocaleString()}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-2 ${
                    inWish
                      ? "border-destructive text-destructive bg-destructive/10"
                      : "border-border hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWish ? "fill-destructive" : ""}`} />
                  {inWish ? "In Wishlist" : "Add to Wishlist"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Product link copied!");
                  }}
                  className="py-2.5 px-4 rounded-xl border border-border hover:bg-accent text-xs font-medium text-muted-foreground transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16 border border-border rounded-3xl bg-card overflow-hidden">
          <div className="flex border-b border-border bg-muted/40">
            {(["overview", "specs", "warranty"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-medium capitalize border-b-2 transition ${
                  activeTab === tab
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Experience top-tier innovation with the <strong>{product.name}</strong> from <strong>{product.brand}</strong>. Engineered specifically for high performance, maximum durability, and seamless everyday operation.
                </p>
                <p>
                  Sourced from official Bangladesh brand channels, every unit is factory sealed with serial number tracking, full manufacturer warranty support, and authorized service center coverage nationwide.
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-semibold text-foreground ml-2">{product.brand}</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground ml-2 capitalize">{product.category}</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-muted-foreground">Warranty:</span>
                  <span className="font-semibold text-foreground ml-2">{product.warranty || "1 Year Official"}</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-semibold text-foreground ml-2">{product.rating} / 5 ({product.reviews} reviews)</span>
                </div>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Gadget & Gear BD Warranty Policy:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Official Brand Warranty valid at all authorized Bangladesh service centers.</li>
                  <li>7-day instant replacement guarantee for hardware defects.</li>
                  <li>Free pickup and drop service inside Dhaka city for warranty claims.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display font-bold text-2xl mb-6">Similar Products You Might Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
