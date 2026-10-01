"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronRight, ChevronDown,
  ShieldCheck, LogIn, UserPlus, LogOut, Truck, Sparkles, Zap,
  LayoutGrid, ArrowRight, Star, Tag, MapPin, Smartphone, Laptop, Headphones,
  Watch, Monitor, Keyboard, Tablet, Volume2, Radio, Check, Mail, Phone, Clock, CornerDownLeft,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { CATEGORIES, PRODUCTS, BRANDS, OFFICIAL_BRANDS } from "@/lib/site-data";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { AnimatePresence, m } from "motion/react";
import { BrandLogo } from "@/components/BrandLogo";

interface AuthState {
  loggedIn: boolean;
  name: string;
  email: string;
  role: string;
}

type MenuKey = "categories" | "brands" | null;

const POPULAR_SEARCHES = [
  "iPhone 16 Pro",
  "Samsung Galaxy S24",
  "MacBook Pro M3",
  "Sony ANC Headphones",
  "Mechanical Keyboard",
  "Smartwatch AMOLED",
];

const DEFAULT_QUICK_LINKS = [
  { label: "Smartphones", href: "/shop?category=smartphones" },
  { label: "Laptops", href: "/shop?category=laptops" },
  { label: "Earbuds & Audio", href: "/shop?category=earbuds" },
  { label: "Smart Watches", href: "/shop?category=smartwatches" },
  { label: "Monitors", href: "/shop?category=monitors" },
  { label: "Keyboards", href: "/shop?category=keyboards" },
  { label: "Accessories", href: "/shop?category=accessories" },
];

const DEFAULT_ANNOUNCEMENTS = [
  "Flash deals up to 40% off, today only",
  "Free delivery inside Dhaka over ৳3,000",
  "0% EMI up to 24 months",
];

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  smartphones: Smartphone,
  laptops: Laptop,
  earbuds: Headphones,
  smartwatches: Watch,
  headphones: Headphones,
  monitors: Monitor,
  keyboards: Keyboard,
  tablets: Tablet,
  speakers: Volume2,
  drones: Radio,
  power: Zap,
  accessories: Tag,
};

const SHADOW = "shadow-[0_8px_30px_-12px_rgb(0_0_0/0.14)]";

// Motion presets: quick ease-out for things that pop open, springs for things that slide.
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const POP = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } },
  transition: { duration: 0.2, ease: EASE_OUT },
};
const BAR_SPRING = { type: "spring", stiffness: 420, damping: 40, mass: 0.8 } as const;
const DRAWER_SPRING = { type: "spring", stiffness: 380, damping: 38 } as const;
const RECENT_KEY = "gh_recent_searches";
const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_DELAY = 200;

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [mobileNavTab, setMobileNavTab] = useState<"categories" | "brands">("categories");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [highlight, setHighlight] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [currentHref, setCurrentHref] = useState("");
  const [liveBrands, setLiveBrands] = useState<Array<{ _id?: string; name: string; slug: string; logo?: string; isActive?: boolean }>>(() =>
    OFFICIAL_BRANDS.map((b) => ({ name: b.name, slug: b.slug, logo: b.logo, isActive: true }))
  );

  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, cartTotal, wishlist, setIsCartOpen, setIsSearchOpen } = useCart();
  const settings = useStoreSettings();
  const [authUser, setAuthUser] = useState<AuthState | null>(null);
  const [mounted, setMounted] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(69);

  // The category bar sticks right under the header, so track the header's real height.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announcements = settings?.header?.announcements?.filter(Boolean).length
    ? settings.header.announcements.filter(Boolean)
    : DEFAULT_ANNOUNCEMENTS;
  const quickLinks = settings?.header?.quickLinks?.filter((l) => l.label && l.href).length
    ? settings.header.quickLinks.filter((l) => l.label && l.href)
    : DEFAULT_QUICK_LINKS;
  const showTopBar = settings?.header?.showTopBar ?? true;
  const showPromoBadges = settings?.header?.showPromoBadges ?? true;
  const contactEmail = settings?.contact?.email || "gadgetandgear.bd01@gmail.com";
  const contactAddress = settings?.contact?.address || "Mirpur 2, Dhaka";
  const contactPhone = settings?.contact?.phone;
  const logoSrc = settings?.branding?.logo || "/logo.png";

  // Sync with MongoDB brands database
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const active = data.filter((b) => b.isActive !== false);
          if (active.length > 0) setLiveBrands(active);
        }
      })
      .catch(() => {});
  }, []);

  // Scroll: shadow once scrolled, and tuck the category bar away while scrolling down.
  // Nothing here changes the header's height, so the page never shifts under the reader
  // (a height change near the threshold made the browser re-anchor the scroll and blink).
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      // Hysteresis: different on/off points so small wobbles can't flip the state.
      setIsScrolled((prev) => (prev ? y > 4 : y > 24));
      const delta = y - lastY;
      if (y < 200) {
        setNavHidden(false);
        lastY = y;
      } else if (delta > 16) {
        setNavHidden(true);
        lastY = y;
      } else if (delta < -16) {
        setNavHidden(false);
        lastY = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rotate announcements, pausing for reduced motion.
  useEffect(() => {
    if (announcements.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setAnnouncementIndex((i) => (i + 1) % announcements.length), 4500);
    return () => clearInterval(id);
  }, [announcements.length]);

  // Load auth user and recent searches
  useEffect(() => {
    setMounted(true);
    setRecent(readRecent());
    setCurrentHref(window.location.pathname + window.location.search);
    try {
      const stored = localStorage.getItem("gh_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthUser(parsed.loggedIn ? parsed : null);
      }
    } catch {}
  }, [pathname]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
    setUserDropdownOpen(false);
    setSearchFocused(false);
  }, [pathname]);

  // Click outside + Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(t)) setSearchFocused(false);
      if (navRef.current && !navRef.current.contains(t)) setOpenMenu(null);
      if (userDropdownRef.current && !userDropdownRef.current.contains(t)) setUserDropdownOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setUserDropdownOpen(false);
        setSearchFocused(false);
        setMobileMenuOpen(false);
      }
      // "/" jumps to search, like most stores and docs sites.
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select, [contenteditable=true]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) searchInputRef.current?.focus();
        else setIsSearchOpen(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [setIsSearchOpen]);

  // Lock page scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Hover intent for the mega menus: small delays stop flicker when the pointer passes over.
  const hoverOpen = (key: MenuKey) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(key), openMenu ? 0 : HOVER_OPEN_DELAY);
  };
  const hoverClose = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(null), HOVER_CLOSE_DELAY);
  };
  const keepOpen = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  // Mouse clicks open (hover may already have); keyboard Enter/Space (detail 0) toggles.
  const onTriggerClick = (key: Exclude<MenuKey, null>, e: React.MouseEvent) => {
    keepOpen();
    if (e.detail === 0) setOpenMenu(openMenu === key ? null : key);
    else setOpenMenu(key);
  };

  const handleLogout = () => {
    localStorage.removeItem("gh_auth");
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAuthUser(null);
    setUserDropdownOpen(false);
    router.push("/login");
  };

  const rememberSearch = (term: string) => {
    const next = [term, ...readRecent().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    setRecent(next);
  };

  const goSearch = useCallback(
    (term: string) => {
      const q = term.trim();
      const params = new URLSearchParams();
      if (q) {
        params.set("q", q);
        rememberSearch(q);
      }
      if (searchCategory !== "all") params.set("category", searchCategory);
      setSearchFocused(false);
      searchInputRef.current?.blur();
      router.push(params.toString() ? `/shop?${params}` : "/shop");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchCategory, router]
  );

  // Live search results
  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return PRODUCTS.filter((p) => {
      const matchesCat = searchCategory === "all" || p.category === searchCategory;
      const matchesText = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchesCat && matchesText;
    }).slice(0, 6);
  }, [searchQuery, searchCategory]);

  // What arrow keys move through: products when typing, otherwise recent + popular terms.
  const suggestionTerms = useMemo(
    () => (searchQuery.trim() ? [] : [...recent, ...POPULAR_SEARCHES.filter((p) => !recent.includes(p))].slice(0, 8)),
    [searchQuery, recent]
  );
  const navigableCount = searchQuery.trim() ? liveSearchResults.length : suggestionTerms.length;

  useEffect(() => setHighlight(-1), [searchQuery, searchFocused]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchFocused(true);
      setHighlight((h) => (h + 1) % Math.max(1, navigableCount));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? navigableCount - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      if (searchQuery.trim()) {
        const p = liveSearchResults[highlight];
        if (p) {
          rememberSearch(searchQuery.trim());
          setSearchFocused(false);
          router.push(`/product/${p.slug}`);
        }
      } else {
        const term = suggestionTerms[highlight];
        setSearchQuery(term);
        goSearch(term);
      }
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const isLoggedIn = mounted && authUser?.loggedIn;
  // An open mega menu keeps the bar in place even mid-scroll.
  const barHidden = navHidden && !openMenu;
  const isLinkActive = (href: string) => currentHref === href || (href !== "/" && currentHref.startsWith(href + "&"));

  return (
    <>
      {/* 1. TOP BAR (scrolls away) */}
      {showTopBar && (
        <div className="bg-brand-dark text-primary-foreground border-b border-white/10 text-[11px] select-none relative z-50">
          <div className="container-x flex items-center justify-between h-8 gap-4">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden" aria-live="off">
              <span className="inline-flex items-center gap-1 font-semibold text-warning px-1.5 py-0.5 rounded bg-warning/15 text-[10px] shrink-0">
                <Zap className="w-2.5 h-2.5 fill-current" /> Live deal
              </span>
              <span className="relative flex-1 min-w-0 h-4 overflow-hidden">
                <AnimatePresence initial={false}>
                  <m.span
                    key={announcementIndex}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="absolute inset-0 truncate leading-4 text-white/80"
                  >
                    {announcements[announcementIndex % announcements.length]}
                  </m.span>
                </AnimatePresence>
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-white/70">
              {contactPhone && (
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition">
                  <Phone className="w-3 h-3 text-primary" /> {contactPhone}
                </a>
              )}
              <a href={`mailto:${contactEmail}`} className="hidden lg:inline-flex items-center gap-1.5 hover:text-white transition">
                <Mail className="w-3 h-3 text-primary" /> {contactEmail}
              </a>
              <Link href="/contact" className="hidden xl:inline-flex items-center gap-1 hover:text-white transition">
                <MapPin className="w-3 h-3 text-primary" /> {contactAddress}
              </Link>
              <Link href="/account" className="inline-flex items-center gap-1 hover:text-white transition">
                <Truck className="w-3 h-3 text-primary" /> Track order
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. STICKY MAIN HEADER: fixed height, only the shadow reacts to scroll */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md transition-shadow duration-300 ${
          isScrolled ? (barHidden ? SHADOW : `${SHADOW} lg:shadow-none`) : ""
        }`}
      >
        <div className="container-x flex items-center justify-between gap-3 md:gap-6 py-2.5 sm:py-3">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              className="lg:hidden p-2 hover:bg-accent rounded-xl text-foreground transition -ml-1.5"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center group" aria-label="Gadget & Gear home">
              <div className="relative flex items-center shrink-0 w-[130px] sm:w-[160px] lg:w-[180px] h-10 sm:h-11">
                {logoSrc.startsWith("/") ? (
                  <Image src={logoSrc} alt="Gadget & Gear" width={256} height={151} className="w-full h-full object-contain object-left" priority />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={logoSrc} alt="Gadget & Gear" className="w-full h-full object-contain object-left" />
                )}
              </div>
            </Link>
          </div>

          {/* Center: Search */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl relative">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                goSearch(searchQuery);
              }}
              className={`flex items-center w-full rounded-2xl border transition-[border-color,box-shadow] duration-200 bg-background overflow-hidden ${
                searchFocused ? "border-primary ring-4 ring-primary/10 shadow-md" : "border-border/80 hover:border-primary/40 shadow-sm"
              }`}
            >
              <div className="relative border-r border-border/80 bg-secondary/40 shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-10 pl-3 pr-7 text-xs font-medium bg-transparent cursor-pointer focus:outline-none appearance-none text-foreground max-w-[140px]"
                  aria-label="Search in category"
                >
                  <option value="all">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>

              <div className="relative flex-1 flex items-center">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search phones, laptops, earbuds, brands"
                  className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground text-foreground [&::-webkit-search-cancel-button]:hidden"
                  role="combobox"
                  aria-expanded={searchFocused}
                  aria-controls="header-search-results"
                  aria-activedescendant={highlight >= 0 ? `hs-opt-${highlight}` : undefined}
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 mr-1.5 text-muted-foreground hover:text-foreground rounded-full"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex mr-2 px-1.5 py-0.5 rounded-md border border-border text-[10px] text-muted-foreground font-sans" title="Press / to search">/</kbd>
                )}
              </div>

              <button type="submit" className="h-10 px-4 gradient-brand text-primary-foreground font-medium text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition shrink-0" aria-label="Search">
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </button>
            </form>

            {/* Suggestions */}
            <AnimatePresence>
            {searchFocused && (
              <m.div key="search" {...POP} id="header-search-results" role="listbox" className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl p-3 z-50 max-h-[440px] overflow-y-auto scrollbar-thin origin-top">
                {searchQuery.trim() === "" ? (
                  <div>
                    {recent.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between px-1 mb-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">Recent</span>
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.removeItem(RECENT_KEY);
                              setRecent([]);
                            }}
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                        {recent.map((term, i) => (
                          <button
                            key={term}
                            id={`hs-opt-${i}`}
                            role="option"
                            aria-selected={highlight === i}
                            type="button"
                            onMouseEnter={() => setHighlight(i)}
                            onClick={() => {
                              setSearchQuery(term);
                              goSearch(term);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-left transition-colors ${highlight === i ? "bg-accent" : ""}`}
                          >
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {term}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1 mb-2">
                      <Sparkles className="w-3 h-3 text-primary" /> Popular right now
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {POPULAR_SEARCHES.filter((p) => !recent.includes(p)).map((term) => {
                        const i = suggestionTerms.indexOf(term);
                        return (
                          <button
                            key={term}
                            id={i >= 0 ? `hs-opt-${i}` : undefined}
                            role="option"
                            aria-selected={highlight === i}
                            type="button"
                            onMouseEnter={() => i >= 0 && setHighlight(i)}
                            onClick={() => {
                              setSearchQuery(term);
                              goSearch(term);
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs border transition-colors font-medium ${highlight === i && i >= 0 ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary border-border/80 hover:bg-primary/10 hover:text-primary"}`}
                          >
                            {term}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-3 gap-2">
                      <Link href="/shop?tag=Flash+Deal" onClick={() => setSearchFocused(false)} className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/15 transition flex items-center gap-1.5 text-destructive font-medium text-xs">
                        <Zap className="w-3.5 h-3.5" /> Flash deals
                      </Link>
                      <Link href="/shop?tag=Bestseller" onClick={() => setSearchFocused(false)} className="p-2 rounded-xl bg-warning/10 hover:bg-warning/15 transition flex items-center gap-1.5 text-warning font-medium text-xs">
                        <Star className="w-3.5 h-3.5" /> Bestsellers
                      </Link>
                      <Link href="/shop?tag=New" onClick={() => setSearchFocused(false)} className="p-2 rounded-xl bg-primary/10 hover:bg-primary/15 transition flex items-center gap-1.5 text-primary font-medium text-xs">
                        <Tag className="w-3.5 h-3.5" /> New arrivals
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    {liveSearchResults.length > 0 ? (
                      <div className="space-y-0.5">
                        {liveSearchResults.map((p, i) => (
                          <Link
                            key={p.slug}
                            id={`hs-opt-${i}`}
                            role="option"
                            aria-selected={highlight === i}
                            href={`/product/${p.slug}`}
                            onMouseEnter={() => setHighlight(i)}
                            onClick={() => {
                              rememberSearch(searchQuery.trim());
                              setSearchFocused(false);
                            }}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-colors group ${highlight === i ? "bg-accent" : "hover:bg-accent/60"}`}
                          >
                            <div className="w-11 h-11 rounded-lg bg-secondary border border-border overflow-hidden shrink-0 relative">
                              <Image src={p.img} alt="" fill sizes="44px" className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-muted-foreground font-medium">{p.brand}</p>
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold font-display tabular-nums">৳{p.price.toLocaleString()}</p>
                              {p.was && <p className="text-[10px] text-muted-foreground line-through tabular-nums">৳{p.was.toLocaleString()}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No quick matches. Press Enter to search the whole catalog.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => goSearch(searchQuery)}
                      className="mt-2 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary text-sm transition"
                    >
                      <span>
                        See all results for <span className="font-semibold">“{searchQuery.trim()}”</span>
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </m.div>
            )}
            </AnimatePresence>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 text-foreground hover:bg-accent rounded-xl transition" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>

            <Link href="/wishlist" className="hidden sm:flex p-2 sm:px-2 sm:py-1.5 hover:bg-accent rounded-xl transition group relative items-center gap-1.5" aria-label={`Wishlist, ${wishlist.length} items`}>
              <div className="relative">
                <Heart className="w-[18px] h-[18px] text-foreground group-hover:text-primary transition-colors" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 gradient-brand text-primary-foreground text-[9px] font-bold rounded-full min-w-3.5 h-3.5 px-0.5 flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <p className="text-[10px] text-muted-foreground">Saved</p>
                <p className="text-xs font-bold font-display">Wishlist</p>
              </div>
            </Link>

            {/* Account */}
            <div ref={userDropdownRef} className="relative hidden sm:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 hover:bg-accent rounded-xl transition group"
                aria-label="Account menu"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
              >
                {isLoggedIn ? (
                  <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-[11px] font-bold uppercase shadow-sm">
                    {authUser?.name?.charAt(0) || "U"}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="text-left leading-tight hidden lg:block max-w-[96px]">
                  <p className="text-[10px] text-muted-foreground truncate">{isLoggedIn ? `Hi, ${authUser?.name.split(" ")[0]}` : "Sign in"}</p>
                  <p className="text-xs font-bold font-display flex items-center gap-0.5">
                    Account <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </p>
                </div>
              </button>

              <AnimatePresence>
              {userDropdownOpen && (
                <m.div key="account" {...POP} role="menu" className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 origin-top-right">
                  {isLoggedIn ? (
                    <>
                      <div className="p-2.5 bg-secondary/40 rounded-xl mb-1">
                        <p className="text-sm font-bold font-display text-foreground truncate">{authUser?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{authUser?.email}</p>
                      </div>
                      <Link role="menuitem" href="/account" className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-accent transition-colors">
                        <User className="w-4 h-4 text-primary" /> Profile & orders
                      </Link>
                      <Link role="menuitem" href="/wishlist" className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-accent transition-colors">
                        <Heart className="w-4 h-4 text-primary" /> Wishlist
                      </Link>
                      {authUser?.role !== "Customer" && (
                        <Link role="menuitem" href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-accent transition-colors text-primary">
                          <ShieldCheck className="w-4 h-4" /> Admin panel
                        </Link>
                      )}
                      <button role="menuitem" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-destructive/10 text-destructive transition-colors mt-1">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <div className="p-1.5 space-y-2">
                      <p className="text-sm font-semibold px-1">Welcome to Gadget & Gear</p>
                      <p className="text-xs text-muted-foreground px-1 -mt-1">Track orders, save favourites and check warranty.</p>
                      <Link role="menuitem" href="/login" className="w-full py-2 px-3 rounded-xl gradient-brand text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 shadow hover:opacity-90 transition">
                        <LogIn className="w-4 h-4" /> Sign in
                      </Link>
                      <Link role="menuitem" href="/signup" className="w-full py-2 px-3 rounded-xl border border-border hover:bg-accent text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                        <UserPlus className="w-4 h-4" /> Create account
                      </Link>
                    </div>
                  )}
                </m.div>
              )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 rounded-2xl gradient-brand text-primary-foreground hover:opacity-95 active:scale-[0.97] transition shadow-md shadow-primary/20 relative group p-2 sm:px-3 sm:py-2"
              aria-label={`Cart, ${itemCount} items, ৳${cartTotal.toLocaleString()}`}
            >
              <div className="relative">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span key={itemCount} className="absolute -top-1.5 -right-1.5 bg-brand-dark text-white border border-white/20 text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center shadow animate-in zoom-in-50 duration-200">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-[10px] opacity-80">Cart</p>
                <p className="text-xs font-bold font-display tabular-nums">৳{cartTotal.toLocaleString()}</p>
              </div>
            </button>
          </div>
        </div>

      </header>

      {/* 3. CATEGORY BAR: its own sticky strip under the header. Hiding slides it behind the
          header with a transform only, so its space in the page never changes. */}
      <div className="hidden lg:block sticky z-30" style={{ top: headerHeight }}>
        <m.div
          inert={barHidden || undefined}
          initial={false}
          animate={{ y: barHidden ? "-100%" : "0%", opacity: barHidden ? 0 : 1 }}
          transition={BAR_SPRING}
          className={`bg-background/95 backdrop-blur-md border-b border-border/60 transition-shadow duration-300 ${barHidden ? "pointer-events-none" : ""} ${
            isScrolled && !barHidden ? SHADOW : ""
          }`}
        >
          <div className="bg-secondary/20">
              <div ref={navRef} className="container-x flex items-center justify-between text-xs py-1.5 relative">
                <div className="flex items-center gap-1 xl:gap-2 min-w-0">
                  {/* Categories */}
                  <div onMouseEnter={() => hoverOpen("categories")} onMouseLeave={hoverClose}>
                    <button
                      onClick={(e) => onTriggerClick("categories", e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        openMenu === "categories" ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/80 hover:border-primary/40 text-foreground"
                      }`}
                      aria-expanded={openMenu === "categories"}
                      aria-controls="mega-categories"
                    >
                      <LayoutGrid className={`w-3.5 h-3.5 ${openMenu === "categories" ? "" : "text-primary"}`} />
                      All categories
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openMenu === "categories" ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Brands */}
                  <div onMouseEnter={() => hoverOpen("brands")} onMouseLeave={hoverClose}>
                    <button
                      onClick={(e) => onTriggerClick("brands", e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        openMenu === "brands" ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/80 hover:border-primary/40 text-foreground"
                      }`}
                      aria-expanded={openMenu === "brands"}
                      aria-controls="mega-brands"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${openMenu === "brands" ? "" : "text-warning"}`} />
                      Brands
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openMenu === "brands" ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <span className="w-px h-4 bg-border mx-1" aria-hidden />

                  <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-none" aria-label="Shop by category">
                    {quickLinks.map((item) => {
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setCurrentHref(item.href)}
                          aria-current={active ? "page" : undefined}
                          className={`relative px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                            active ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          }`}
                        >
                          {item.label}
                          {active && (
                            <m.span
                              layoutId="quicklink-underline"
                              transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              className="absolute left-2.5 right-2.5 -bottom-1.5 h-0.5 rounded-full bg-primary"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {showPromoBadges && (
                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    <Link href="/#flash" className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/15 font-semibold text-xs transition-colors flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> Flash deals
                    </Link>
                    <Link href="/shop?emi=true" className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 font-medium text-xs transition-colors">
                      0% EMI
                    </Link>
                  </div>
                )}

                {/* Categories mega menu */}
                <AnimatePresence>
                {openMenu === "categories" && (
                  <m.div
                    key="mega-categories"
                    {...POP}
                    id="mega-categories"
                    onMouseEnter={keepOpen}
                    onMouseLeave={hoverClose}
                    className="absolute top-full left-5 mt-1 w-[720px] max-w-[calc(100vw-2.5rem)] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 origin-top"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
                      <div>
                        <h4 className="font-display font-bold text-sm">Shop by category</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{CATEGORIES.length} categories, all with official Bangladesh warranty</p>
                      </div>
                      <Link href="/shop" onClick={() => setOpenMenu(null)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        All products <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                      {CATEGORIES.map((c) => {
                        const IconComp = CATEGORY_ICON_MAP[c.slug] || LayoutGrid;
                        return (
                          <Link
                            key={c.slug}
                            href={`/shop?category=${c.slug}`}
                            onClick={() => {
                              setOpenMenu(null);
                              setCurrentHref(`/shop?category=${c.slug}`);
                            }}
                            className="group p-2.5 rounded-xl hover:bg-secondary/70 transition-colors flex items-start gap-2.5"
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{c.name}</p>
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{c.count.replace(" models", "")}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{c.popularBrands.slice(0, 3).join(", ")}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs bg-secondary/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-success" /> Official warranty and 0% EMI on every model
                      </span>
                    </div>
                  </m.div>
                )}

                {/* Brands mega menu */}
                {openMenu === "brands" && (
                  <m.div
                    key="mega-brands"
                    {...POP}
                    id="mega-brands"
                    onMouseEnter={keepOpen}
                    onMouseLeave={hoverClose}
                    className="absolute top-full left-5 xl:left-40 mt-1 w-[600px] max-w-[calc(100vw-2.5rem)] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 origin-top"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
                      <div>
                        <h4 className="font-display font-bold text-sm">Official partner brands</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Original devices from authorised distributors</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                      {liveBrands.map((brand) => {
                        return (
                          <Link
                            key={brand.slug || brand.name}
                            href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                            onClick={() => setOpenMenu(null)}
                            className="p-3 rounded-xl bg-secondary/35 hover:bg-primary/10 border border-border/60 hover:border-primary/40 transition-colors group flex flex-col items-center justify-center text-center"
                          >
                            <div className="h-9 w-full flex items-center justify-center text-foreground/70 group-hover:text-foreground">
                              <BrandLogo name={brand.name} stored={brand.logo} colorOnHover className="h-6 w-20" />
                            </div>
                            <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors mt-1.5 truncate max-w-full">{brand.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="pt-3 mt-3 border-t border-border flex items-center text-xs bg-secondary/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary" /> 100% genuine products with brand warranty
                      </span>
                    </div>
                  </m.div>
                )}
                </AnimatePresence>
              </div>
          </div>
        </m.div>
      </div>

      {/* 4. MOBILE DRAWER */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <m.div key="drawer" initial="closed" animate="open" exit="closed" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <m.div
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <m.div
            variants={{ open: { x: "0%" }, closed: { x: "-100%" } }}
            transition={DRAWER_SPRING}
            className="absolute inset-y-0 left-0 w-[300px] sm:w-[340px] max-w-[85vw] bg-background border-r border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-border">
              <Link href="/" className="flex items-center">
                <div className="relative h-8 w-[120px]">
                  {logoSrc.startsWith("/") ? (
                    <Image src={logoSrc} alt="Gadget & Gear" width={256} height={151} className="w-full h-full object-contain object-left" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logoSrc} alt="Gadget & Gear" className="w-full h-full object-contain object-left" />
                  )}
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-accent text-foreground" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-secondary/40 text-sm text-muted-foreground"
              >
                <Search className="w-4 h-4" /> Search products
              </button>

              <div className="p-3 rounded-2xl bg-secondary/60 border border-border">
                {isLoggedIn ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-primary-foreground font-bold uppercase shadow text-sm">
                      {authUser?.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{authUser?.name}</p>
                      <Link href="/account" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-0.5">
                        Your account <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Welcome</p>
                    <p className="text-xs text-muted-foreground">Sign in to track orders and keep your wishlist.</p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <Link href="/login" className="py-2 text-center rounded-xl gradient-brand text-primary-foreground text-sm font-semibold shadow">Sign in</Link>
                      <Link href="/signup" className="py-2 text-center rounded-xl border border-border text-sm font-semibold hover:bg-accent">Register</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                <Link href="/#flash" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Flash deals
                </Link>
                <Link href="/account" className="p-2.5 rounded-xl bg-secondary border border-border flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary" /> Track order
                </Link>
              </div>

              <div>
                <div className="flex items-center p-1 bg-secondary/80 rounded-xl border border-border text-sm mb-3" role="tablist">
                  {(["categories", "brands"] as const).map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={mobileNavTab === tab}
                      onClick={() => setMobileNavTab(tab)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${mobileNavTab === tab ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                    >
                      {tab === "categories" ? `Categories (${CATEGORIES.length})` : `Brands (${liveBrands.length || BRANDS.length})`}
                    </button>
                  ))}
                </div>

                {mobileNavTab === "categories" ? (
                  <div className="space-y-0.5">
                    {CATEGORIES.map((c) => {
                      const IconComp = CATEGORY_ICON_MAP[c.slug] || LayoutGrid;
                      return (
                        <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary active:bg-secondary transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{c.name}</p>
                              <p className="text-[11px] text-muted-foreground">{c.popularBrands.slice(0, 3).join(", ")}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {liveBrands.map((b) => {
                      return (
                        <Link key={b._id || b.name} href={`/shop?brand=${encodeURIComponent(b.name)}`} onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-secondary/50 hover:bg-primary/10 border border-border/70 flex items-center gap-2.5 transition-colors">
                          <span className="w-12 h-8 rounded-lg bg-background border border-border/70 flex items-center justify-center px-1.5 shrink-0 text-foreground/80">
                            <BrandLogo name={b.name} stored={b.logo} className="h-4 w-full" />
                          </span>
                          <span className="font-semibold text-sm text-foreground truncate">{b.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border space-y-0.5 text-sm font-medium">
                {[
                  { href: "/shop", label: "All products" },
                  { href: "/about", label: "About us" },
                  { href: "/contact", label: "Customer support" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary">
                    {l.label}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-border text-sm space-y-1.5">
                <p className="font-semibold text-foreground">Need help?</p>
                {contactPhone && (
                  <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {contactPhone}
                  </a>
                )}
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-1.5 text-muted-foreground break-all">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> {contactEmail}
                </a>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {contactAddress}
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      </AnimatePresence>
    </>
  );
}
