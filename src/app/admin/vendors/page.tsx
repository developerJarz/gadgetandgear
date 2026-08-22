"use client";

import { useState } from "react";
import { Store, Plus, Search, CheckCircle, XCircle, DollarSign, Package, TrendingUp, Eye, Pencil, Ban, X } from "lucide-react";
import { toast } from "sonner";

interface Vendor { id: string; name: string; email: string; phone: string; storeName: string; status: "Active" | "Pending" | "Suspended"; products: number; totalSales: number; commission: number; rating: number; joined: string; }

const demoVendors: Vendor[] = [
  { id: "V-001", name: "Mahbub Electronics", email: "mahbub@electronics.bd", phone: "+8801711234567", storeName: "Mahbub Tech Store", status: "Active", products: 45, totalSales: 2850000, commission: 12, rating: 4.8, joined: "Jan 2026" },
  { id: "V-002", name: "TechZone BD", email: "info@techzone.bd", phone: "+8801811234567", storeName: "TechZone Bangladesh", status: "Active", products: 32, totalSales: 1920000, commission: 10, rating: 4.5, joined: "Mar 2026" },
  { id: "V-003", name: "Digital Hub Dhaka", email: "contact@dhdigital.bd", phone: "+8801911234567", storeName: "Digital Hub", status: "Pending", products: 0, totalSales: 0, commission: 15, rating: 0, joined: "Aug 2026" },
  { id: "V-004", name: "Smart Gadgets BD", email: "sales@smartgadgets.bd", phone: "+8801611234567", storeName: "Smart Gadgets", status: "Suspended", products: 18, totalSales: 580000, commission: 12, rating: 3.2, joined: "Feb 2026" },
];

const STATUS_COLORS: Record<string, string> = { Active: "bg-success/20 text-success", Pending: "bg-warning/20 text-warning", Suspended: "bg-destructive/20 text-destructive" };

export default function VendorsPage() {
  const [vendors] = useState(demoVendors);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const activeVendors = vendors.filter(v => v.status === "Active").length;
  const totalVendorSales = vendors.reduce((s, v) => s + v.totalSales, 0);
  const totalCommission = vendors.reduce((s, v) => s + (v.totalSales * v.commission / 100), 0);
  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.storeName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-display font-bold text-3xl">Vendors</h1><p className="text-sm text-muted-foreground mt-1">Multi-vendor marketplace management</p></div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"><Plus className="w-4 h-4" /> Add Vendor</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Vendors", value: activeVendors, icon: Store, color: "bg-success" },
          { label: "Vendor Sales", value: `৳${(totalVendorSales / 100000).toFixed(1)}L`, icon: DollarSign, color: "gradient-brand" },
          { label: "Total Products", value: vendors.reduce((s, v) => s + v.products, 0), icon: Package, color: "bg-warning" },
          { label: "Platform Commission", value: `৳${(totalCommission / 1000).toFixed(0)}k`, icon: TrendingUp, color: "bg-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground mb-2`}><kpi.icon className="w-4 h-4" /></div>
            <p className="font-display font-bold text-xl">{kpi.value}</p><p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>

      <div className="space-y-3">
        {filtered.map((vendor) => (
          <div key={vendor.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg ${vendor.status === "Active" ? "gradient-brand" : "bg-muted text-muted-foreground"}`}>{vendor.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-display font-semibold">{vendor.storeName}</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[vendor.status]}`}>{vendor.status}</span></div>
                  <p className="text-xs text-muted-foreground">{vendor.name} · {vendor.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Since {vendor.joined} · Commission: {vendor.commission}%</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block"><p className="font-display font-semibold text-sm">{vendor.products}</p><p className="text-[10px] text-muted-foreground">Products</p></div>
                <div className="text-right hidden md:block"><p className="font-display font-semibold text-sm">৳{(vendor.totalSales / 1000).toFixed(0)}k</p><p className="text-[10px] text-muted-foreground">Sales</p></div>
                {vendor.rating > 0 && <div className="text-right hidden lg:block"><p className="font-display font-semibold text-sm">⭐ {vendor.rating}</p><p className="text-[10px] text-muted-foreground">Rating</p></div>}
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-accent rounded-lg"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                  <button className="p-2 hover:bg-accent rounded-lg"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  {vendor.status !== "Suspended" && <button onClick={() => toast.success("Vendor suspended")} className="p-2 hover:bg-destructive/10 rounded-lg"><Ban className="w-4 h-4 text-destructive" /></button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6"><h2 className="font-display font-semibold text-xl">Add Vendor</h2><button onClick={() => setShowAdd(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); setShowAdd(false); toast.success("Vendor added!"); }} className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Name</label><input required placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Store Name</label><input required placeholder="Store name" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label><input type="email" required placeholder="email@example.com" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label><input placeholder="+880" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Commission Rate (%)</label><input type="number" defaultValue={12} min={0} max={50} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button><button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Add Vendor</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
