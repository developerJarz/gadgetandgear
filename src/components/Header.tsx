"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronRight, ChevronDown,
  ShieldCheck, LogIn, UserPlus, LogOut, Truck, PhoneCall, Sparkles, Zap,
  LayoutGrid, ArrowRight, Star, Tag, MapPin
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { CATEGORIES, PRODUCTS } from "@/lib/site-data";

interface AuthState {
  loggedIn: boolean;
  name: string;
  email: string;
  role: string;
}

const POPULAR_SEARCHES = [
  "iPhone 16 Pro",
  "Samsung Galaxy S24",
  "MacBook Pro M3",
  "Sony ANC Headphones",
  "Mechanical Keyboard",
  "Smartwatch AMOLED",
];

const QUICK_CATEGORIES = [
  { label: "Smartphones", slug: "smartphones" },
  { label: "Laptops", slug: "laptops" },
  { label: "Earbuds & Audio", slug: "earbuds" },
  { label: "Smart Watches", slug: "smartwatches" },
  { label: "Monitors", slug: "monitors" },
  { label: "Keyboards", slug: "keyboards" },
  { label: "Power Banks", slug: "power" },
  { label: "Accessories", slug: "accessories" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, cartTotal, wishlist, setIsCartOpen } = useCart();
  const [authUser, setAuthUser] = useState<AuthState | null>(null);
  const [mounted, setMounted] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener for compact header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 45);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load auth user from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("gh_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.loggedIn) {
          setAuthUser(parsed);
        } else {
          setAuthUser(null);
        }
      }
    } catch {}
  }, [pathname]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setUserDropdownOpen(false);
    setSearchFocused(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gh_auth");
      setAuthUser(null);
      setUserDropdownOpen(false);
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (searchCategory !== "all") {
        router.push(`/shop?category=${searchCategory}`);
      } else {
        router.push("/shop");
      }
      setSearchFocused(false);
      return;
    }

    const params = new URLSearchParams();
    params.set("q", searchQuery.trim());
    if (searchCategory !== "all") {
      params.set("category", searchCategory);
    }
    setSearchFocused(false);
    setMobileSearchOpen(false);
    router.push(`/shop?${params.toString()}`);
  };

  // Filtered preview products for live search
  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return PRODUCTS.filter((p) => {
      const matchesCat = searchCategory === "all" || p.category === searchCategory;
      const matchesText =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesText;
    }).slice(0, 5);
  }, [searchQuery, searchCategory]);

  const isLoggedIn = mounted && authUser?.loggedIn;

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT & UTILITY BAR (Scrolls away smoothly) */}
      <div className="bg-brand-dark text-primary-foreground border-b border-white/10 text-[11px] select-none relative z-50">
        <div className="container-x flex items-center justify-between h-7 sm:h-8 py-0">
          {/* Left: Animated Promo Announcement */}
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-flex items-center gap-1 font-semibold text-warning px-1.5 py-0.5 rounded bg-warning/15 uppercase text-[9px] tracking-wider">
              <Zap className="w-2.5 h-2.5 fill-current" /> Live Deal
            </span>
            <span className="text-muted-foreground/90 hidden sm:inline text-[11px]">
              ⚡ Flash deals up to 40% off — today only | 🚚 Free delivery inside Dhaka over ৳3,000
            </span>
            <span className="text-muted-foreground/90 sm:hidden truncate text-[10px]">
              ⚡ Flash deals up to 40% off | 0% EMI
            </span>
          </div>

          {/* Right: Customer Assistance & Quick Links */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-muted-foreground/90 text-[11px]">
            <a
              href="tel:+8801677248045"
              className="hidden md:inline-flex items-center gap-1 hover:text-white transition"
              title="Customer Helpline"
            >
              <PhoneCall className="w-3 h-3 text-primary" />
              <span>Hotline: <strong className="text-white font-medium">+880 1677-248045</strong></span>
            </a>

            <span className="hidden md:inline text-white/20">|</span>

            <Link
              href="/account"
              className="inline-flex items-center gap-1 hover:text-white transition"
              title="Track Order Status"
            >
              <Truck className="w-3 h-3 text-primary" />
              <span>Track Order</span>
            </Link>

            <span className="hidden lg:inline text-white/20">|</span>

            <Link
              href="/contact"
              className="hidden lg:inline-flex items-center gap-1 hover:text-white transition"
            >
              <MapPin className="w-3 h-3 text-primary" />
              <span>Locations</span>
            </Link>

            <span className="hidden sm:inline text-white/20">|</span>

            <span className="hidden sm:inline-flex items-center gap-1 text-white font-medium">
              🇧🇩 BDT (৳)
            </span>
          </div>
        </div>
      </div>

      {/* 2. STICKY MAIN HEADER WITH SCROLL EFFECT */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl border-border/80 shadow-md shadow-black/5"
            : "glass border-border/70 shadow-none"
        }`}
      >
        {/* Main Row: Logo, Search Bar, and Actions */}
        <div
          className={`container-x flex items-center justify-between gap-3 md:gap-6 transition-all duration-300 ${
            isScrolled ? "py-2 sm:py-2.5" : "py-3 sm:py-3.5"
          }`}
        >
          {/* Left: Mobile Hamburger & Store Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              className="lg:hidden p-1.5 hover:bg-accent rounded-xl text-foreground transition -ml-1"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
              <div
                className={`relative flex items-center shrink-0 transition-all duration-300 group-hover:scale-[1.02] ${
                  isScrolled
                    ? "h-9 sm:h-10 w-[125px] sm:w-[155px] lg:w-[175px]"
                    : "h-10 sm:h-11 w-[135px] sm:w-[165px] lg:w-[190px]"
                }`}
              >
                <Image
                  src="/logo.png"
                  alt="Gadget & Gear Logo"
                  width={256}
                  height={151}
                  className="w-full h-full object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Search Bar (Remains visible and prominent on scroll) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl relative">
            <form
              onSubmit={handleSearchSubmit}
              className={`flex items-center w-full rounded-2xl border transition-all duration-200 bg-background/90 overflow-hidden ${
                searchFocused
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border/80 hover:border-primary/40 shadow-sm"
              }`}
            >
              {/* Category Selector */}
              <div className="relative border-r border-border/80 bg-secondary/35 shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className={`pl-3 pr-6 text-[11px] font-medium bg-transparent cursor-pointer focus:outline-none appearance-none text-foreground transition-all duration-300 ${
                    isScrolled ? "h-9" : "h-9 sm:h-10"
                  }`}
                  aria-label="Filter search by category"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>

              {/* Text Input */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search laptops, smartphones, earbuds, brands..."
                  className={`w-full px-3 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground text-foreground transition-all duration-300 ${
                    isScrolled ? "py-1.5" : "py-2"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 mr-1 text-muted-foreground hover:text-foreground rounded-full"
                    aria-label="Clear search input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`px-4 gradient-brand text-primary-foreground font-medium text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition shrink-0 ${
                  isScrolled ? "h-9" : "h-9 sm:h-10"
                }`}
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Search</span>
              </button>
            </form>

            {/* Live Search Auto-suggest Popup */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 animate-fade-up max-h-[420px] overflow-y-auto">
                {searchQuery.trim() === "" ? (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" /> Popular Searches
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            router.push(`/shop?q=${encodeURIComponent(term)}`);
                            setSearchFocused(false);
                          }}
                          className="px-2.5 py-1 rounded-full text-xs bg-secondary hover:bg-primary/10 hover:text-primary transition border border-border/80 font-medium"
                        >
                          {term}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-xs">
                      <Link
                        href="/shop?tag=Flash+Deal"
                        onClick={() => setSearchFocused(false)}
                        className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition flex items-center gap-1.5 text-destructive font-medium text-[11px]"
                      >
                        <Zap className="w-3 h-3" /> Flash Deals
                      </Link>
                      <Link
                        href="/shop?tag=Bestseller"
                        onClick={() => setSearchFocused(false)}
                        className="p-2 rounded-xl bg-warning/10 border border-warning/20 hover:bg-warning/20 transition flex items-center gap-1.5 text-warning font-medium text-[11px]"
                      >
                        <Star className="w-3 h-3" /> Bestsellers
                      </Link>
                      <Link
                        href="/shop?tag=New"
                        onClick={() => setSearchFocused(false)}
                        className="p-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 text-primary font-medium text-[11px]"
                      >
                        <Tag className="w-3 h-3" /> New Arrivals
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Matching Gadgets ({liveSearchResults.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        See all results <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {liveSearchResults.length > 0 ? (
                      <div className="space-y-1">
                        {liveSearchResults.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/product/${p.slug}`}
                            onClick={() => setSearchFocused(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden shrink-0 relative">
                              <Image src={p.img} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">{p.brand}</p>
                              <p className="text-xs font-medium text-foreground group-hover:text-primary transition truncate">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-foreground font-display">
                                  ৳{p.price.toLocaleString()}
                                </span>
                                {p.was && (
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    ৳{p.was.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-5 text-center text-xs text-muted-foreground">
                        No direct matches. Press Enter for full catalog search for &quot;{searchQuery}&quot;.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Customer Hub Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 text-foreground hover:bg-accent rounded-xl transition"
              aria-label="Open search input"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="p-1.5 sm:px-2 sm:py-1.5 hover:bg-accent rounded-xl transition group relative flex items-center gap-1.5"
              aria-label="View Wishlist"
              title="My Wishlist"
            >
              <div className="relative">
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-foreground group-hover:text-primary transition" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 gradient-brand text-primary-foreground text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <p className="text-[9px] text-muted-foreground font-medium">Saved</p>
                <p className="text-[11px] font-bold font-display">Wishlist</p>
              </div>
            </Link>

            {/* Account Dropdown */}
            <div ref={userDropdownRef} className="relative">
              {mounted && isLoggedIn ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 hover:bg-accent rounded-xl transition group"
                  aria-label="User Account Menu"
                >
                  <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-[10px] font-bold uppercase shadow-sm">
                    {authUser?.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left leading-tight hidden lg:block max-w-[90px]">
                    <p className="text-[9px] text-muted-foreground font-medium truncate">
                      Hi, {authUser?.name.split(" ")[0]}
                    </p>
                    <p className="text-[11px] font-bold font-display flex items-center gap-0.5">
                      Account <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 hover:bg-accent rounded-xl transition group"
                  aria-label="Account Login Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-[9px] text-muted-foreground font-medium">Sign In</p>
                    <p className="text-[11px] font-bold font-display flex items-center gap-0.5">
                      Account <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                    </p>
                  </div>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 animate-fade-up">
                  {isLoggedIn ? (
                    <>
                      <div className="p-2.5 border-b border-border/80 bg-secondary/30 rounded-xl mb-1">
                        <p className="text-xs font-bold font-display text-foreground">{authUser?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{authUser?.email}</p>
                        <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {authUser?.role}
                        </span>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-accent transition"
                      >
                        <User className="w-3.5 h-3.5 text-primary" /> Profile & Orders
                      </Link>

                      {authUser?.role !== "Customer" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-accent transition text-primary"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-destructive/10 text-destructive transition mt-1 border-t border-border/60"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="p-2 space-y-2">
                      <div className="text-center pb-2 border-b border-border/60">
                        <p className="text-xs font-semibold">Welcome to Gadget & Gear</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Manage orders, wishlist & warranty</p>
                      </div>
                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full py-2 px-3 rounded-xl gradient-brand text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 shadow hover:opacity-90 transition"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full py-2 px-3 rounded-xl border border-border hover:bg-accent text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 rounded-2xl gradient-brand text-primary-foreground hover:opacity-95 transition-all shadow-md shadow-primary/20 relative group ${
                isScrolled ? "p-1.5 sm:px-2.5 sm:py-1.5" : "p-1.5 sm:px-3 sm:py-2"
              }`}
              aria-label="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-dark text-white border border-white/20 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-[9px] opacity-80 font-medium">Cart</p>
                <p className="text-xs font-bold font-display">
                  ৳{cartTotal.toLocaleString()}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-2.5 pt-1 border-t border-border/80 animate-fade-up">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                placeholder="Search phones, laptops, audio..."
                className="w-full pl-8 pr-16 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-1 px-2.5 py-1 rounded-lg gradient-brand text-primary-foreground text-xs font-semibold"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* 3. SLEEK SECONDARY CATEGORY NAVBAR (Smoothly hides on scroll, NO icons on category links) */}
        <div
          className={`hidden lg:block overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled
              ? "max-h-0 opacity-0 py-0 border-t-0 pointer-events-none"
              : "max-h-12 opacity-100 py-1 border-t border-border/60 bg-secondary/25"
          }`}
        >
          <div className="container-x flex items-center justify-between text-xs">
            {/* Left: Compact "All Categories" Button */}
            <div ref={megaMenuRef} className="relative py-0.5">
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                  megaMenuOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border/80 hover:border-primary/40 text-foreground"
                }`}
                aria-expanded={megaMenuOpen}
                aria-label="Browse all categories"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span>All Categories</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-[680px] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 grid grid-cols-3 gap-2 animate-fade-up">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group p-2.5 rounded-xl hover:bg-secondary/70 transition border border-transparent hover:border-border/60"
                    >
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition truncate">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.count}</p>
                      <p className="text-[9px] text-primary/80 truncate mt-0.5">
                        {c.popularBrands.slice(0, 3).join(" · ")}
                      </p>
                    </Link>
                  ))}

                  <div className="col-span-3 pt-2.5 mt-1 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-success" /> Genuine products with official warranty
                    </span>
                    <Link
                      href="/shop"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-primary font-medium text-[11px] hover:underline flex items-center gap-1"
                    >
                      Browse full collection <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Clean Text Category Navigation (NO ICONS, Compact & Sleek) */}
            <nav className="flex items-center gap-1 xl:gap-2">
              {QUICK_CATEGORIES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/shop?category=${item.slug}`}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition hover:text-primary hover:bg-accent/50 ${
                    pathname === "/shop" && searchCategory === item.slug
                      ? "text-primary font-semibold bg-accent/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: Promotional Deals Badges */}
            <div className="flex items-center gap-2 py-0.5">
              <Link
                href="/#flash"
                className="px-2.5 py-0.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold text-[11px] transition flex items-center gap-1 border border-destructive/20"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Flash Deals</span>
                <span className="px-1 py-0.2 rounded bg-destructive text-destructive-foreground text-[8px] uppercase font-bold">
                  HOT
                </span>
              </Link>

              <Link
                href="/shop?emi=true"
                className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium text-[11px] transition flex items-center gap-1 border border-primary/20"
              >
                <span>0% EMI</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="fixed inset-y-0 left-0 w-[290px] sm:w-[330px] bg-background border-r border-border shadow-2xl flex flex-col animate-slide-in-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-border">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <div className="relative h-8 w-[120px]">
                  <Image src="/logo.png" alt="Logo" width={256} height={151} className="w-full h-full object-contain object-left" />
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-accent text-foreground"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Account Box */}
              <div className="p-3 rounded-2xl bg-secondary/60 border border-border">
                {isLoggedIn ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-primary-foreground font-bold uppercase shadow text-xs">
                      {authUser?.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{authUser?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{authUser?.email}</p>
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[10px] text-primary font-medium hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        Account Dashboard <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold">Welcome Guest!</p>
                    <p className="text-[10px] text-muted-foreground">Sign in to track orders and save your wishlist.</p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1.5 text-center rounded-xl gradient-brand text-primary-foreground text-xs font-semibold shadow"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1.5 text-center rounded-xl border border-border text-xs font-semibold hover:bg-accent"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Action Tiles */}
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <Link
                  href="/#flash"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Flash Deals</span>
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-secondary border border-border flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Track Order</span>
                </Link>
              </div>

              {/* Category Directory (Clean Text List) */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Shop Categories
                </p>
                <div className="space-y-0.5">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary transition text-xs font-medium"
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {c.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Store Links */}
              <div className="pt-2 border-t border-border space-y-0.5 text-xs font-medium">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary"
                >
                  <span>All Products Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary"
                >
                  <span>Customer Support</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              </div>

              {/* Helpline info */}
              <div className="p-3 rounded-2xl bg-secondary/40 border border-border text-xs space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                  <PhoneCall className="w-3 h-3 text-primary" /> Need Help?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Hotline: <a href="tel:+8801677248045" className="text-primary font-bold">+880 1677-248045</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
