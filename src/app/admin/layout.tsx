"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog,
  Settings, LogOut, Zap, Menu, X, Bell, Search, ChevronDown,
  FolderOpen, Tag, Ticket, Shield,
} from "lucide-react";
import { isAdminLoggedIn, adminLogout, getAuthUser, AuthUser } from "@/lib/store";
import { Toaster } from "sonner";

const ALL_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Manager", "Staff"] },
  { href: "/admin/products", label: "Products", icon: Package, roles: ["Admin", "Manager", "Staff"] },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen, roles: ["Admin", "Manager"] },
  { href: "/admin/brands", label: "Brands", icon: Tag, roles: ["Admin", "Manager"] },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, roles: ["Admin", "Manager", "Staff"] },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, roles: ["Admin", "Manager"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["Admin"] },
  { href: "/admin/staff", label: "Staff & Roles", icon: UserCog, roles: ["Admin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["Admin"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
    } else {
      setUser(getAuthUser());
    }
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

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[280px] min-h-screen admin-gradient text-primary-foreground fixed left-0 top-0 bottom-0 z-30">
        {/* Logo */}
        <div className="p-6 pb-4">
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/20 text-white shadow-lg shadow-primary/10"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <div className="flex items-center gap-3 px-4 py-3 mt-1">
            <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-xs font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none truncate">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-accent mt-1 flex items-center gap-1 font-semibold">
                <Shield className="w-3 h-3" /> {user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-[280px] min-h-screen admin-gradient text-primary-foreground animate-slide-in">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </span>
                <p className="font-display font-bold text-lg">Gadget & Gear<span className="text-accent">BD</span></p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/20 text-white"
                        : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 transition w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-[280px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-border h-16 flex items-center px-4 lg:px-8 gap-4">
          <button className="lg:hidden p-2 hover:bg-accent rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search products, orders, users..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-accent rounded-xl transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-accent transition">
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
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
