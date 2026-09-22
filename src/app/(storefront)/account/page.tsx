"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User, Package, Heart, LogOut, ShieldCheck, Mail, Phone,
  MapPin, ShoppingBag, ChevronRight, Clock, CheckCircle2,
  Lock, Eye, EyeOff, MessageSquare, AlertCircle, Sparkles,
  Truck, ArrowRight, Save, Loader2, Check, RefreshCw, Send,
  Share2, Award, Calendar, HelpCircle, ExternalLink
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

interface CustomerProfile {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  role: string;
  status: string;
  ordersCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  segment: "New" | "Regular" | "VIP" | "At-Risk" | "Inactive";
  joinedAt?: string;
  createdAt?: string;
}

interface OrderRecord {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  items: { productSlug?: string; productName: string; qty: number; price: number; img?: string }[];
  total: number;
  subtotal?: number;
  discount?: number;
  paymentMethod?: string;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  statusTimeline?: { status: string; timestamp: string; note: string; by?: string }[];
}

const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Sylhet",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

export default function CustomerAccountPage() {
  const router = useRouter();
  const { wishlist } = useCart();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "addresses" | "profile" | "wishlist" | "security" | "support"
  >("overview");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    altPhone: "",
    address: "",
    city: "",
    division: "Dhaka",
    postalCode: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected Order for Modal/View details
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        // Fetch verified profile
        const res = await fetch("/api/customer/profile");
        const data = await res.json();

        if (res.ok && data.success && data.profile) {
          const p = data.profile;
          setProfile(p);
          setProfileForm({
            name: p.name || "",
            phone: p.phone || "",
            whatsapp: p.whatsapp || p.phone || "",
            altPhone: p.altPhone || "",
            address: p.address || "",
            city: p.city || "",
            division: p.division || "Dhaka",
            postalCode: p.postalCode || "",
          });
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback check: localStorage
      try {
        const stored = localStorage.getItem("gh_auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.loggedIn) {
            setProfile({
              name: parsed.name,
              email: parsed.email,
              role: parsed.role || "Customer",
              status: "Active",
              ordersCount: 0,
              totalSpent: 0,
              loyaltyPoints: 50,
              segment: "New",
              joinedAt: parsed.loginAt || new Date().toISOString(),
            });
            setProfileForm((prev) => ({ ...prev, name: parsed.name }));
            setLoading(false);
            return;
          }
        }
      } catch {}

      router.push("/login");
    }

    loadCustomerData();
  }, [router]);

  // Load customer orders
  useEffect(() => {
    if (!profile?.email) return;

    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const res = await fetch("/api/customer/orders");
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.orders || []);
        } else {
          // Fallback to /api/orders
          const fallbackRes = await fetch("/api/orders");
          const fallbackData = await fallbackRes.json();
          const list = fallbackData.orders || (Array.isArray(fallbackData) ? fallbackData : []);
          const filtered = list.filter(
            (o: any) =>
              (profile?.email && o.customerEmail?.toLowerCase() === profile.email.toLowerCase()) ||
              (profile?.name && o.customerName === profile.name)
          );
          setOrders(filtered);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
      setLoadingOrders(false);
    }

    fetchOrders();
  }, [profile?.email, profile?.name]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        // Update localStorage
        try {
          const stored = localStorage.getItem("gh_auth");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.name = data.profile.name;
            localStorage.setItem("gh_auth", JSON.stringify(parsed));
          }
        } catch {}
        setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Connection error. Please try again." });
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMsg({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Connection error. Please try again." });
    }
    setSavingPassword(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("gh_auth");
    router.push("/login");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading customer dashboard...</p>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Processing" || o.status === "Shipped").length;
  const completedOrdersCount = orders.filter((o) => o.status === "Delivered").length;
  const totalSpentCalculated = orders.reduce((sum, o) => sum + (o.total || 0), 0) || profile.totalSpent || 0;
  const loyaltyPointsEarned = profile.loyaltyPoints || Math.floor(totalSpentCalculated / 100) || 50;

  const whatsappLink = `https://wa.me/8801700000000?text=${encodeURIComponent(
    `Hello Gadget & Gear BD Support, I am ${profile.name} (${profile.email}). I have a query regarding my customer account/order.`
  )}`;

  return (
    <div className="min-h-screen pb-20">
      {/* ─── Hero / Header Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background border-b border-border py-10 lg:py-12">
        <div className="container-x">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* User Info Block */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl gradient-brand text-primary-foreground text-3xl sm:text-4xl font-bold font-display flex items-center justify-center shadow-xl shadow-primary/25 ring-4 ring-background">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-background" title="Verified Customer">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                    <Award className="w-3 h-3" />
                    {profile.segment || "Regular"} Member
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {profile.email}
                  </span>
                  {(profile.phone || profileForm.phone) && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" /> {profile.phone || profileForm.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500 hover:text-white transition flex items-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Help
              </a>
              {profile.role !== "Customer" && (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-xl border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-primary-foreground transition shadow-sm"
                >
                  Admin Panel →
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Stat Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/60">
            <div className="bg-card/70 backdrop-blur border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Total Orders</p>
                <p className="font-display font-bold text-lg text-foreground">{orders.length}</p>
              </div>
            </div>

            <div className="bg-card/70 backdrop-blur border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Active Deliveries</p>
                <p className="font-display font-bold text-lg text-amber-500">{pendingOrdersCount}</p>
              </div>
            </div>

            <div className="bg-card/70 backdrop-blur border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Loyalty Points</p>
                <p className="font-display font-bold text-lg text-emerald-500">{loyaltyPointsEarned} pts</p>
              </div>
            </div>

            <div className="bg-card/70 backdrop-blur border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Saved Gadgets</p>
                <p className="font-display font-bold text-lg text-purple-500">{wishlist.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content & Navigation Tabs ─── */}
      <div className="container-x py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-3.5 space-y-1 sticky top-20 shadow-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "overview"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" /> Overview &amp; Home
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "orders"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4" /> My Orders ({orders.length})
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "addresses"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <MapPin className="w-4 h-4" /> Address &amp; Delivery
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "profile"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4" /> Edit Profile &amp; Contact
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "wishlist"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4" /> Wishlist ({wishlist.length})
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "security"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <Lock className="w-4 h-4" /> Security &amp; Password
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition ${
                activeTab === "support"
                  ? "gradient-brand text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4" /> Help &amp; Support Hub
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="lg:col-span-9 space-y-6">
            {/* ══════════════ TAB 1: OVERVIEW ══════════════ */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-up">
                {/* Welcome Card */}
                <div className="relative overflow-hidden bg-card border border-border rounded-3xl p-6 sm:p-8">
                  <div className="relative z-10 max-w-xl space-y-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-primary">Customer Dashboard</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl">
                      Welcome back, {profile.name}!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your profile, shipping addresses, mobile &amp; WhatsApp contact numbers, live order tracking, and account security in one place.
                    </p>
                    <div className="pt-3 flex flex-wrap gap-3">
                      <Link
                        href="/shop"
                        className="px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition shadow-md flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" /> Shop New Gadgets
                      </Link>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="px-5 py-2.5 rounded-xl border border-border hover:bg-accent text-xs font-medium transition flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" /> View Orders
                      </button>
                    </div>
                  </div>
                  <div className="absolute right-6 -bottom-6 opacity-10 dark:opacity-5 pointer-events-none hidden sm:block">
                    <ShoppingBag className="w-64 h-64 text-primary" />
                  </div>
                </div>

                {/* Grid: Delivery Address Card + Contact Card */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Default Delivery Address Card */}
                  <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Default Delivery Address
                      </h3>
                      <button
                        onClick={() => setActiveTab("addresses")}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        Edit <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {profileForm.address ? (
                      <div className="space-y-1.5 text-xs text-muted-foreground bg-secondary/40 p-4 rounded-2xl border border-border">
                        <p className="font-semibold text-foreground text-sm">{profileForm.name}</p>
                        <p>{profileForm.address}</p>
                        <p>
                          {profileForm.city && `${profileForm.city}, `}
                          {profileForm.division} {profileForm.postalCode && `— ${profileForm.postalCode}`}
                        </p>
                        <p className="pt-2 text-foreground font-medium flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-primary" /> {profileForm.phone || "No phone added"}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-secondary/40 p-6 rounded-2xl border border-border text-center space-y-2">
                        <p className="text-xs text-muted-foreground">No address set yet</p>
                        <button
                          onClick={() => setActiveTab("addresses")}
                          className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <MapPin className="w-3.5 h-3.5" /> Add Delivery Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Direct Contact & WhatsApp Hub */}
                  <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" /> Phone &amp; WhatsApp
                      </h3>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        Edit <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2.5 text-xs bg-secondary/40 p-4 rounded-2xl border border-border">
                      <div className="flex items-center justify-between py-1 border-b border-border/60">
                        <span className="text-muted-foreground">Mobile Phone:</span>
                        <span className="font-medium text-foreground">{profileForm.phone || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/60">
                        <span className="text-muted-foreground">WhatsApp:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {profileForm.whatsapp || profileForm.phone || "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Alt. Contact:</span>
                        <span className="font-medium text-foreground">{profileForm.altPhone || "None"}</span>
                      </div>
                    </div>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> Message Support on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Recent Orders Snippet */}
                <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" /> Recent Orders
                    </h3>
                    {orders.length > 0 && (
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        View All ({orders.length}) →
                      </button>
                    )}
                  </div>

                  {loadingOrders ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                      <Package className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-sm font-medium">You haven&apos;t placed any orders yet</p>
                      <Link
                        href="/shop"
                        className="inline-block gradient-brand text-primary-foreground px-5 py-2 rounded-full text-xs font-medium shadow-md"
                      >
                        Explore Gadgets &amp; Deals
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order._id || order.orderId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/30 transition gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-primary">{order.orderId}</span>
                              <span
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : order.status === "Shipped"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                    : order.status === "Cancelled"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {order.items?.length || 1} items • Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="font-display font-bold text-sm text-gradient-brand">
                              ৳{order.total?.toLocaleString()}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab("orders");
                              }}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ TAB 2: MY ORDERS & TRACKING ══════════════ */}
            {activeTab === "orders" && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-2xl">My Orders &amp; Tracking</h2>
                    <p className="text-xs text-muted-foreground">
                      Track current shipments, review past receipts, and monitor delivery progress
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground text-xs font-medium shadow-md self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Order More
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-xs">Fetching your order history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                    <h3 className="font-display font-bold text-xl">No orders found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      You haven&apos;t placed any orders yet. Discover high-end gadgets, smartphones, smartwatches, and audio gear at best prices!
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block gradient-brand text-primary-foreground px-6 py-2.5 rounded-full text-xs font-medium shadow-md"
                    >
                      Start Shopping Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id || order.orderId}
                        className="bg-card border border-border rounded-3xl p-6 space-y-4 hover:border-primary/30 transition shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-primary">{order.orderId}</span>
                              <span
                                className={`text-[11px] font-semibold px-3 py-0.5 rounded-full ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : order.status === "Shipped"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                    : order.status === "Cancelled"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-xs text-muted-foreground block">Total Amount</span>
                            <span className="font-display font-bold text-lg text-gradient-brand">
                              ৳{order.total?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-2.5 divide-y divide-border/40 text-xs">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                              <div className="flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="font-medium text-foreground">{item.productName}</span>
                                <span className="text-muted-foreground">× {item.qty}</span>
                              </div>
                              <span className="font-semibold text-foreground shrink-0">
                                ৳{(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery & Payment Info */}
                        <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border text-xs bg-secondary/20 p-3 rounded-2xl">
                          <div>
                            <span className="text-muted-foreground block mb-0.5 font-medium">Delivery Address:</span>
                            <span className="text-foreground">{order.address || "Standard Customer Address"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5 font-medium">Payment Method:</span>
                            <span className="text-foreground font-semibold uppercase">{order.paymentMethod || "COD (Cash on Delivery)"}</span>
                          </div>
                        </div>

                        {/* Order Timeline / Status Tracking Bar */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                            <span className={order.status ? "text-primary font-bold" : ""}>✓ Placed</span>
                            <span className={["Processing", "Shipped", "Delivered"].includes(order.status) ? "text-primary font-bold" : ""}>
                              ✓ Processing
                            </span>
                            <span className={["Shipped", "Delivered"].includes(order.status) ? "text-primary font-bold" : ""}>
                              ✓ Shipped
                            </span>
                            <span className={order.status === "Delivered" ? "text-emerald-500 font-bold" : ""}>
                              {order.status === "Delivered" ? "✓ Delivered" : "Pending Delivery"}
                            </span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                              className="gradient-brand h-full rounded-full transition-all duration-500"
                              style={{
                                width:
                                  order.status === "Delivered"
                                    ? "100%"
                                    : order.status === "Shipped"
                                    ? "75%"
                                    : order.status === "Processing"
                                    ? "50%"
                                    : order.status === "Confirmed"
                                    ? "35%"
                                    : "15%",
                              }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <a
                            href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                              `Hello, I need help with my Order #${order.orderId} (৳${order.total}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Chat support about this order
                          </a>

                          <Link
                            href="/shop"
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            Buy Similar Products <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ TAB 3: ADDRESS BOOK & DELIVERY ══════════════ */}
            {activeTab === "addresses" && (
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-up">
                <div>
                  <h2 className="font-display font-bold text-2xl">Delivery Address &amp; Shipping Details</h2>
                  <p className="text-xs text-muted-foreground">
                    Set your default shipping address for faster 1-click checkout and courier dispatch
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                      profileMsg.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Recipient Full Name *
                      </label>
                      <input
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Delivery Division *
                      </label>
                      <select
                        value={profileForm.division}
                        onChange={(e) => setProfileForm({ ...profileForm, division: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      >
                        {BD_DIVISIONS.map((div) => (
                          <option key={div} value={div}>
                            {div} Division
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        City / District / Area *
                      </label>
                      <input
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        placeholder="e.g. Dhanmondi, Dhaka or Agrabad, Chattogram"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Postal Code (Optional)
                      </label>
                      <input
                        value={profileForm.postalCode}
                        onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                        placeholder="e.g. 1205"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Full Street Address / House / Road / Flat No. *
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="e.g. House #14, Road #5, Block C, Dhanmondi, Dhaka"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                    />
                  </div>

                  <div className="border-t border-border pt-5">
                    <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Courier Contact Numbers
                    </h3>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.whatsapp}
                          onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Alt. Phone (Emergency)
                        </label>
                        <input
                          type="tel"
                          value={profileForm.altPhone}
                          onChange={(e) => setProfileForm({ ...profileForm, altPhone: e.target.value })}
                          placeholder="e.g. 018XXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3.5 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Delivery Details
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ══════════════ TAB 4: EDIT PROFILE ══════════════ */}
            {activeTab === "profile" && (
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-up">
                <div>
                  <h2 className="font-display font-bold text-2xl">Profile &amp; Contact Details</h2>
                  <p className="text-xs text-muted-foreground">
                    Update your account details and contact preferences
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                      profileMsg.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Full Name *
                      </label>
                      <input
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Email Address (Account ID)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profile.email}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/60 text-muted-foreground text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Primary Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+880 1XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.whatsapp}
                        onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                        placeholder="+880 1XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Alt. Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.altPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, altPhone: e.target.value })}
                        placeholder="+880 1XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition shadow-md disabled:opacity-60 flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ══════════════ TAB 5: WISHLIST ══════════════ */}
            {activeTab === "wishlist" && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <h2 className="font-display font-bold text-2xl">Saved Gadgets ({wishlist.length})</h2>
                  <p className="text-xs text-muted-foreground">
                    Products you&apos;ve bookmarked for later purchase
                  </p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
                    <h3 className="font-display font-bold text-xl">Your wishlist is empty</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Click the heart icon on any smartphone, laptop, or gadget to save it here!
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block gradient-brand text-primary-foreground px-6 py-2.5 rounded-full text-xs font-medium shadow-md"
                    >
                      Explore Catalog →
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

            {/* ══════════════ TAB 6: SECURITY & PASSWORD ══════════════ */}
            {activeTab === "security" && (
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-up">
                <div>
                  <h2 className="font-display font-bold text-2xl">Security &amp; Password</h2>
                  <p className="text-xs text-muted-foreground">
                    Update your login password and manage account security
                  </p>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                      passwordMsg.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      New Password (Min. 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Min. 6 characters"
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-3.5 rounded-xl gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ══════════════ TAB 7: SUPPORT & WHATSAPP HUB ══════════════ */}
            {activeTab === "support" && (
              <div className="space-y-6 animate-fade-up">
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="font-display font-bold text-2xl">Help &amp; Customer Support Hub</h2>
                    <p className="text-xs text-muted-foreground">
                      We are here 24/7 to help you with order tracking, warranty claims, returns, and gadget advice
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-base">WhatsApp Live Chat</h3>
                      <p className="text-xs text-muted-foreground">
                        Chat instantly with our dedicated tech support agents.
                      </p>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Start WhatsApp Chat <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-base">Helpline Support</h3>
                      <p className="text-xs text-muted-foreground">
                        Call our customer helpline (10:00 AM - 10:00 PM daily).
                      </p>
                      <a
                        href="tel:+8801700000000"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        +880 1700-000000 <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-base">Email Support</h3>
                      <p className="text-xs text-muted-foreground">
                        Send inquiries, warranty claims, and invoices.
                      </p>
                      <a
                        href="mailto:support@gadgetandgearbd.com"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        support@gadgetandgearbd.com <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-display font-semibold text-base mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                        <p className="font-semibold text-foreground mb-1">How fast is delivery inside Dhaka?</p>
                        <p className="text-muted-foreground">Inside Dhaka delivery takes 24 hours (Same day express available upon request).</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                        <p className="font-semibold text-foreground mb-1">What is the return and replacement policy?</p>
                        <p className="text-muted-foreground">We offer a 7-day easy replacement policy for any manufacturer defects or hardware issues.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
