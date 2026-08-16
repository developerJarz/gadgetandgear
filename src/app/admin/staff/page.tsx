"use client";

import { useEffect, useState } from "react";
import {
  Plus, X, Search, Trash2, Shield, Clock,
} from "lucide-react";
import { toast } from "sonner";

type StaffRole = "Admin" | "Manager" | "Staff";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  joinedAt: string;
  lastActive: string;
}

const ROLES: StaffRole[] = ["Admin", "Manager", "Staff"];

const ROLE_COLORS: Record<StaffRole, string> = {
  Admin: "bg-destructive/15 text-destructive border-destructive/20",
  Manager: "bg-primary/15 text-primary border-primary/20",
  Staff: "bg-success/15 text-success border-success/20",
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "Staff" as StaffRole });

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaff(data);
    } catch {
      toast.error("Failed to load staff");
    }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Staff member added!");
      fetchStaff();
      setShowAdd(false);
      setForm({ name: "", email: "", role: "Staff" });
    } catch {
      toast.error("Failed to add staff");
    }
  };

  const handleRoleChange = async (id: string, role: StaffRole) => {
    try {
      await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      toast.success("Role updated!");
      fetchStaff();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/staff/${id}`, { method: "DELETE" });
      toast.success("Staff member removed");
      fetchStaff();
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove staff");
    }
  };

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleCount = ROLES.reduce((acc, r) => {
    acc[r] = staff.filter((s) => s.role === r).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Staff & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">{staff.length} team members in MongoDB</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map((r) => (
          <div key={r} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-2xl font-display font-bold">{roleCount[r] || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{r}s</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Staff Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member) => (
          <div key={member._id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(member._id)}
                className="p-1.5 hover:bg-destructive/10 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Role */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${ROLE_COLORS[member.role]}`}>
                  <Shield className="w-3 h-3" />
                  {member.role}
                </span>
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member._id, e.target.value as StaffRole)}
                  className="text-xs px-2 py-1 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last active: {new Date(member.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">No staff members found.</div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">Add Staff Member</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-up text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-display font-semibold text-lg">Remove Staff?</h3>
            <p className="text-sm text-muted-foreground mt-2">This team member will lose access to the admin panel.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
              <button onClick={() => handleRemove(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
