"use client";

import { useEffect, useState } from "react";
import {
  Search, Shield, ShieldOff, Mail, Phone, Calendar,
  ShoppingBag, DollarSign, Download, ChevronLeft, ChevronRight, UserPlus,
} from "lucide-react";
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
  segment?: string;
  loyaltyPoints?: number;
}

const SEGMENT_COLORS: Record<string, string> = {
  New: "bg-primary/10 text-primary",
  Regular: "bg-accent text-accent-foreground",
  VIP: "bg-warning/20 text-warning",
  "At-Risk": "bg-destructive/10 text-destructive",
  Inactive: "bg-muted text-muted-foreground",
};

const PAGE_SIZE = 15;

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [page, setPage] = useState(1);

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

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Status", "Orders", "Total Spent", "Joined", "Segment"];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.phone || "N/A",
      u.status,
      u.ordersCount.toString(),
      u.totalSpent.toString(),
      new Date(u.joinedAt).toLocaleDateString(),
      u.segment || "New",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported customers to CSV");
  };

  const filtered = users
    .filter((u) => statusFilter === "all" || u.status === statusFilter)
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const activeCount = users.filter((u) => u.status === "Active").length;
  const bannedCount = users.filter((u) => u.status === "Banned").length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl">Customers</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{users.length} registered customers in MongoDB</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-border hover:bg-accent transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
          <p className="text-xl lg:text-2xl font-display font-bold">{users.length}</p>
          <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
          <p className="text-xl lg:text-2xl font-display font-bold text-success">{activeCount}</p>
          <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">Active</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
          <p className="text-xl lg:text-2xl font-display font-bold text-destructive">{bannedCount}</p>
          <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">Banned</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
          <p className="text-xl lg:text-2xl font-display font-bold text-primary">৳{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">Total Revenue</p>
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
        <div className="flex gap-2 flex-wrap">
          {["all", "Active", "Banned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm border transition ${statusFilter === s ? "gradient-brand text-primary-foreground border-transparent" : "border-border hover:bg-accent"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Users Table / Cards */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Segment</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Spent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={`border-b border-border/50 hover:bg-accent/30 transition cursor-pointer ${selectedUser?._id === user._id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${SEGMENT_COLORS[user.segment || "New"] || SEGMENT_COLORS["New"]}`}>
                        {user.segment || "New"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.ordersCount}</td>
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
                {paginatedUsers.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-border">
            {paginatedUsers.map((user) => (
              <div
                key={user._id}
                className={`p-4 hover:bg-accent/30 transition cursor-pointer ${selectedUser?._id === user._id ? "bg-primary/5" : ""}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider shrink-0 ${
                    user.status === "Active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                  }`}>
                    {user.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 ml-12 text-[10px] text-muted-foreground">
                  <span>{user.ordersCount} orders</span>
                  <span className="font-display font-semibold text-foreground">৳{user.totalSpent.toLocaleString()}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${SEGMENT_COLORS[user.segment || "New"] || SEGMENT_COLORS["New"]}`}>
                    {user.segment || "New"}
                  </span>
                </div>
              </div>
            ))}
            {paginatedUsers.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">No users found.</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                        pageNum === page
                          ? "gradient-brand text-primary-foreground"
                          : "border border-border hover:bg-accent"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Detail Panel */}
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-6">
          {selectedUser ? (
            <div className="space-y-5 animate-fade-up">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary mx-auto">
                  {selectedUser.name.charAt(0)}
                </div>
                <p className="font-display font-semibold text-lg mt-3">{selectedUser.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                    selectedUser.status === "Active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                  }`}>
                    {selectedUser.status}
                  </span>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    SEGMENT_COLORS[selectedUser.segment || "New"] || SEGMENT_COLORS["New"]
                  }`}>
                    {selectedUser.segment || "New"}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{selectedUser.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Joined {new Date(selectedUser.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{selectedUser.ordersCount} orders</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-display font-semibold">৳{selectedUser.totalSpent.toLocaleString()}</span> <span className="text-muted-foreground">total spent</span>
                </div>
                {(selectedUser.loyaltyPoints ?? 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <span className="text-warning text-sm">⭐</span>
                    <span className="font-medium">{selectedUser.loyaltyPoints} loyalty points</span>
                  </div>
                )}
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
