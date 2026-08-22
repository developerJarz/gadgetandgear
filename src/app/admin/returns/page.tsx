"use client";

import { useState } from "react";
import { RotateCcw, Search, Package, DollarSign, AlertTriangle, CheckCircle, Clock, ArrowLeftRight, X } from "lucide-react";
import { toast } from "sonner";

interface ReturnItem {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  reason: string;
  type: "Return" | "Refund" | "Exchange";
  amount: number;
  status: "Pending" | "Approved" | "Processing" | "Completed" | "Rejected";
  date: string;
}

const demoReturns: ReturnItem[] = [
  { id: "RTN-001", orderId: "ORD-1038", customer: "Rakib Hossain", product: "Aurora Ultrabook 14", reason: "Defective screen", type: "Return", amount: 145900, status: "Pending", date: "Aug 18, 2026" },
  { id: "RTN-002", orderId: "ORD-1035", customer: "Sadia Khatun", product: "Pods Pro ANC Earbuds", reason: "Changed mind", type: "Refund", amount: 18990, status: "Approved", date: "Aug 17, 2026" },
  { id: "RTN-003", orderId: "ORD-1032", customer: "Tanvir Ahmed", product: "Pulse Smartwatch S3", reason: "Wrong color received", type: "Exchange", amount: 12500, status: "Processing", date: "Aug 16, 2026" },
  { id: "RTN-004", orderId: "ORD-1028", customer: "Nusrat Jahan", product: "Mech RGB Keyboard", reason: "Keys not working", type: "Return", amount: 9990, status: "Completed", date: "Aug 14, 2026" },
  { id: "RTN-005", orderId: "ORD-1025", customer: "Farhan Iqbal", product: "Galaxy Flagship Pro 5G", reason: "Battery issue", type: "Return", amount: 129900, status: "Rejected", date: "Aug 12, 2026" },
];

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-warning/20 text-warning",
  Approved: "bg-primary/20 text-primary",
  Processing: "bg-accent text-accent-foreground",
  Completed: "bg-success/20 text-success",
  Rejected: "bg-destructive/20 text-destructive",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  Return: RotateCcw,
  Refund: DollarSign,
  Exchange: ArrowLeftRight,
};

export default function ReturnsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);

  const filtered = demoReturns
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => r.orderId.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()));

  const pending = demoReturns.filter((r) => r.status === "Pending").length;
  const totalRefunded = demoReturns.filter((r) => r.status === "Completed").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Returns & Refunds</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage returns, refunds & exchanges</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pending Returns", value: pending, icon: Clock, color: "bg-warning" },
          { label: "Total Returns", value: demoReturns.length, icon: RotateCcw, color: "bg-primary" },
          { label: "Total Refunded", value: `৳${totalRefunded.toLocaleString()}`, icon: DollarSign, color: "bg-destructive" },
          { label: "Return Rate", value: "2.3%", icon: AlertTriangle, color: "bg-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground mb-2`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="font-display font-bold text-xl">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-1">
          {["all", "Pending", "Approved", "Processing", "Completed", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Return ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const TypeIcon = TYPE_ICONS[r.type] || RotateCcw;
                return (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs font-medium">{r.id}</p>
                      <p className="text-[10px] text-muted-foreground">Order: {r.orderId}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-xs">{r.customer}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground">{r.product}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs"><TypeIcon className="w-3 h-3" /> {r.type}</span>
                    </td>
                    <td className="py-3 px-4 font-display font-semibold text-xs">৳{r.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setSelectedReturn(r)} className="text-xs text-primary hover:underline">View</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No returns found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Return Details</h2>
              <button onClick={() => setSelectedReturn(null)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Return ID:</span><span className="font-mono">{selectedReturn.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Order:</span><span>{selectedReturn.orderId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer:</span><span>{selectedReturn.customer}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Product:</span><span>{selectedReturn.product}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reason:</span><span>{selectedReturn.reason}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span>{selectedReturn.type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-display font-semibold">৳{selectedReturn.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[selectedReturn.status]}`}>{selectedReturn.status}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span>{selectedReturn.date}</span></div>
            </div>
            {selectedReturn.status === "Pending" && (
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setSelectedReturn(null); toast.success("Return approved!"); }} className="flex-1 py-2.5 rounded-xl bg-success text-white text-sm font-medium hover:opacity-90 transition">Approve</button>
                <button onClick={() => { setSelectedReturn(null); toast.error("Return rejected"); }} className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-medium hover:opacity-90 transition">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
