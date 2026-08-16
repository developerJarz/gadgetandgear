"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  img: string;
  count: string;
  description: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", slug: "", img: "", count: "0 models", description: "" });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch { toast.error("Failed to load categories"); }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", img: "", count: "0 models", description: "" });
    setShowModal(true);
  };

  const openEdit = (c: CategoryItem) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, img: c.img, count: c.count, description: c.description });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (editing) {
        await fetch(`/api/categories/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug }) });
        toast.success("Category updated!");
      } else {
        await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug }) });
        toast.success("Category created!");
      }
      fetchCategories();
      setShowModal(false);
    } catch { toast.error("Failed to save"); }
  };

  const toggleActive = async (c: CategoryItem) => {
    await fetch(`/api/categories/${c._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
    toast.success(c.isActive ? "Category disabled" : "Category enabled");
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    toast.success("Category deleted");
    fetchCategories();
    setDeleteConfirm(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories in your store</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <div key={c._id} className={`bg-card border rounded-2xl overflow-hidden transition hover:shadow-lg hover:shadow-primary/5 ${c.isActive ? "border-border" : "border-destructive/30 opacity-60"}`}>
            <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-primary/20">{c.name.charAt(0)}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.slug} · {c.count}</p>
                </div>
                {c.isActive ? (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">Active</span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">Disabled</span>
                )}
              </div>
              {c.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                <button onClick={() => openEdit(c)} className="p-2 hover:bg-accent rounded-lg transition" title="Edit"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => toggleActive(c)} className="p-2 hover:bg-accent rounded-lg transition" title={c.isActive ? "Disable" : "Enable"}>
                  {c.isActive ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => setDeleteConfirm(c._id)} className="p-2 hover:bg-destructive/10 rounded-lg transition ml-auto" title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-muted-foreground">No categories found.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">{editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Count</label>
                  <input value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Image URL</label>
                <input value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} placeholder="/image.jpg" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">{editing ? "Save Changes" : "Add Category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-up text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h3 className="font-display font-semibold text-lg">Delete Category?</h3>
            <p className="text-sm text-muted-foreground mt-2">Products in this category won't be affected.</p>
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
