"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Ticket, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
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

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode);
    setApplying(false);
    setCouponCode("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Your Cart</h2>
              <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-accent rounded-lg transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-3">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-medium text-foreground">Your cart is empty</p>
                <p className="text-xs max-w-xs">Looks like you haven&apos;t added any tech items to your cart yet.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Start shopping →
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.slug}
                  className="flex gap-4 p-3 rounded-2xl bg-secondary/40 border border-border group hover:border-primary/20 transition"
                >
                  <div className="w-20 h-20 rounded-xl bg-background border border-border overflow-hidden shrink-0 relative">
                    <Image
                      src={item.product.img}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.slug)}
                          className="text-muted-foreground hover:text-destructive transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase">{item.product.brand}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display font-semibold text-sm">
                        ৳{(item.product.price * item.qty).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1.5 bg-background rounded-lg border border-border px-2 py-0.5">
                        <button
                          onClick={() => updateQty(item.product.slug, item.qty - 1)}
                          className="hover:text-primary transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.product.slug, item.qty + 1)}
                          className="hover:text-primary transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-border bg-card space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="font-mono font-bold text-success">{appliedCoupon.code}</span>
                    <span className="text-muted-foreground">
                      (-৳{discountAmount.toLocaleString()})
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-destructive text-[11px] hover:underline font-medium">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code (e.g. WELCOME10)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
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
                <div className="flex justify-between text-sm font-display font-bold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-gradient-brand text-base">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
