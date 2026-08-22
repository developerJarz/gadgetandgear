"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell, ShoppingCart, Package, AlertTriangle, CheckCircle, Info,
  X, Check, Trash2,
} from "lucide-react";

export interface AppNotification {
  id: string;
  type: "order" | "system" | "marketing" | "alert" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  order: ShoppingCart,
  system: Info,
  marketing: Package,
  alert: AlertTriangle,
  success: CheckCircle,
};

const ICON_COLORS: Record<string, string> = {
  order: "text-primary bg-primary/10",
  system: "text-muted-foreground bg-muted",
  marketing: "text-warning bg-warning/10",
  alert: "text-destructive bg-destructive/10",
  success: "text-success bg-success/10",
};

const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "order", title: "New Order #ORD-1042", message: "Tanvir Ahmed placed an order for ৳12,500", time: "2 min ago", read: false },
  { id: "n2", type: "alert", title: "Low Stock Alert", message: "Galaxy Flagship Pro 5G has only 3 units left", time: "15 min ago", read: false },
  { id: "n3", type: "success", title: "Payment Received", message: "bKash payment ৳34,900 confirmed for #ORD-1041", time: "1 hour ago", read: false },
  { id: "n4", type: "marketing", title: "Campaign Ended", message: "Eid Flash Sale campaign has ended with 234 conversions", time: "3 hours ago", read: true },
  { id: "n5", type: "system", title: "Backup Complete", message: "Daily database backup completed successfully", time: "5 hours ago", read: true },
  { id: "n6", type: "order", title: "Order Shipped #ORD-1039", message: "Assigned to Pathao Courier, tracking: PTH-8832", time: "6 hours ago", read: true },
];

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-accent rounded-xl transition"
        id="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm">Notifications</h3>
              <p className="text-[10px] text-muted-foreground">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-primary hover:underline px-2 py-1"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-2 flex gap-1 border-b border-border">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition capitalize ${
                  filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {f} {f === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No {filter === "unread" ? "unread " : ""}notifications
              </div>
            ) : (
              displayed.map((n) => {
                const Icon = ICONS[n.type] || Info;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition group cursor-pointer ${
                      !n.read ? "bg-primary/[0.03]" : ""
                    }`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ICON_COLORS[n.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-medium truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                          className="p-1 hover:bg-accent rounded"
                          title="Mark read"
                        >
                          <Check className="w-3 h-3 text-success" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                        className="p-1 hover:bg-destructive/10 rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
