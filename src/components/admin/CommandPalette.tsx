"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Package, ShoppingCart, Users, Settings, FileText,
  BarChart3, DollarSign, Shield, Truck, MessageSquare, Image,
  Sparkles, ArrowRight, Command, CornerDownLeft,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href: string;
  group: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Commerce
  { id: "dashboard", label: "Dashboard", description: "Overview & analytics", icon: BarChart3, href: "/admin", group: "Commerce" },
  { id: "products", label: "Products", description: "Manage product catalog", icon: Package, href: "/admin/products", group: "Commerce" },
  { id: "orders", label: "Orders", description: "Order management", icon: ShoppingCart, href: "/admin/orders", group: "Commerce" },
  { id: "inventory", label: "Inventory", description: "Stock & warehouse", icon: Package, href: "/admin/inventory", group: "Commerce" },
  { id: "returns", label: "Returns & Refunds", description: "Return management", icon: ShoppingCart, href: "/admin/returns", group: "Commerce" },
  { id: "customers", label: "Customers (CRM)", description: "Customer management", icon: Users, href: "/admin/users", group: "Commerce" },
  { id: "vendors", label: "Vendors", description: "Multi-vendor management", icon: Users, href: "/admin/vendors", group: "Commerce" },
  // Finance
  { id: "analytics", label: "Analytics", description: "Sales & business intelligence", icon: BarChart3, href: "/admin/analytics", group: "Finance" },
  { id: "finance", label: "Finance", description: "Revenue, expenses, profit", icon: DollarSign, href: "/admin/finance", group: "Finance" },
  { id: "reports", label: "Reports", description: "Generate & export reports", icon: FileText, href: "/admin/reports", group: "Finance" },
  // Marketing
  { id: "coupons", label: "Coupons", description: "Discount codes", icon: DollarSign, href: "/admin/coupons", group: "Marketing" },
  { id: "campaigns", label: "Campaigns", description: "Marketing campaigns", icon: MessageSquare, href: "/admin/campaigns", group: "Marketing" },
  { id: "marketing", label: "Marketing Suite", description: "Email, SMS, push", icon: MessageSquare, href: "/admin/marketing", group: "Marketing" },
  { id: "abandoned", label: "Abandoned Carts", description: "Cart recovery", icon: ShoppingCart, href: "/admin/abandoned-carts", group: "Marketing" },
  // Content
  { id: "blog", label: "Blog & CMS", description: "Blog posts", icon: FileText, href: "/admin/blog", group: "Content" },
  { id: "seo", label: "SEO Management", description: "Search optimization", icon: Search, href: "/admin/seo", group: "Content" },
  { id: "reviews", label: "Reviews", description: "Rating moderation", icon: MessageSquare, href: "/admin/reviews", group: "Content" },
  { id: "media", label: "Media Library", description: "Images & files", icon: Image, href: "/admin/media", group: "Content" },
  // AI
  { id: "ai", label: "AI Tools", description: "Content generator & analytics", icon: Sparkles, href: "/admin/ai", group: "AI Tools" },
  // System
  { id: "couriers", label: "Couriers", description: "Bangladesh courier setup", icon: Truck, href: "/admin/couriers", group: "System" },
  { id: "staff", label: "Staff & Roles", description: "Team management", icon: Users, href: "/admin/staff", group: "System" },
  { id: "security", label: "Security Center", description: "2FA, login logs, IP tracking", icon: Shield, href: "/admin/security", group: "System" },
  { id: "audit", label: "Audit Logs", description: "Activity trails", icon: FileText, href: "/admin/audit-logs", group: "System" },
  { id: "settings", label: "Settings", description: "Store configuration", icon: Settings, href: "/admin/settings", group: "System" },
  { id: "api", label: "API & Webhooks", description: "API keys & webhooks", icon: Settings, href: "/admin/api-management", group: "System" },
  { id: "backup", label: "Backup & Recovery", description: "Database backups", icon: Shield, href: "/admin/backup", group: "System" },
  { id: "system", label: "System Health", description: "Performance monitoring", icon: BarChart3, href: "/admin/system", group: "System" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = COMMAND_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatFiltered[selectedIdx]) {
      handleSelect(flatFiltered[selectedIdx]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, settings..."
            className="flex-1 py-4 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-2">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{group}</p>
              {items.map((item) => {
                const globalIdx = flatFiltered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIdx(globalIdx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition text-sm ${
                      globalIdx === selectedIdx ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.label}</p>
                      {item.description && <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>}
                    </div>
                    {globalIdx === selectedIdx && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
          {flatFiltered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
          <span className="flex items-center gap-1">↑↓ Navigate</span>
          <span className="flex items-center gap-1 ml-auto"><Command className="w-3 h-3" />K Toggle</span>
        </div>
      </div>
    </div>
  );
}
