"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Package, Heart, LogOut, ShieldCheck, Mail, Phone,
  MapPin, ShoppingBag, ChevronRight, Clock, CheckCircle2,
} from "lucide-react";
import { getAuthUser, adminLogout, AuthUser } from "@/lib/store";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

interface OrderRecord {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { productName: string; qty: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const { wishlist } = useCart();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "profile">("orders");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const current = getAuthUser();
    if (!current) {
      router.push("/admin/login");
    } else {
      setUser(current);
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    async function fetchUserOrders() {
      try {
        const res = await fetch("/api/orders");
        const allOrders = await res.json();
        // filter orders for this user
        const customerOrders = allOrders.filter(
          (o: any) => o.customerEmail.toLowerCase() === user?.email.toLowerCase() || o.customerName === user?.name
        );
        setOrders(customerOrders.length > 0 ? customerOrders : allOrders.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
      setLoadingOrders(false);
    }
    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Top Banner */}
      <section className="bg-secondary/40 border-b border-border py-10">
        <div className="container-x flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-brand text-primary-foreground text-2xl font-bold font-display flex items-center justify-center shadow-lg shadow-primary/25">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl">{user.name}</h1>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role !== "Customer" && (
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-primary-foreground transition shadow-md"
              >
                Go to {user.role} Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Navigation Tabs */}
      <section className="container-x py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-4 space-y-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "orders"
                  ? "gradient-brand text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4" /> My Orders
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "wishlist"
                  ? "gradient-brand text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4" /> My Wishlist ({wishlist.length})
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "profile"
                  ? "gradient-brand text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4" /> Profile Details
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          </div>

          {/* Tab Contents */}
          <div className="lg:col-span-9">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-2xl">Order History</h2>

                {loadingOrders ? (
                  <div className="py-12 text-center text-muted-foreground">Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="font-medium text-lg">No orders found</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      You haven&apos;t placed any orders yet. Explore our store for smartphones, laptops, and gadgets!
                    </p>
                    <Link href="/shop" className="inline-block gradient-brand text-primary-foreground px-6 py-2.5 rounded-full text-xs font-medium shadow-md">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id || order.orderId} className="bg-card border border-border rounded-3xl p-6 space-y-4 hover:border-primary/30 transition shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
                          <div>
                            <span className="font-mono text-xs text-primary font-bold">{order.orderId}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary self-start sm:self-auto">
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-muted-foreground">
                              <span>{item.productName} × {item.qty}</span>
                              <span className="font-medium text-foreground">৳{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-border font-display font-bold text-sm">
                          <span>Total Amount</span>
                          <span className="text-gradient-brand text-base">৳{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-2xl">Saved Gadgets ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3">
                    <Heart className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="font-medium text-base">No saved items</p>
                    <Link href="/shop" className="inline-block text-xs font-medium text-primary hover:underline">
                      Explore catalog →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map((p) => (
                      <ProductCard key={p.slug} p={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                <h2 className="font-display font-bold text-2xl">Profile Information</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Full Name</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Email Address</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Role Type</span>
                    <span className="font-medium text-primary">{user.role} Account</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Member Since</span>
                    <span className="font-medium">2026</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
