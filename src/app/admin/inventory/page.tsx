"use client";

import { useEffect, useState } from "react";
import {
  Package, AlertTriangle, Search,
  Download, Plus, Warehouse, BarChart3, History,
  CheckCircle, XCircle, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";

interface InventoryItem {
  _id: string;
  product: { _id: string; name: string; slug: string; img: string; category: string; brand: string; price: number };
  sku: string;
  barcode: string;
  stock: number;
  lowThreshold: number;
  costPrice: number;
  warehouse: { _id: string; name: string; location: string } | null;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastRestocked: string;
}

interface StockMovementRecord {
  _id: string;
  product: { name: string; slug: string } | null;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference: string;
  performedBy: { name: string } | null;
  createdAt: string;
}

interface WarehouseRecord {
  _id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  capacity: number;
  isActive: boolean;
  productsCount: number;
  totalStock: number;
  usedCapacity: number;
}

const STATUS_COLORS: Record<string, string> = {
  "In Stock": "bg-success/20 text-success",
  "Low Stock": "bg-warning/20 text-warning",
  "Out of Stock": "bg-destructive/20 text-destructive",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [stats, setStats] = useState({ totalSKUs: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState<"stock" | "movements" | "warehouses">("stock");
  const [showAddStock, setShowAddStock] = useState(false);
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [addForm, setAddForm] = useState({ productId: "", sku: "", quantity: 0, costPrice: 0, lowThreshold: 10, barcode: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory?status=${statusFilter}&search=${search}`);
      const data = await res.json();
      setItems(data.items || []);
      setStats(data.stats || { totalSKUs: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
      setWarehouses(data.warehouses || []);
    } catch {
      toast.error("Failed to load inventory");
    }
    setLoading(false);
  };

  const fetchMovements = async () => {
    try {
      const res = await fetch("/api/inventory/movements?limit=30");
      const data = await res.json();
      setMovements(data.movements || []);
    } catch {
      toast.error("Failed to load stock movements");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      setWarehouses(data || []);
    } catch {
      toast.error("Failed to load warehouses");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=200");
      const data = await res.json();
      setProducts((data.products || data).map((p: any) => ({ _id: p._id, name: p.name })));
    } catch {}
  };

  useEffect(() => { fetchInventory(); }, [statusFilter, search]);
  useEffect(() => {
    if (tab === "movements") fetchMovements();
    if (tab === "warehouses") fetchWarehouses();
  }, [tab]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.productId || addForm.quantity <= 0) {
      toast.error("Select a product and enter quantity");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        toast.success("Stock added successfully!");
        setShowAddStock(false);
        setAddForm({ productId: "", sku: "", quantity: 0, costPrice: 0, lowThreshold: 10, barcode: "" });
        fetchInventory();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add stock");
      }
    } catch { toast.error("Failed to add stock"); }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time stock levels from MongoDB</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              exportToCSV(items.map(i => ({
                SKU: i.sku,
                Product: i.product?.name || "N/A",
                Stock: i.stock,
                Status: i.status,
                Warehouse: i.warehouse?.name || "N/A",
                CostPrice: i.costPrice,
                Value: i.stock * i.costPrice,
              })), "inventory");
              toast.success("Exported!");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent transition"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => { fetchProducts(); setShowAddStock(true); }}
            className="inline-flex items-center gap-1.5 gradient-brand text-primary-foreground px-4 py-2 rounded-xl text-xs font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stock
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total SKUs", value: stats.totalSKUs, icon: Package, color: "bg-primary" },
          { label: "In Stock", value: stats.inStock, icon: CheckCircle, color: "bg-success" },
          { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "bg-warning" },
          { label: "Out of Stock", value: stats.outOfStock, icon: XCircle, color: "bg-destructive" },
          { label: "Inventory Value", value: `৳${(stats.totalValue / 100000).toFixed(1)}L`, icon: BarChart3, color: "gradient-brand" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display font-bold text-xl">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "stock", label: "Stock Levels", icon: Package },
          { key: "movements", label: "Stock Movements", icon: History },
          { key: "warehouses", label: "Warehouses", icon: Warehouse },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "stock" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or SKU..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Warehouse</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-border/50 hover:bg-accent/30 transition">
                      <td className="py-3 px-4">
                        <p className="font-medium text-xs">{item.product?.name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Last restocked: {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{item.sku}</td>
                      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-xs capitalize">{item.product?.category || "N/A"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold">{item.stock}</span>
                          {item.stock <= item.lowThreshold && item.stock > 0 && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                        </div>
                        <div className="w-20 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${item.stock === 0 ? "bg-destructive" : item.stock <= item.lowThreshold ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${Math.min((item.stock / (item.lowThreshold * 5)) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">{item.warehouse?.name || "Unassigned"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-right font-display font-semibold text-xs">
                        ৳{(item.stock * item.costPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No inventory records found. Add stock to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "movements" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Stock Change</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Reason</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m._id} className="border-b border-border/50 hover:bg-accent/30 transition">
                    <td className="py-3 px-4 font-medium text-xs">{m.product?.name || "Unknown"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        m.type === "Stock In" ? "bg-success/20 text-success" :
                        m.type === "Stock Out" ? "bg-destructive/20 text-destructive" :
                        m.type === "Return" ? "bg-primary/20 text-primary" :
                        "bg-warning/20 text-warning"
                      }`}>{m.type}</span>
                    </td>
                    <td className={`py-3 px-4 font-display font-semibold ${m.quantity > 0 ? "text-success" : "text-destructive"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground text-xs">
                      {m.previousStock} → {m.newStock}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-xs">{m.reason || m.reference || "—"}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                      {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No stock movements recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "warehouses" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {warehouses.map((wh) => (
            <div key={wh._id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{wh.name}</h3>
                  <p className="text-xs text-muted-foreground">{wh.location || wh.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div><p className="font-display font-bold text-lg">{wh.productsCount}</p><p className="text-[10px] text-muted-foreground">Products</p></div>
                <div><p className="font-display font-bold text-lg">{wh.totalStock}</p><p className="text-[10px] text-muted-foreground">Total Units</p></div>
                <div><p className="font-display font-bold text-lg">{wh.usedCapacity}%</p><p className="text-[10px] text-muted-foreground">Capacity</p></div>
              </div>
              <div className="h-2 rounded-full bg-muted mt-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${wh.usedCapacity > 80 ? "bg-warning" : "bg-success"}`} style={{ width: `${wh.usedCapacity}%` }} />
              </div>
            </div>
          ))}
          {warehouses.length === 0 && (
            <div className="col-span-2 bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
              No warehouses configured yet.
            </div>
          )}
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">Add Stock</h2>
              <button onClick={() => setShowAddStock(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product</label>
                <select
                  required
                  value={addForm.productId}
                  onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">SKU</label>
                  <input value={addForm.sku} onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })} placeholder="Auto-generated" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Barcode</label>
                  <input value={addForm.barcode} onChange={(e) => setAddForm({ ...addForm, barcode: e.target.value })} placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
                  <input required type="number" min="1" value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cost Price (৳)</label>
                  <input type="number" value={addForm.costPrice} onChange={(e) => setAddForm({ ...addForm, costPrice: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Low Stock Threshold</label>
                <input type="number" value={addForm.lowThreshold} onChange={(e) => setAddForm({ ...addForm, lowThreshold: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddStock(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
