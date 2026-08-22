"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Package } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  productSlug: string;
  productName: string;
  qty: number;
  price: number;
}

interface OrderRecord {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-warning/20 text-warning border-warning/30",
  Processing: "bg-primary/20 text-primary border-primary/30",
  Shipped: "bg-accent text-accent-foreground border-accent",
  Delivered: "bg-success/20 text-success border-success/30",
  Cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || data);
    } catch {
      toast.error("Failed to load orders");
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success("Order status updated!");
      fetchOrders();
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter(
      (o) =>
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase())
    );

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
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
      <div>
        <h1 className="font-display font-bold text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders in MongoDB</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`p-4 rounded-xl border text-left transition ${
              statusFilter === s ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <p className="text-2xl font-display font-bold">{statusCounts[s] || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{s}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tbody key={order._id}>
                  <tr
                    className="border-b border-border/50 hover:bg-accent/30 transition cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs font-medium">{order.orderId}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 font-display font-semibold">৳{order.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="appearance-none text-xs px-3 py-1.5 pr-7 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                  {/* Expanded order details */}
                  {expandedOrder === order._id && (
                    <tr className="bg-muted/30">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <p className="font-medium text-sm">Customer Info</p>
                            <p><span className="text-muted-foreground">Phone:</span> {order.customerPhone}</p>
                            <p><span className="text-muted-foreground">Address:</span> {order.address}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium text-sm">Items</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-2">
                                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{item.productName}</span>
                                  <span className="text-muted-foreground">×{item.qty}</span>
                                </div>
                                <span className="font-display font-semibold">৳{(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between pt-2 border-t border-border font-medium text-sm">
                              <span>Total</span>
                              <span className="font-display font-bold">৳{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
