"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Truck, ShieldCheck, CreditCard, Headphones,
  Star, Zap, Sparkles, Cpu, Gamepad2, Smartphone, Laptop, Watch,
} from "lucide-react";
import heroPhone from "@/assets/gh-hero.jpg";
import { CATEGORIES, PRODUCTS, BRANDS } from "@/lib/site-data";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const flash = PRODUCTS.filter((p) => p.tag === "Flash Deal");
  const bestsellers = PRODUCTS.filter((p) => p.tag === "Bestseller").slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.tag === "New" || p.tag === "Pre-order").slice(0, 4);
  const trending = PRODUCTS.slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,oklch(0.85_0.08_250/.6),transparent_55%),radial-gradient(circle_at_80%_60%,oklch(0.88_0.09_260/.5),transparent_50%)]" />
        <div className="container-x grid lg:grid-cols-2 gap-10 lg:gap-16 py-14 lg:py-24 items-center">
          <div className="animate-fade-up order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary font-medium">
              <Sparkles className="w-3.5 h-3.5" /> New Season · 2026 Line-up
            </span>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.02] mt-5">
              Tech that <span className="text-gradient-brand">just works.</span>
            </h1>
            <p className="mt-6 text-muted-foreground max-w-md text-base sm:text-lg">
              Bangladesh&apos;s premium destination for smartphones, laptops and smart devices — with official warranty, EMI up to 24 months and nationwide delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
                Shop the collection <ChevronRight className="w-4 h-4" />
              </Link>
              <a href="#flash" className="inline-flex items-center gap-2 border border-border bg-background/60 backdrop-blur px-7 py-3.5 rounded-full text-sm font-medium hover:bg-accent transition">
                <Zap className="w-4 h-4 text-primary" /> Flash deals
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "500+", v: "Products" },
                { k: "50K+", v: "Happy customers" },
                { k: "4.9★", v: "Rated service" },
              ].map((s) => (
                <div key={s.v}>
                  <p className="font-display font-bold text-2xl text-gradient-brand">{s.k}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative order-1 lg:order-2 animate-fade-up">
            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl opacity-70 animate-pulse-glow" />
            <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full bg-accent blur-3xl opacity-60 animate-pulse-glow" />
            
            {/* Top Floating Badge */}
            <div className="absolute -top-4 -right-2 sm:-right-4 z-20 glass px-4 py-2.5 rounded-2xl border border-border shadow-xl flex items-center gap-2.5 animate-float">
              <span className="w-8 h-8 rounded-xl gradient-brand text-primary-foreground flex items-center justify-center text-xs font-bold shadow">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">0% EMI</p>
                <p className="font-display font-bold text-xs">Up to 24 Months</p>
              </div>
            </div>

            {/* Bottom Left Floating Badge */}
            <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 glass px-4 py-2.5 rounded-2xl border border-border shadow-xl hidden sm:flex items-center gap-2.5 animate-float" style={{ animationDelay: "2s" }}>
              <span className="w-8 h-8 rounded-xl bg-success/20 text-success flex items-center justify-center text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Genuine Tech</p>
                <p className="font-display font-bold text-xs">Official BD Warranty</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/25 border border-border/80 group">
              <Image
                src={heroPhone}
                alt="Premium flagship gadget ecosystem"
                width={1600}
                height={1200}
                className="w-full h-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 glass px-5 py-4 rounded-2xl flex items-center justify-between border border-white/15">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Featured Ecosystem</p>
                  <p className="font-display font-bold text-base sm:text-lg">2026 Flagship Line-up</p>
                </div>
                <Link
                  href="/shop"
                  className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground font-medium text-xs shadow-md shadow-primary/20 hover:opacity-90 transition flex items-center gap-1"
                >
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
          {[
            { icon: ShieldCheck, t: "Official Warranty", s: "1–3 years on flagships" },
            { icon: Truck,       t: "Nationwide Delivery", s: "Pathao · RedX · Steadfast" },
            { icon: CreditCard,  t: "EMI up to 24 months", s: "0% on selected banks" },
            { icon: Headphones,  t: "Expert Support", s: "Chat with a real human" },
          ].map((v) => (
            <div key={v.t} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-primary-foreground shrink-0">
                <v.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{v.t}</p>
                <p className="text-xs text-muted-foreground">{v.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FLASH DEALS */}
      <section id="flash" className="container-x py-16 lg:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-destructive font-medium">
              <Zap className="w-3.5 h-3.5" /> Flash deals — today only
            </p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">Save big before it&apos;s gone</h2>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm hover:text-primary">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {flash.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="container-x pb-8 lg:pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Shop by category</p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">Explore every device</h2>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm hover:text-primary">
            All categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5">
          {CATEGORIES.map((c) => (
            <Link href={`/shop?category=${c.slug}`} key={c.slug} className="group relative overflow-hidden rounded-2xl bg-secondary border border-border hover:shadow-lg hover:shadow-primary/10 transition">
              <Image src={c.img} alt={c.name} width={800} height={800} loading="lazy" className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-primary-foreground">
                <p className="font-display font-semibold">{c.name}</p>
                <p className="text-[10px] opacity-80">{c.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-x pb-8 lg:pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Bestsellers</p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">Loved across Bangladesh</h2>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm hover:text-primary">
            Shop all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {bestsellers.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* COLLECTIONS BANNER */}
      <section className="container-x py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Smartphone, t: "Smartphone Collection", s: "Flagships to budget picks", grad: "from-primary to-secondary", href: "/shop?category=smartphones" },
            { icon: Laptop,     t: "Laptop Collection",     s: "Work · Study · Creator",   grad: "from-secondary to-accent", href: "/shop?category=laptops" },
            { icon: Gamepad2,   t: "Gaming Zone",           s: "Consoles · Rigs · Gear",   grad: "from-brand-dark to-primary", href: "/shop?category=monitors" },
          ].map((c) => (
            <Link key={c.t} href={c.href} className={`group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${c.grad} text-primary-foreground min-h-[220px] flex flex-col justify-between`}>
              <c.icon className="w-8 h-8 opacity-90" />
              <div>
                <p className="font-display font-bold text-2xl">{c.t}</p>
                <p className="text-sm opacity-80 mt-1">{c.s}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm">Shop now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" /></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS + PRE-ORDER */}
      <section className="container-x pb-8 lg:pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Just landed</p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">New arrivals & pre-orders</h2>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm hover:text-primary">
            Shop all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {newArrivals.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* BRANDS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-x py-14">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Featured brands</p>
            <h2 className="font-display font-bold text-3xl lg:text-4xl mt-2">Only the brands you trust</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
            {BRANDS.map((b) => (
              <span key={b} className="px-5 py-2.5 rounded-full glass text-sm font-display font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="container-x py-16 lg:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary font-medium">
              <Cpu className="w-3.5 h-3.5" /> Trending now
            </p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">What Bangladesh is buying</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {trending.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="border-t border-border bg-secondary/40">
        <div className="container-x py-16 lg:py-24">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Customer reviews</p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">Rated 4.9 across 8,000+ reviews</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "Tanvir A.", c: "Dhaka",       t: "Ordered a laptop at 10pm, delivered next day with official warranty card. Gadget & Gear is my go-to." },
              { n: "Sadia K.",  c: "Chattogram",  t: "The EMI process was so smooth. Got my dream phone without any hassle." },
              { n: "Rakib M.",  c: "Sylhet",      t: "Genuine products, real reviews, honest prices. Finally a tech store I trust." },
            ].map((r) => (
              <div key={r.n} className="bg-card p-7 rounded-2xl border border-border hover:shadow-lg hover:shadow-primary/5 transition">
                <div className="flex gap-0.5 text-warning mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed">&ldquo;{r.t}&rdquo;</p>
                <p className="mt-5 text-xs text-muted-foreground">— {r.n}, {r.c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-x py-16 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl gradient-brand p-10 lg:p-16 text-primary-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(1_0_0/.15),transparent_60%)]" />
          <div className="relative max-w-2xl">
            <p className="text-xs tracking-[0.2em] uppercase opacity-90"><Watch className="inline w-3.5 h-3.5 mr-1" /> Stay ahead</p>
            <h2 className="font-display font-bold text-3xl lg:text-5xl mt-3">Early access to launches & deals</h2>
            <p className="mt-4 opacity-90">Get flash deal alerts, pre-order windows and exclusive drops straight to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md">
              <input type="email" required placeholder="Your email address" className="flex-1 px-5 py-3.5 rounded-full bg-background/95 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/60" />
              <button className="px-7 py-3.5 rounded-full bg-brand-dark text-primary-foreground text-sm font-medium hover:opacity-90">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pb-16 lg:pb-24">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Common questions</p>
          <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">Everything you want to know</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: "Are your products officially warranted?", a: "Yes — flagship products carry 1 to 3 years of official brand warranty. Warranty details are listed on every product page." },
            { q: "Is EMI available?", a: "Yes, EMI is available from 3 to 24 months on selected credit cards, including 0% EMI options on featured partner banks." },
            { q: "How fast is delivery?", a: "Inside Dhaka: same day or next day. Outside Dhaka: 1–3 business days via Pathao, RedX, Steadfast or Sundarban Courier." },
            { q: "Which payment methods do you accept?", a: "bKash, Nagad, Rocket, SSLCommerz cards, ShurjoPay, aamarPay and Cash on Delivery nationwide." },
          ].map((f) => (
            <details key={f.q} className="group bg-card border border-border rounded-2xl p-5 open:shadow-lg open:shadow-primary/5 transition">
              <summary className="flex justify-between items-center cursor-pointer font-medium">
                {f.q}
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition text-primary" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
