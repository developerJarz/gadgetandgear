"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronRight, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Support" },
] as const;

export function Header() {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { itemCount, wishlist, setIsCartOpen, setIsSearchOpen } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container-x flex items-center justify-between h-14 lg:h-16">
          <button className="lg:hidden -ml-2 p-2" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg lg:text-xl tracking-tight">
            <span className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </span>
            Gadget & Gear<span className="text-primary">BD</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`hover:text-primary transition-colors ${pathname === n.href ? "text-primary font-medium" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-primary hover:bg-accent rounded-xl transition"
              aria-label="Search"
              title="Search products"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Admin Dashboard Quick Access / User */}
            <Link
              href="/admin"
              className="p-2 hover:text-primary hover:bg-accent rounded-xl transition hidden sm:inline-flex items-center gap-1 text-xs font-medium"
              aria-label="Admin Portal"
              title="Admin Dashboard"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="p-2 hover:text-primary hover:bg-accent rounded-xl transition hidden sm:inline-flex relative"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:text-primary hover:bg-accent rounded-xl transition relative flex items-center"
              aria-label="Cart"
              title="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 gradient-brand text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menu && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden animate-fade-up">
          <div className="flex items-center justify-between h-14 px-5 border-b border-border">
            <span className="font-display font-bold text-lg">Gadget & Gear<span className="text-primary">BD</span></span>
            <button onClick={() => setMenu(false)} aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex flex-col p-6 gap-1 text-lg">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setMenu(false)} className="flex items-center justify-between py-3 border-b border-border">
                {n.label} <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
            <Link href="/wishlist" onClick={() => setMenu(false)} className="flex items-center justify-between py-3 border-b border-border">
              Wishlist <Heart className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link href="/admin" onClick={() => setMenu(false)} className="flex items-center justify-between py-3">
              Admin Panel <ShieldCheck className="w-4 h-4 text-primary" />
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
