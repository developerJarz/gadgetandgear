"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight, Ticket, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQty,
    cartTotal,
    discountAmount,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode);
    setApplying(false);
    setCouponCode("");
  };

  if (cart.length === 0) {
    return (
      <div className="container-x py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="font-display font-bold text-3xl">Your Shopping Cart is Empty</h1>
        <p className="text-xs text-muted-foreground">
          Explore our store and add smartphones, laptops, audio gadgets to your cart.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-7 py-3.5 rounded-full text-sm font-medium shadow-lg shadow-primary/25"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container-x flex items-center justify-between text-xs">
          <Link href="/shop" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
          <span className="text-muted-foreground">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <section className="container-x py-10 lg:py-16">
        <h1 className="font-display font-bold text-3xl mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Cart Table */}
          <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 overflow-hidden">
            <div className="divide-y divide-border/50">
              {cart.map((item) => (
                <div key={item.product.slug} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-secondary border border-border overflow-hidden shrink-0 relative">
                      <Image src={item.product.img} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.product.brand}</p>
                      <Link href={`/product/${item.product.slug}`} className="font-medium text-sm hover:text-primary transition line-clamp-1">
                        {item.product.name}
                      </Link>
                      <p className="font-display font-semibold text-sm mt-1">৳{item.product.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                    <div className="flex items-center border border-border rounded-xl bg-background px-2 py-1">
                      <button onClick={() => updateQty(item.product.slug, item.qty - 1)} className="p-1 hover:text-primary transition">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.slug, item.qty + 1)} className="p-1 hover:text-primary transition">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-display font-bold text-base">
                      ৳{(item.product.price * item.qty).toLocaleString()}
                    </span>

                    <button onClick={() => removeFromCart(item.product.slug)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 lg:p-8 space-y-6">
            <h2 className="font-display font-semibold text-lg">Cart Total</h2>

            {/* Coupon */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span className="font-mono font-bold text-success">{appliedCoupon.code}</span>
                </div>
                <button onClick={removeCoupon} className="text-destructive text-[11px] hover:underline font-medium">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button type="submit" disabled={applying || !couponCode.trim()} className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition">
                  Apply
                </button>
              </form>
            )}

            <div className="space-y-2 text-xs text-muted-foreground pt-4 border-t border-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{cartTotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-display font-bold text-foreground pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-gradient-brand text-lg">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
