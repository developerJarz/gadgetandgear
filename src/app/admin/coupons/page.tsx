"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search, Pencil, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CouponItem {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CouponItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "", discountType: "percentage" as "percentage" | "fixed", discountValue: 0,
    minOrder: 0, maxUses: 0, validFrom: "", validUntil: "", isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch { toast.error("Failed to load coupons"); }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const getStatus = (c: CouponItem) => {
    if (!c.isActive) return { label: "Disabled", color: "bg-muted text-muted-foreground" };
    const now = new Date();
    if (new Date(c.validUntil) < now) return { label: "Expired", color: "bg-destructive/20 text-destructive" };
    if (new Date(c.validFrom) > now) return { label: "Scheduled", color: "bg-warning/20 text-warning" };
    if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { label: "Maxed Out", color: "bg-destructive/20 text-destructive" };
    return { label: "Active", color: "bg-success/20 text-success" };
  };

  const openAdd = () => {
    setEditing(null);
    const now = new Date();
    const nextMonth = new Date(now); nextMonth.setMonth(nextMonth.getMonth() + 1);
    setForm({ code: "", discountType: "percentage", discountValue: 10, minOrder: 0, maxUses: 0, validFrom: now.toISOString().slice(0, 10), validUntil: nextMonth.toISOString().slice(0, 10), isActive: true });
    setShowModal(true);
  };

  const openEdit = (c: CouponItem) => {
    setEditing(c);
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrder: c.minOrder, maxUses: c.maxUses, validFrom: new Date(c.validFrom).toISOString().slice(0, 10), validUntil: new Date(c.validUntil).toISOString().slice(0, 10), isActive: c.isActive });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { ...form, code: form.code.toUpperCase(), validFrom: new Date(form.validFrom), validUntil: new Date(form.validUntil) };
      if (editing) {
        await fetch(`/api/coupons/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        toast.success("Coupon updated!");
      } else {
        await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        toast.success("Coupon created!");
      }
      fetchCoupons();
      setShowModal(false);
    } catch { toast.error("Failed to save"); }
  };

  const toggleActive = async (c: CouponItem) => {
    await fetch(`/api/coupons/${c._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
    toast.success(c.isActive ? "Coupon disabled" : "Coupon enabled");
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    toast.success("Coupon deleted");
    fetchCoupons();
    setDeleteConfirm(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success("Code copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const activeCoupons = coupons.filter((c) => getStatus(c).label === "Active").length;
  const expiredCoupons = coupons.filter((c) => getStatus(c).label === "Expired").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">{coupons.length} coupons · {activeCoupons} active · {expiredCoupons} expired</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-success">{activeCoupons}</p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-destructive">{expiredCoupons}</p>
          <p className="text-xs text-muted-foreground mt-1">Expired</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-2xl font-display font-bold">{coupons.reduce((s, c) => s + c.usedCount, 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Uses</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coupons..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Discount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Min Order</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Usage</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Valid Until</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const status = getStatus(c);
                return (
                  <tr key={c._id} className="border-b border-border/50 hover:bg-accent/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2.5 py-1 rounded-lg bg-muted text-xs font-bold tracking-wider">{c.code}</code>
                        <button onClick={() => copyCode(c.code)} className="p-1 hover:bg-accent rounded transition">
                          {copied === c.code ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {c.discountType === "percentage" ? <Percent className="w-3.5 h-3.5 text-primary" /> : <DollarSign className="w-3.5 h-3.5 text-primary" />}
                        <span className="font-display font-semibold">
                          {c.discountType === "percentage" ? `${c.discountValue}%` : `৳${c.discountValue.toLocaleString()}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      {c.minOrder > 0 ? `৳${c.minOrder.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span>{c.usedCount}</span>
                        <span className="text-muted-foreground">/ {c.maxUses > 0 ? c.maxUses : "∞"}</span>
                      </div>
                      {c.maxUses > 0 && (
                        <div className="w-16 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                      {new Date(c.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-2 hover:bg-accent rounded-lg transition"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => toggleActive(c)} className="p-2 hover:bg-accent rounded-lg transition">
                          {c.isActive ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        <button onClick={() => setDeleteConfirm(c._id)} className="p-2 hover:bg-destructive/10 rounded-lg transition"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No coupons found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">{editing ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Coupon Code</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Discount Type</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Discount Value</label>
                  <input required type="number" min="1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Order (৳)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Uses (0 = ∞)</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valid From</label>
                  <input required type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valid Until</label>
                  <input required type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">{editing ? "Save Changes" : "Create Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-up text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h3 className="font-display font-semibold text-lg">Delete Coupon?</h3>
            <p className="text-sm text-muted-foreground mt-2">This coupon will be permanently removed.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
