"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog,
  Settings, LogOut, Zap, Menu, X, Bell, Search, ChevronDown, ChevronRight,
  FolderOpen, Tag, Ticket, Shield, BarChart3, DollarSign, Truck,
  RotateCcw, MessageSquare, FileText, Image, Sparkles, Database,
  Activity, Key, Store, Globe, Star, ShoppingBag, Moon, Sun,
} from "lucide-react";
import { Toaster } from "sonner";
import CommandPalette from "@/components/admin/CommandPalette";
import NotificationCenter from "@/components/admin/NotificationCenter";
import { useTheme } from "@/context/ThemeProvider";

interface AuthUser {
  loggedIn: boolean;
  email: string;
  name: string;
  role: string;
  loginAt: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Commerce",
    defaultOpen: true,
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Manager", "Staff"] },
      { href: "/admin/products", label: "Products", icon: Package, roles: ["Admin", "Manager", "Staff"] },
      { href: "/admin/categories", label: "Categories", icon: FolderOpen, roles: ["Admin", "Manager"] },
      { href: "/admin/brands", label: "Brands", icon: Tag, roles: ["Admin", "Manager"] },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, roles: ["Admin", "Manager", "Staff"] },
      { href: "/admin/inventory", label: "Inventory", icon: Database, roles: ["Admin", "Manager"] },
      { href: "/admin/returns", label: "Returns", icon: RotateCcw, roles: ["Admin", "Manager"] },
      { href: "/admin/vendors", label: "Vendors", icon: Store, roles: ["Admin"] },
    ],
  },
  {
    label: "Customers",
    defaultOpen: false,
    items: [
      { href: "/admin/users", label: "Customers CRM", icon: Users, roles: ["Admin", "Manager"] },
      { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["Admin", "Manager", "Staff"] },
      { href: "/admin/abandoned-carts", label: "Abandoned Carts", icon: ShoppingBag, roles: ["Admin", "Manager"] },
    ],
  },
  {
    label: "Finance & Analytics",
    defaultOpen: false,
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["Admin", "Manager"] },
      { href: "/admin/finance", label: "Finance", icon: DollarSign, roles: ["Admin"] },
      { href: "/admin/reports", label: "Reports", icon: FileText, roles: ["Admin", "Manager"] },
    ],
  },
  {
    label: "Marketing",
    defaultOpen: false,
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Ticket, roles: ["Admin", "Manager"] },
      { href: "/admin/campaigns", label: "Campaigns", icon: MessageSquare, roles: ["Admin", "Manager"] },
      { href: "/admin/marketing", label: "Marketing Suite", icon: Globe, roles: ["Admin", "Manager"] },
    ],
  },
  {
    label: "Content",
    defaultOpen: false,
    items: [
      { href: "/admin/blog", label: "Blog & CMS", icon: FileText, roles: ["Admin", "Manager", "Staff"] },
      { href: "/admin/seo", label: "SEO", icon: Search, roles: ["Admin", "Manager"] },
      { href: "/admin/media", label: "Media Library", icon: Image, roles: ["Admin", "Manager", "Staff"] },
    ],
  },
  {
    label: "AI Tools",
    defaultOpen: false,
    items: [
      { href: "/admin/ai", label: "AI Suite", icon: Sparkles, roles: ["Admin", "Manager"], badge: "NEW" },
    ],
  },
  {
    label: "System",
    defaultOpen: false,
    items: [
      { href: "/admin/staff", label: "Staff & Roles", icon: UserCog, roles: ["Admin"] },
      { href: "/admin/couriers", label: "Couriers", icon: Truck, roles: ["Admin"] },
      { href: "/admin/security", label: "Security", icon: Shield, roles: ["Admin"] },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity, roles: ["Admin"] },
      { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["Admin"] },
      { href: "/admin/api-management", label: "API & Webhooks", icon: Key, roles: ["Admin"] },
      { href: "/admin/backup", label: "Backup", icon: Database, roles: ["Admin"] },
      { href: "/admin/system", label: "System Health", icon: Activity, roles: ["Admin"] },
    ],
  },
];

function SidebarGroup({
  group,
  userRole,
  pathname,
  collapsed,
  onToggle,
}: {
  group: NavGroup;
  userRole: string;
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const filteredItems = group.items.filter((item) => item.roles.includes(userRole));
  if (filteredItems.length === 0) return null;

  const hasActive = filteredItems.some((item) => {
    if (item.href === "/admin") return pathname === "/admin";
    return pathname.startsWith(item.href);
  });

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-widest text-primary-foreground/40 hover:text-primary-foreground/70 transition font-semibold"
      >
        <span>{group.label}</span>
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
      {!collapsed && (
        <div className="space-y-0.5 px-2">
          {filteredItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-primary/20 text-white shadow-lg shadow-primary/10"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  // Track collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      initial[g.label] = !g.defaultOpen;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-expand group containing active page
  useEffect(() => {
    NAV_GROUPS.forEach((group) => {
      const hasActive = group.items.some((item) => {
        if (item.href === "/admin") return pathname === "/admin";
        return pathname.startsWith(item.href);
      });
      if (hasActive) {
        setCollapsedGroups((prev) => ({ ...prev, [group.label]: false }));
      }
    });
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    // Check server-side auth first
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser({
            loggedIn: true,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            loginAt: new Date().toISOString(),
          });
        } else {
          // Try localStorage fallback
          try {
            const stored = localStorage.getItem("gh_auth");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.loggedIn && parsed.role !== "Customer") {
                setUser(parsed);
                return;
              }
            }
          } catch {}
          router.push("/admin/login");
        }
      })
      .catch(() => {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem("gh_auth");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.loggedIn && parsed.role !== "Customer") {
              setUser(parsed);
              return;
            }
          }
        } catch {}
        router.push("/admin/login");
      });
  }, [router]);

  // Don't render admin layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("gh_auth");
    router.push("/admin/login");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 pb-3">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <p className="font-display font-bold text-lg leading-none">Gadget & Gear<span className="text-accent">BD</span></p>
            <p className="text-[10px] uppercase tracking-widest opacity-60 mt-0.5">{user.role} Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            userRole={user.role}
            pathname={pathname}
            collapsed={collapsedGroups[group.label] ?? false}
            onToggle={() => toggleGroup(group.label)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 transition w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <div className="flex items-center gap-3 px-4 py-2.5 mt-1">
          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-xs font-bold uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-none truncate">{user.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-accent mt-1 flex items-center gap-1 font-semibold">
              <Shield className="w-3 h-3" /> {user.role}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster position="top-right" richColors closeButton />
      <CommandPalette />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[270px] min-h-screen admin-gradient text-primary-foreground fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-[270px] min-h-screen admin-gradient text-primary-foreground animate-slide-in flex flex-col">
            <div className="absolute right-3 top-5">
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-[270px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-border h-14 flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden p-2 hover:bg-accent rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Search trigger */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="flex-1 max-w-sm relative hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background/80 text-sm text-muted-foreground hover:border-primary/30 transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search anything...</span>
            <kbd className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-mono">
              Ctrl+K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-xl transition"
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* Profile */}
            <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent transition">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold leading-tight">{user.name}</span>
                <span className="block text-[10px] text-muted-foreground">{user.role}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
