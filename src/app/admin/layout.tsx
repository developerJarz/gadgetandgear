"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
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
import { useAdminPrefs } from "@/hooks/use-admin-prefs";
import { useStoreSettings } from "@/hooks/use-store-settings";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

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
      { href: "/admin/media", label: "Media Library", icon: Image, roles: ["Admin", "Manager", "Staff", "Marketing", "Inventory"] },
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
      { href: "/admin/audit-logs", label: "Activity Monitor", icon: Activity, roles: ["Admin"], badge: "LIVE" },
      { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["Admin"] },
      { href: "/admin/api-management", label: "API & Webhooks", icon: Key, roles: ["Admin"] },
      { href: "/admin/backup", label: "Backup", icon: Database, roles: ["Admin"] },
      { href: "/admin/system", label: "System Health", icon: Activity, roles: ["Admin"] },
    ],
  },
];

const isItemActive = (href: string, pathname: string) =>
  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

// Super Admin sees everything an Admin does.
const canSee = (item: NavItem, role: string) => item.roles.includes(role === "Super Admin" ? "Admin" : role);

function SidebarGroup({
  group,
  userRole,
  pathname,
  collapsed,
  rail,
  onToggle,
  onItemClick,
}: {
  group: NavGroup;
  userRole: string;
  pathname: string;
  collapsed: boolean;
  rail: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}) {
  const filteredItems = group.items.filter((item) => canSee(item, userRole));
  if (filteredItems.length === 0) return null;

  if (rail) {
    return (
      <div className="px-2 py-1.5 space-y-0.5 border-b border-white/5 last:border-0">
        {filteredItems.map((item) => {
          const active = isItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center justify-center w-11 h-10 mx-auto rounded-xl transition-colors ${
                active ? "bg-primary/25 text-white" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-brand-dark text-white text-xs whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition shadow-lg border border-white/10 z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between px-4 py-2 text-[11px] text-primary-foreground/45 hover:text-primary-foreground/75 transition font-semibold"
      >
        <span>{group.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`} />
      </button>
      {/* Grid-rows trick animates height without measuring. */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-0.5 px-2 pb-1">
            {filteredItems.map((item) => {
              const active = isItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  tabIndex={collapsed ? -1 : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                    active ? "bg-primary/20 text-white" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5"
                  }`}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white ${item.badge === "LIVE" ? "bg-success/80" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
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
  const { prefs, setPrefs } = useAdminPrefs();
  const storeLogo = useStoreSettings()?.branding?.logo;
  const rail = prefs.sidebar === "rail";
  const sidebarWidth = rail ? 76 : 270;

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
      if (group.items.some((item) => isItemActive(item.href, pathname))) {
        setCollapsedGroups((prev) => ({ ...prev, [group.label]: false }));
      }
    });
  }, [pathname]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

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

  const sidebarContent = (isRail: boolean) => (
    <>
      {/* Logo */}
      <div className={isRail ? "py-4 flex justify-center" : "p-5 pb-3"}>
        <Link href="/admin" className="flex items-center gap-3" title="Dashboard">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/10 border border-white/15 p-1 shadow-lg shadow-primary/30 shrink-0">
            {storeLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={storeLogo} alt="Store logo" className="w-full h-full object-contain" />
            ) : (
              <NextImage src="/logo.png" alt="Gadget & Gear BD Logo" width={40} height={40} className="w-full h-full object-contain" />
            )}
          </div>
          {!isRail && (
            <div>
              <p className="font-display font-bold text-lg leading-none">Gadget & Gear<span className="text-accent">BD</span></p>
              <p className="text-[11px] opacity-60 mt-1">{user.role} panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-visible scrollbar-thin" aria-label="Admin">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            userRole={user.role}
            pathname={pathname}
            collapsed={collapsedGroups[group.label] ?? false}
            rail={isRail}
            onToggle={() => toggleGroup(group.label)}
            onItemClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/10 ${isRail ? "p-2 flex flex-col items-center gap-1" : "p-3"}`}>
        <button
          onClick={() => setPrefs({ sidebar: isRail ? "full" : "rail" })}
          title={isRail ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden lg:flex items-center gap-3 rounded-xl text-sm font-medium text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5 transition ${isRail ? "w-11 h-10 justify-center" : "px-4 py-2 w-full"}`}
        >
          {isRail ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Collapse</>}
        </button>
        <button
          onClick={handleLogout}
          title="Sign out"
          className={`flex items-center gap-3 rounded-xl text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 transition ${isRail ? "w-11 h-10 justify-center" : "px-4 py-2 w-full"}`}
        >
          <LogOut className="w-4 h-4" />
          {!isRail && "Sign out"}
        </button>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-background flex"
      data-density={prefs.density}
      data-reduce-motion={prefs.reduceMotion || undefined}
      style={{ "--admin-sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
    >
      <Toaster position="top-right" richColors closeButton />
      <CommandPalette />

      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex flex-col min-h-screen admin-gradient text-primary-foreground fixed left-0 top-0 bottom-0 z-30 transition-[width] duration-200 ease-out"
        style={{ width: sidebarWidth }}
      >
        {sidebarContent(rail)}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-[270px] h-full admin-gradient text-primary-foreground animate-slide-in-left flex flex-col">
            <div className="absolute right-3 top-5 z-10">
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 lg:ml-[var(--admin-sidebar-w)] transition-[margin] duration-200 ease-out">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-border h-14 flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden p-2 hover:bg-accent rounded-lg" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
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
            <span>Search anything…</span>
            <kbd className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-mono">
              Ctrl K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/" target="_blank" className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition">
              <Store className="w-3.5 h-3.5" /> View store
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-xl transition"
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent transition data-[state=open]:bg-accent">
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-semibold leading-tight">{user.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>
                  <Settings className="w-4 h-4" /> Store settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/admin/audit-logs")}>
                  <Activity className="w-4 h-4" /> Activity monitor
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPrefs({ sidebar: rail ? "full" : "rail" })} className="hidden lg:flex">
                  {rail ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />} {rail ? "Expand sidebar" : "Compact sidebar"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content: keyed so each page fades in on navigation */}
        <main key={pathname} className="p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 animate-page-in">{children}</main>
      </div>
    </div>
  );
}
