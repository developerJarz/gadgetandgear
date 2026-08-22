"use client";

import { useState } from "react";
import { Activity, Search, Filter, Download, User, Clock, FileText, Settings, Package, ShoppingCart, Shield } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";

const auditLogs = [
  { id: "AL-001", action: "Product Updated", module: "Products", user: "System Admin", details: 'Updated price of "Galaxy Flagship Pro 5G" from ৳125,900 to ৳129,900', ip: "103.145.22.44", timestamp: "Aug 18, 2026 11:30 PM" },
  { id: "AL-002", action: "Order Status Changed", module: "Orders", user: "Store Manager", details: "Order #ORD-1042 status changed from Pending → Processing", ip: "103.145.22.45", timestamp: "Aug 18, 2026 10:15 PM" },
  { id: "AL-003", action: "Coupon Created", module: "Coupons", user: "System Admin", details: 'Created coupon "EID40" with 40% discount', ip: "103.145.22.44", timestamp: "Aug 18, 2026 8:45 PM" },
  { id: "AL-004", action: "User Banned", module: "Users", user: "System Admin", details: "Banned user ayesha@example.com for policy violation", ip: "103.145.22.44", timestamp: "Aug 18, 2026 6:20 PM" },
  { id: "AL-005", action: "Settings Updated", module: "Settings", user: "System Admin", details: "Updated delivery zones - added Gazipur", ip: "103.145.22.44", timestamp: "Aug 18, 2026 5:00 PM" },
  { id: "AL-006", action: "Staff Role Changed", module: "Staff", user: "System Admin", details: 'Changed Fatima Begum role from Staff to Manager', ip: "103.145.22.44", timestamp: "Aug 17, 2026 4:30 PM" },
  { id: "AL-007", action: "Product Deleted", module: "Products", user: "Store Manager", details: 'Deleted product "Old Model XR Phone"', ip: "103.145.22.45", timestamp: "Aug 17, 2026 2:15 PM" },
  { id: "AL-008", action: "Backup Created", module: "System", user: "System", details: "Automated daily backup completed (12.4 MB)", ip: "127.0.0.1", timestamp: "Aug 17, 2026 12:00 AM" },
];

const MODULE_ICONS: Record<string, React.ElementType> = { Products: Package, Orders: ShoppingCart, Coupons: FileText, Users: User, Settings: Settings, Staff: Shield, System: Activity };
const ACTION_COLORS: Record<string, string> = { Created: "bg-success/20 text-success", Updated: "bg-primary/20 text-primary", Deleted: "bg-destructive/20 text-destructive", Changed: "bg-warning/20 text-warning", Banned: "bg-destructive/20 text-destructive" };

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const filtered = auditLogs
    .filter((l) => moduleFilter === "all" || l.module === moduleFilter)
    .filter((l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()));

  const getActionColor = (action: string) => {
    const key = Object.keys(ACTION_COLORS).find((k) => action.includes(k));
    return key ? ACTION_COLORS[key] : "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-display font-bold text-3xl">Audit Logs</h1><p className="text-sm text-muted-foreground mt-1">{auditLogs.length} logged actions</p></div>
        <button onClick={() => { exportToCSV(auditLogs.map(l => ({ Action: l.action, Module: l.module, User: l.user, Details: l.details, IP: l.ip, Time: l.timestamp })), "audit_logs"); toast.success("Exported!"); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent transition"><Download className="w-3.5 h-3.5" /> Export</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="all">All Modules</option>{[...new Set(auditLogs.map(l => l.module))].map(m => <option key={m} value={m}>{m}</option>)}</select>
      </div>

      <div className="space-y-2">
        {filtered.map((log) => {
          const Icon = MODULE_ICONS[log.module] || Activity;
          return (
            <div key={log.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getActionColor(log.action)}`}>{log.action}</span>
                    <span className="text-xs text-muted-foreground">by <span className="font-medium text-foreground">{log.user}</span></span>
                    <span className="text-[10px] text-muted-foreground">· {log.module}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.timestamp}</span>
                    <span className="font-mono">{log.ip}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
