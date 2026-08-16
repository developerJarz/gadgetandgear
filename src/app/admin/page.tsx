"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown,
  ArrowRight, Plus, Eye, Database, Loader2, Ticket,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DashboardData {
  totalRevenue: number;
  ordersToday: number;
  activeUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  activeCoupons: number;
  recentOrders: any[];
  chartData: { date: string; revenue: number; orders: number }[];
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

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

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

  const kpis = [
    { label: "Total Revenue", value: `৳${data.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", up: true, color: "gradient-brand" },
    { label: "Orders Today", value: data.ordersToday.toString(), icon: ShoppingCart, trend: "+8.2%", up: true, color: "bg-success" },
    { label: "Active Users", value: data.activeUsers.toString(), icon: Users, trend: "+3.1%", up: true, color: "bg-warning" },
    { label: "Products", value: data.totalProducts.toString(), icon: Package, trend: `+${data.activeCoupons} coupons`, up: true, color: "bg-accent" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition disabled:opacity-60"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? "Seeding..." : "Seed Database"}
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 transition animate-count-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="font-display font-bold text-3xl mt-2">{kpi.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${kpi.color} flex items-center justify-center text-primary-foreground`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {kpi.up ? (
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={`text-xs font-medium ${kpi.up ? "text-success" : "text-destructive"}`}>
                {kpi.trend}
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg">Revenue Overview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days performance</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.22 265)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.22 265)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                <XAxis dataKey="date" fontSize={12} stroke="oklch(0.55 0.03 255)" />
                <YAxis fontSize={12} stroke="oklch(0.55 0.03 255)" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
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
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Quick Actions</h2>
          <div className="space-y-3">
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
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition">
                  <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest customer orders from MongoDB</p>
          </div>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Items</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order: any) => (
                <tr key={order._id || order.orderId} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-3 px-2 font-mono text-xs">{order.orderId}</td>
                  <td className="py-3 px-2">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">
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
      </div>
    </div>
  );
}
