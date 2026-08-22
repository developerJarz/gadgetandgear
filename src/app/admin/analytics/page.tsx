"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, Eye, Package, MapPin, CreditCard, Calendar,
  Download, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
    activeCustomers: number;
    trends: { revenue: number; orders: number; aov: number };
  };
  chartData: { date: string; revenue: number; profit: number; orders: number }[];
  categoryData: { name: string; value: number; revenue: number }[];
  paymentData: { method: string; amount: number; count: number; pct: number }[];
  geoData: { division: string; orders: number; revenue: number; pct: number }[];
  hourlyData: { hour: string; orders: number }[];
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${period}`);
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Failed to load analytics data");
      }
      setLoading(false);
    };
    fetchData();
  }, [period]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading analytics from MongoDB...</p>
        </div>
      </div>
    );
  }

  const { kpis, chartData, categoryData, paymentData, geoData, hourlyData } = data;

  const kpiCards = [
    { label: "Total Revenue", value: `৳${(kpis.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, trend: `${kpis.trends.revenue >= 0 ? "+" : ""}${kpis.trends.revenue}%`, up: kpis.trends.revenue >= 0, color: "gradient-brand" },
    { label: "Gross Profit", value: `৳${(kpis.totalProfit / 100000).toFixed(1)}L`, icon: TrendingUp, trend: `${kpis.trends.revenue >= 0 ? "+" : ""}${(kpis.trends.revenue * 0.9).toFixed(1)}%`, up: kpis.trends.revenue >= 0, color: "bg-success" },
    { label: "Total Orders", value: kpis.totalOrders.toLocaleString(), icon: ShoppingCart, trend: `${kpis.trends.orders >= 0 ? "+" : ""}${kpis.trends.orders}%`, up: kpis.trends.orders >= 0, color: "bg-warning" },
    { label: "Avg Order Value", value: `৳${kpis.avgOrderValue.toLocaleString()}`, icon: BarChart3, trend: `${kpis.trends.aov >= 0 ? "+" : ""}${kpis.trends.aov}%`, up: kpis.trends.aov >= 0, color: "bg-accent" },
    { label: "Conversion Rate", value: `${kpis.conversionRate}%`, icon: Eye, trend: "—", up: true, color: "bg-destructive" },
    { label: "Active Customers", value: kpis.activeCustomers.toLocaleString(), icon: Users, trend: "—", up: true, color: "bg-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Analytics & BI</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time business intelligence from MongoDB aggregation</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d", "1y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === p ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => {
              exportToCSV(chartData, "analytics_revenue");
              toast.success("Report exported!");
            }}
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi, i) => (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/5 transition animate-count-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-medium ${kpi.up ? "text-success" : "text-destructive"}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <p className="font-display font-bold text-xl">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Profit Trend */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-lg">Revenue & Profit Trend</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last {period === "7d" ? "7 days" : period === "30d" ? "30 days" : period === "90d" ? "90 days" : "1 year"}</p>
          </div>
        </div>
        <div className="h-[320px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" fontSize={10} stroke="var(--color-muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`৳${value.toLocaleString()}`, name === "revenue" ? "Revenue" : "Profit"]}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="url(#profitGrad)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No revenue data for this period</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Sales by Category</h2>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-xs flex-1">{cat.name}</span>
                    <span className="text-xs font-medium">{cat.value}%</span>
                    <span className="text-[10px] text-muted-foreground">৳{(cat.revenue / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No category data available</div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Payment Methods</h2>
          {paymentData.length > 0 ? (
            <div className="space-y-3">
              {paymentData.map((pm) => (
                <div key={pm.method}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{pm.method}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{pm.count} txn</span>
                      <span className="text-xs font-display font-semibold">৳{(pm.amount / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${pm.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No payment data available</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">
            <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Sales by Division
          </h2>
          {geoData.length > 0 ? (
            <div className="space-y-2">
              {geoData.map((geo) => (
                <div key={geo.division} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs w-24 truncate">{geo.division}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full gradient-brand transition-all duration-700" style={{ width: `${geo.pct}%` }} />
                  </div>
                  <span className="text-xs font-medium w-16 text-right">{geo.orders} orders</span>
                  <span className="text-[10px] text-muted-foreground w-14 text-right">৳{(geo.revenue / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No geographic data available</div>
          )}
        </div>

        {/* Hourly Order Pattern */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">
            <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Orders by Hour
          </h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="hour" fontSize={9} stroke="var(--color-muted-foreground)" interval={2} />
                <YAxis fontSize={10} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
