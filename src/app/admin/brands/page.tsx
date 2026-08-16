"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  isActive: boolean;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BrandItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", logo: "" });

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      setBrands(data);
    } catch { toast.error("Failed to load brands"); }
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: "", logo: "" }); setShowModal(true); };
  const openEdit = (b: BrandItem) => { setEditing(b); setForm({ name: b.name, logo: b.logo }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch(`/api/brands/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Brand updated!");
      } else {
        await fetch("/api/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Brand created!");
      }
      fetchBrands();
      setShowModal(false);
    } catch { toast.error("Failed to save"); }
  };

  const toggleActive = async (b: BrandItem) => {
    await fetch(`/api/brands/${b._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) });
    toast.success(b.isActive ? "Brand disabled" : "Brand enabled");
    fetchBrands();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/brands/${id}`, { method: "DELETE" });
    toast.success("Brand deleted");
    fetchBrands();
    setDeleteConfirm(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const activeCount = brands.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">{brands.length} brands · {activeCount} active</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((b) => (
          <div key={b._id} className={`bg-card border rounded-2xl p-6 transition hover:shadow-lg hover:shadow-primary/5 ${b.isActive ? "border-border" : "border-destructive/30 opacity-60"}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl font-display font-bold text-primary shrink-0">
                {b.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold truncate">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.slug}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              {b.isActive ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">Active</span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">Disabled</span>
              )}
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(b)} className="p-2 hover:bg-accent rounded-lg transition"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => toggleActive(b)} className="p-2 hover:bg-accent rounded-lg transition">
                  {b.isActive ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => setDeleteConfirm(b._id)} className="p-2 hover:bg-destructive/10 rounded-lg transition"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-muted-foreground">No brands found.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">{editing ? "Edit Brand" : "Add Brand"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Brand Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Logo URL</label>
                <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">{editing ? "Save" : "Add Brand"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-up text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h3 className="font-display font-semibold text-lg">Delete Brand?</h3>
            <p className="text-sm text-muted-foreground mt-2">This brand will be permanently removed.</p>
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
