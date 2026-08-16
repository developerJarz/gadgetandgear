"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, ArrowLeft, CheckCircle2, Ticket, CreditCard,
  Building2, Wallet, Loader2, Package, Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const PAYMENT_METHODS = [
  { id: "bkash", name: "bKash", icon: Wallet, color: "text-pink-500", desc: "Instant mobile payment (+8801700000000)" },
  { id: "nagad", name: "Nagad", icon: Wallet, color: "text-orange-500", desc: "Instant mobile payment" },
  { id: "rocket", name: "Rocket", icon: Wallet, color: "text-purple-500", desc: "DBBL Mobile Banking" },
  { id: "sslcommerz", name: "Card / Banking (SSLCommerz)", icon: CreditCard, color: "text-blue-500", desc: "Visa, Mastercard, Amex, Internet Banking" },
  { id: "cod", name: "Cash on Delivery", icon: Building2, color: "text-success", desc: "Pay when you receive the product" },
];

const DELIVERY_ZONES = [
  { name: "Inside Dhaka City", fee: 80, time: "Same Day / Next Day" },
  { name: "Dhaka Suburbs (Gazipur, Narayanganj)", fee: 120, time: "1 - 2 Days" },
  { name: "Outside Dhaka (All BD Divisions)", fee: 150, time: "2 - 4 Days" },
];

export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
    discountAmount,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    zone: DELIVERY_ZONES[0].name,
    paymentMethod: "cod",
    notes: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string } | null>(null);

  const selectedZone = DELIVERY_ZONES.find((z) => z.name === form.zone) || DELIVERY_ZONES[0];
  const grandTotal = finalTotal + selectedZone.fee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        address: `${form.address}, ${form.zone}`,
        items: cart.map((item) => ({
          productSlug: item.product.slug,
          productName: item.product.name,
          qty: item.qty,
          price: item.product.price,
        })),
        total: grandTotal,
        status: "Pending",
      };

      // Call MongoDB API
      const res = await fetch("/api/seed", {
        method: "POST", // ensure DB ready
      }).catch(() => {});

      // Create order via API or local fallback
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      let createdId = orderData.orderId;
      if (orderRes.ok) {
        const created = await orderRes.json();
        createdId = created.orderId || createdId;
      }

      setOrderComplete({ id: createdId });
      clearCart();
    } catch {
      alert("Failed to submit order. Please try again.");
    }
    setLoading(false);
  };

  if (orderComplete) {
    return (
      <div className="container-x py-16 lg:py-24 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Thank you, <strong className="text-foreground">{form.name}</strong>. Your order has been placed successfully and is being processed.
        </p>

        <div className="my-8 p-6 rounded-2xl bg-card border border-border text-left space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-xs text-muted-foreground">Order ID</span>
            <span className="font-mono font-bold text-primary text-sm">{orderComplete.id}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="font-medium text-foreground">{selectedZone.time}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium text-foreground uppercase">{form.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-border">
            <span>Total Paid Amount</span>
            <span className="text-gradient-brand text-sm">৳{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/shop"
            className="gradient-brand text-primary-foreground px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-x py-16 text-center max-w-md mx-auto space-y-4">
        <Package className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="font-display font-bold text-2xl">Your cart is empty</h1>
        <p className="text-xs text-muted-foreground">Add products to your cart before checking out.</p>
        <Link href="/shop" className="inline-block gradient-brand text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container-x flex items-center justify-between text-xs">
          <Link href="/shop" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>
          <span className="text-success font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> SSL Encrypted Checkout
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="container-x py-10 lg:py-16">
        <h1 className="font-display font-bold text-3xl mb-8">Complete Your Order</h1>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Shipping & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Info */}
            <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 space-y-4">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                Contact & Delivery Info
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 01712345678"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address (Optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Delivery Zone</label>
                <select
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} — ৳{z.fee} ({z.time})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Address *</label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House/Road No, Area, Thana, City..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 space-y-4">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      form.paymentMethod === pm.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={form.paymentMethod === pm.id}
                        onChange={() => setForm({ ...form, paymentMethod: pm.id })}
                        className="accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <pm.icon className={`w-4 h-4 ${pm.color}`} />
                          {pm.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pm.desc}</p>
                      </div>
                    </div>
                    {form.paymentMethod === pm.id && <Check className="w-4 h-4 text-primary" />}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 lg:p-8 space-y-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg">Order Summary</h2>

            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-border/40">
              {cart.map((item) => (
                <div key={item.product.slug} className="flex gap-3 pt-3 first:pt-0">
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border overflow-hidden shrink-0 relative">
                    <Image src={item.product.img} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <span className="font-display font-semibold text-xs shrink-0">
                    ৳{(item.product.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-border">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20 text-xs">
                  <div>
                    <span className="font-mono font-bold text-success">{appliedCoupon.code}</span>
                    <span className="text-muted-foreground ml-2">(-৳{discountAmount.toLocaleString()})</span>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-destructive text-[11px] hover:underline font-medium">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon (e.g. WELCOME10)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!couponCode.trim()) return;
                      await applyCoupon(couponCode);
                      setCouponCode("");
                    }}
                    className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span>৳{cartTotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charge ({selectedZone.name})</span>
                <span>৳{selectedZone.fee}</span>
              </div>
              <div className="flex justify-between text-base font-display font-bold text-foreground pt-3 border-t border-border">
                <span>Total Payable</span>
                <span className="text-gradient-brand text-lg">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-medium text-sm hover:opacity-90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
              ) : (
                `Place Order (৳${grandTotal.toLocaleString()})`
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
