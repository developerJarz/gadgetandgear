"use client";

import { useEffect, useState } from "react";
import { Search, Shield, ShieldOff, Mail, Phone, Calendar, ShoppingBag, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "Customer";
  status: "Active" | "Banned";
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBan = async (user: UserRecord) => {
    const nextStatus = user.status === "Active" ? "Banned" : "Active";
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const updated = await res.json();
      toast.success(nextStatus === "Banned" ? `Banned ${user.name}` : `Unbanned ${user.name}`);
      fetchUsers();
      if (selectedUser?._id === user._id) {
        setSelectedUser(updated);
      }
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const filtered = users
    .filter((u) => statusFilter === "all" || u.status === statusFilter)
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const activeCount = users.filter((u) => u.status === "Active").length;
  const bannedCount = users.filter((u) => u.status === "Banned").length;

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
      <div>
        <h1 className="font-display font-bold text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">{users.length} registered customers in MongoDB</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-2xl font-display font-bold">{users.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-success">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-destructive">{bannedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Banned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {["all", "Active", "Banned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm border transition ${statusFilter === s ? "gradient-brand text-primary-foreground border-transparent" : "border-border hover:bg-accent"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Orders</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Spent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    className={`border-b border-border/50 hover:bg-accent/30 transition cursor-pointer ${selectedUser?._id === user._id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">{user.ordersCount}</td>
                    <td className="py-3 px-4 hidden md:table-cell font-display font-semibold">৳{user.totalSpent.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        user.status === "Active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleBan(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          user.status === "Active"
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "bg-success/10 text-success hover:bg-success/20"
                        }`}
                      >
                        {user.status === "Active" ? (
                          <><ShieldOff className="w-3 h-3" /> Ban</>
                        ) : (
                          <><Shield className="w-3 h-3" /> Unban</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Panel */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {selectedUser ? (
            <div className="space-y-5 animate-fade-up">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary mx-auto">
                  {selectedUser.name.charAt(0)}
                </div>
                <p className="font-display font-semibold text-lg mt-3">{selectedUser.name}</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider mt-1 ${
                  selectedUser.status === "Active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedUser.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {new Date(selectedUser.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedUser.ordersCount} orders</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display font-semibold">৳{selectedUser.totalSpent.toLocaleString()}</span> <span className="text-muted-foreground">total spent</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleBan(selectedUser)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${
                  selectedUser.status === "Active"
                    ? "bg-destructive text-destructive-foreground hover:opacity-90"
                    : "bg-success text-brand-dark hover:opacity-90"
                }`}
              >
                {selectedUser.status === "Active" ? "Ban User" : "Unban User"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Select a user to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
