"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown,
  ArrowRight, Plus, Eye, Database, Loader2, Ticket, AlertTriangle,
  RotateCcw, Crown, Clock, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DashboardData {
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
  activeUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  activeCoupons: number;
  recentOrders: any[];
  chartData: { date: string; revenue: number; orders: number }[];
  topProducts: { _id: string; name: string; totalSold: number; totalRevenue: number }[];
  revenueTrend: number;
  inventoryAlerts: { lowStock: number; outOfStock: number };
  pendingReturns: number;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-warning/20 text-warning",
  Processing: "bg-primary/20 text-primary",
  Shipped: "bg-accent text-accent-foreground",
  Delivered: "bg-success/20 text-success",
  Cancelled: "bg-destructive/20 text-destructive",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Update greeting and clock
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.seeded) {
        toast.success("Database seeded successfully!");
        fetchDashboard();
      } else {
        toast.info(json.message || "Database already seeded");
      }
    } catch {
      toast.error("Failed to seed database");
    }
    setSeeding(false);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const revTrend = data.revenueTrend ?? 0;
  const revTrendUp = revTrend >= 0;

  const kpis = [
    {
      label: "Total Revenue",
      value: `৳${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: `${revTrendUp ? "+" : ""}${revTrend}%`,
      up: revTrendUp,
      color: "gradient-brand",
    },
    {
      label: "Orders Today",
      value: data.ordersToday.toString(),
      icon: ShoppingCart,
      trend: `৳${(data.revenueToday || 0).toLocaleString()} today`,
      up: true,
      color: "bg-success",
    },
    {
      label: "Active Customers",
      value: data.activeUsers.toString(),
      icon: Users,
      trend: `${data.totalUsers} total`,
      up: true,
      color: "bg-warning",
    },
    {
      label: "Products",
      value: data.totalProducts.toString(),
      icon: Package,
      trend: `${data.activeCoupons} active coupons`,
      up: true,
      color: "bg-accent",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl">{greeting} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {currentTime} — Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-border hover:bg-accent transition disabled:opacity-60"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? "Seeding..." : "Seed DB"}
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-2xl p-4 lg:p-6 hover:shadow-lg hover:shadow-primary/5 transition animate-count-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider truncate">{kpi.label}</p>
                <p className="font-display font-bold text-xl lg:text-3xl mt-1 lg:mt-2 truncate">{kpi.value}</p>
              </div>
              <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl ${kpi.color} flex items-center justify-center text-primary-foreground shrink-0`}>
                <kpi.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 lg:mt-3">
              {kpi.up ? (
                <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-success shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-destructive shrink-0" />
              )}
              <span className={`text-[10px] lg:text-xs font-medium truncate ${kpi.up ? "text-success" : "text-destructive"}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banners */}
      {(data.inventoryAlerts?.outOfStock > 0 || data.pendingReturns > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {data.inventoryAlerts?.outOfStock > 0 && (
            <Link
              href="/admin/inventory"
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm hover:bg-destructive/15 transition"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>{data.inventoryAlerts.outOfStock}</strong> out of stock</span>
              {data.inventoryAlerts?.lowStock > 0 && (
                <span className="text-xs opacity-80">• {data.inventoryAlerts.lowStock} low stock</span>
              )}
              <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0" />
            </Link>
          )}
          {data.pendingReturns > 0 && (
            <Link
              href="/admin/returns"
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm hover:bg-warning/15 transition"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span><strong>{data.pendingReturns}</strong> pending return{data.pendingReturns > 1 ? "s" : ""}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h2 className="font-display font-semibold text-base lg:text-lg">Revenue Overview</h2>
              <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className={`text-xs font-semibold ${revTrendUp ? "text-success" : "text-destructive"}`}>
                {revTrendUp ? "+" : ""}{revTrend}%
              </span>
            </div>
          </div>
          <div className="h-[200px] sm:h-[250px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.22 265)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.22 265)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                <XAxis dataKey="date" fontSize={11} stroke="oklch(0.55 0.03 255)" tick={{ fontSize: 10 }} />
                <YAxis fontSize={11} stroke="oklch(0.55 0.03 255)" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} width={50} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.015 250)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.55 0.22 265)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-6">
          <h2 className="font-display font-semibold text-base lg:text-lg mb-4">Quick Actions</h2>
          <div className="space-y-2 lg:space-y-3">
            {[
              { href: "/admin/products", label: "Add New Product", icon: Plus, desc: "List a new gadget" },
              { href: "/admin/categories", label: "Manage Categories", icon: Eye, desc: "Organize your catalog" },
              { href: "/admin/coupons", label: "Create Coupon", icon: Ticket, desc: "Add discount codes" },
              { href: "/admin/orders", label: "View Orders", icon: ShoppingCart, desc: "Manage pending orders" },
              { href: "/admin/staff", label: "Manage Staff", icon: Users, desc: "Add or edit team" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-2.5 lg:p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition group"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition shrink-0">
                  <action.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground group-hover:text-primary transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium truncate">{action.label}</p>
                  <p className="text-[10px] lg:text-[11px] text-muted-foreground truncate">{action.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products + Stats Row */}
      {data.topProducts && data.topProducts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Top Selling Products */}
          <div className="sm:col-span-2 bg-card border border-border rounded-2xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-warning" />
                <h2 className="font-display font-semibold text-base lg:text-lg">Top Selling Products</h2>
              </div>
              <Link href="/admin/products" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {data.topProducts.map((product, i) => (
                <div key={product._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/30 transition">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0
                      ? "bg-warning/20 text-warning"
                      : i === 1
                      ? "bg-muted text-muted-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-display font-semibold text-primary shrink-0">
                    ৳{product.totalRevenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory & Returns Summary */}
          <div className="bg-card border border-border rounded-2xl p-4 lg:p-6 space-y-4">
            <h2 className="font-display font-semibold text-base lg:text-lg">Store Health</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="text-2xl font-display font-bold text-success">{data.totalOrders}</p>
                <p className="text-[10px] text-success/80 uppercase tracking-wider mt-1">Total Orders</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-2xl font-display font-bold text-primary">{data.totalUsers}</p>
                <p className="text-[10px] text-primary/80 uppercase tracking-wider mt-1">Registered Customers</p>
              </div>
              <div className={`p-3 rounded-xl ${
                (data.inventoryAlerts?.lowStock || 0) > 0
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-muted border border-border"
              }`}>
                <p className="text-2xl font-display font-bold">{data.inventoryAlerts?.lowStock || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Low Stock Items</p>
              </div>
              <div className={`p-3 rounded-xl ${
                data.pendingReturns > 0
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-muted border border-border"
              }`}>
                <p className="text-2xl font-display font-bold">{data.pendingReturns}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Pending Returns</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h2 className="font-display font-semibold text-base lg:text-lg">Recent Orders</h2>
            <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">Latest customer orders from MongoDB</p>
          </div>
          <Link href="/admin/orders" className="text-xs lg:text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order: any) => (
                <tr key={order._id || order.orderId} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-3 px-2 font-mono text-xs">{order.orderId}</td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </td>
                  <td className="py-3 px-2 font-display font-semibold">৳{order.total.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet. Click &quot;Seed Database&quot; to add demo data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {data.recentOrders.map((order: any) => (
            <div key={order._id || order.orderId} className="p-3 rounded-xl border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-primary font-bold">{order.orderId}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider ${STATUS_COLORS[order.status] ?? ""}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{order.customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                </div>
                <p className="font-display font-bold text-sm">৳{order.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {data.recentOrders.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">No orders yet. Seed the database to add demo data.</div>
          )}
        </div>
      </div>
    </div>
  );
}
