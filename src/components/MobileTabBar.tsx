"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

/* Thumb-reachable navigation for phones. Hidden from md up, where the header has everything. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen, setIsSearchOpen } = useCart();

  const tabClass = (active: boolean) =>
    `relative flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors active:scale-95 ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav
      aria-label="Quick navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch h-14">
        <Link href="/" className={tabClass(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
          <Home className="w-5 h-5" /> Home
        </Link>
        <Link href="/shop" className={tabClass(pathname.startsWith("/shop"))} aria-current={pathname.startsWith("/shop") ? "page" : undefined}>
          <LayoutGrid className="w-5 h-5" /> Shop
        </Link>
        <button onClick={() => setIsSearchOpen(true)} className={tabClass(false)}>
          <Search className="w-5 h-5" /> Search
        </button>
        <button onClick={() => setIsCartOpen(true)} className={tabClass(false)} aria-label={`Cart, ${itemCount} items`}>
          <span className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span key={itemCount} className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full gradient-brand text-primary-foreground text-[9px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-200">
                {itemCount}
              </span>
            )}
          </span>
          Cart
        </button>
        <Link href="/account" className={tabClass(pathname.startsWith("/account") || pathname === "/login")} aria-current={pathname.startsWith("/account") ? "page" : undefined}>
          <User className="w-5 h-5" /> Account
        </Link>
      </div>
    </nav>
  );
}
