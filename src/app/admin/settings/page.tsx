"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Store, Globe, CreditCard, Truck, Megaphone, Palette, Phone, PanelTop, Sparkles, SlidersHorizontal,
  Plus, X, ArrowUp, ArrowDown, Loader2, Check,
} from "lucide-react";
import { toast } from "sonner";
import { MediaInput } from "@/components/admin/media/MediaInput";
import { useAdminPrefs } from "@/hooks/use-admin-prefs";

interface QuickLink { label: string; href: string }

interface StoreSettings {
  storeName: string;
  tagline: string;
  socialLinks: { instagram: string; facebook: string; youtube: string; twitter?: string; tiktok?: string };
  paymentMethods: { bkash: boolean; nagad: boolean; rocket: boolean; sslcommerz: boolean; cod: boolean; card?: boolean };
  deliveryZones: string[];
  branding: { logo: string; favicon: string };
  contact: { email: string; phone: string; whatsapp: string; address: string };
  header: { showTopBar: boolean; announcements: string[]; quickLinks: QuickLink[]; showPromoBadges: boolean };
  hero: { image: string; eyebrow: string; title: string; subtitle: string; ctaLabel: string; ctaHref: string };
  maintenanceMode: boolean;
}

const SECTIONS = [
  { id: "store", label: "Store", icon: Store },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "header", label: "Header & menu", icon: PanelTop },
  { id: "hero", label: "Homepage hero", icon: Sparkles },
  { id: "social", label: "Social links", icon: Globe },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery zones", icon: Truck },
  { id: "admin", label: "Admin panel", icon: SlidersHorizontal },
];

const PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash", nagad: "Nagad", rocket: "Rocket", sslcommerz: "SSLCommerz", cod: "Cash on delivery", card: "Card",
};

const input = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function withDefaults(s: any): StoreSettings {
  return {
    ...s,
    socialLinks: { instagram: "", facebook: "", youtube: "", ...(s.socialLinks || {}) },
    paymentMethods: s.paymentMethods || {},
    deliveryZones: s.deliveryZones || [],
    branding: { logo: "", favicon: "", ...(s.branding || {}) },
    contact: { email: "", phone: "", whatsapp: "", address: "", ...(s.contact || {}) },
    header: { showTopBar: true, announcements: [], quickLinks: [], showPromoBadges: true, ...(s.header || {}) },
    hero: { image: "", eyebrow: "", title: "", subtitle: "", ctaLabel: "", ctaHref: "", ...(s.hero || {}) },
    maintenanceMode: !!s.maintenanceMode,
  };
}

function Card({ id, title, description, icon: Icon, children }: { id: string; title: string; description?: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-card border border-border rounded-2xl p-5 sm:p-6 scroll-mt-20">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg leading-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/40 transition text-left">
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-[11px] text-muted-foreground">{description}</span>}
      </span>
      <span className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${checked ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
        <span className="w-4 h-4 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground mb-1.5 block">{children}</label>;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoneInput, setZoneInput] = useState("");
  const [active, setActive] = useState("store");
  const { prefs, setPrefs } = useAdminPrefs();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = withDefaults(data);
        setSettings(s);
        setSaved(s);
      })
      .catch(() => toast.error("Couldn't load settings. Refresh to try again."))
      .finally(() => setLoading(false));
  }, []);

  // Highlight the section in view.
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = <K extends keyof StoreSettings>(key: K, value: Partial<StoreSettings[K]> | StoreSettings[K]) =>
    setSettings((s) =>
      s ? { ...s, [key]: typeof value === "object" && !Array.isArray(value) && value !== null ? { ...(s[key] as object), ...value } : value } : s
    );

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save settings.");
      const s = withDefaults(data);
      setSettings(s);
      setSaved(s);
      toast.success("Settings saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  const { header } = settings;
  const setLinks = (links: QuickLink[]) => patch("header", { quickLinks: links });
  const setAnnouncements = (list: string[]) => patch("header", { announcements: list });
  const moveItem = <T,>(list: T[], i: number, dir: -1 | 1) => {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return list;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  return (
    <div className="max-w-5xl pb-24">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Control how your store looks and works. Changes go live when you save.</p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6 items-start">
        <nav className="hidden lg:block sticky top-20 space-y-0.5" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition ${
                active === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-5 min-w-0">
          <Card id="store" title="Store" icon={Store}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s-name">Store name</Label>
                <input id="s-name" value={settings.storeName} onChange={(e) => patch("storeName", e.target.value)} className={input} />
              </div>
              <div>
                <Label htmlFor="s-tagline">Tagline</Label>
                <input id="s-tagline" value={settings.tagline} onChange={(e) => patch("tagline", e.target.value)} className={input} />
              </div>
            </div>
            <Toggle
              checked={settings.maintenanceMode}
              onChange={(v) => patch("maintenanceMode", v)}
              label="Maintenance mode"
              description="Flags the store as under maintenance. Use while you make big catalog changes."
            />
          </Card>

          <Card id="branding" title="Branding" description="Your logo appears in the store header and the admin sidebar." icon={Palette}>
            <div className="grid sm:grid-cols-2 gap-4">
              <MediaInput label="Logo" value={settings.branding.logo} onChange={(logo) => patch("branding", { logo })} folder="branding" aspect="logo" hint="Wide PNG or SVG with a transparent background" />
              <MediaInput label="Browser icon" value={settings.branding.favicon} onChange={(favicon) => patch("branding", { favicon })} folder="branding" aspect="square" hint="Square PNG, 512×512" />
            </div>
          </Card>

          <Card id="contact" title="Contact" description="Shown in the header top bar, the mobile menu and the footer." icon={Phone}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="c-email">Support email</Label>
                <input id="c-email" type="email" value={settings.contact.email} onChange={(e) => patch("contact", { email: e.target.value })} className={input} />
              </div>
              <div>
                <Label htmlFor="c-phone">Phone</Label>
                <input id="c-phone" type="tel" value={settings.contact.phone} onChange={(e) => patch("contact", { phone: e.target.value })} placeholder="+880 1XXX-XXXXXX" className={input} />
              </div>
              <div>
                <Label htmlFor="c-wa">WhatsApp number</Label>
                <input id="c-wa" type="tel" value={settings.contact.whatsapp} onChange={(e) => patch("contact", { whatsapp: e.target.value })} placeholder="8801XXXXXXXXX" className={input} />
              </div>
              <div>
                <Label htmlFor="c-addr">Store address</Label>
                <input id="c-addr" value={settings.contact.address} onChange={(e) => patch("contact", { address: e.target.value })} className={input} />
              </div>
            </div>
          </Card>

          <Card id="header" title="Header & menu" description="What shoppers see at the top of every page." icon={PanelTop}>
            <Toggle checked={header.showTopBar} onChange={(v) => patch("header", { showTopBar: v })} label="Show the top bar" description="The thin dark strip with announcements and contact details." />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">Announcements</span>
                <span className="text-[11px] text-muted-foreground">Rotate every few seconds</span>
              </div>
              <div className="space-y-2">
                {header.announcements.map((a, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input
                      aria-label={`Announcement ${i + 1}`}
                      value={a}
                      onChange={(e) => setAnnouncements(header.announcements.map((x, j) => (j === i ? e.target.value : x)))}
                      className={input}
                    />
                    <button type="button" onClick={() => setAnnouncements(moveItem(header.announcements, i, -1))} disabled={i === 0} className="p-2 rounded-lg hover:bg-accent disabled:opacity-30" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => setAnnouncements(moveItem(header.announcements, i, 1))} disabled={i === header.announcements.length - 1} className="p-2 rounded-lg hover:bg-accent disabled:opacity-30" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => setAnnouncements(header.announcements.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Remove announcement"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setAnnouncements([...header.announcements, ""])} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Add announcement
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Menu links</span>
              <div className="space-y-2">
                {header.quickLinks.map((l, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-1.5">
                    <input aria-label="Link label" value={l.label} placeholder="Label" onChange={(e) => setLinks(header.quickLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={input} />
                    <input aria-label="Link address" value={l.href} placeholder="/shop?category=…" onChange={(e) => setLinks(header.quickLinks.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} className={`${input} font-mono text-xs`} />
                    <div className="flex">
                      <button type="button" onClick={() => setLinks(moveItem(header.quickLinks, i, -1))} disabled={i === 0} className="p-2 rounded-lg hover:bg-accent disabled:opacity-30" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setLinks(moveItem(header.quickLinks, i, 1))} disabled={i === header.quickLinks.length - 1} className="p-2 rounded-lg hover:bg-accent disabled:opacity-30" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setLinks(header.quickLinks.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Remove link"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
                {header.quickLinks.length < 10 && (
                  <button type="button" onClick={() => setLinks([...header.quickLinks, { label: "", href: "/shop" }])} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add link
                  </button>
                )}
              </div>
            </div>

            <Toggle checked={header.showPromoBadges} onChange={(v) => patch("header", { showPromoBadges: v })} label="Show Flash Deals and EMI shortcuts" description="The two highlighted links at the right of the menu bar." />
          </Card>

          <Card id="hero" title="Homepage hero" description="The first thing shoppers see on the homepage." icon={Sparkles}>
            <MediaInput label="Hero image" value={settings.hero.image} onChange={(image) => patch("hero", { image })} folder="banners" aspect="wide" hint="Portrait 4:5 works best, at least 1200×1500. Leave empty to use the default." />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="h-eyebrow">Small line above the title</Label>
                <input id="h-eyebrow" value={settings.hero.eyebrow} onChange={(e) => patch("hero", { eyebrow: e.target.value })} className={input} />
              </div>
              <div>
                <Label htmlFor="h-title">Title</Label>
                <input id="h-title" value={settings.hero.title} onChange={(e) => patch("hero", { title: e.target.value })} className={input} />
              </div>
            </div>
            <div>
              <Label htmlFor="h-sub">Description</Label>
              <textarea id="h-sub" rows={2} value={settings.hero.subtitle} onChange={(e) => patch("hero", { subtitle: e.target.value })} className={`${input} resize-none`} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="h-cta">Button text</Label>
                <input id="h-cta" value={settings.hero.ctaLabel} onChange={(e) => patch("hero", { ctaLabel: e.target.value })} className={input} />
              </div>
              <div>
                <Label htmlFor="h-href">Button link</Label>
                <input id="h-href" value={settings.hero.ctaHref} onChange={(e) => patch("hero", { ctaHref: e.target.value })} className={`${input} font-mono text-xs`} />
              </div>
            </div>
          </Card>

          <Card id="social" title="Social links" icon={Globe}>
            <div className="grid sm:grid-cols-3 gap-4">
              {(["facebook", "instagram", "youtube"] as const).map((k) => (
                <div key={k}>
                  <Label htmlFor={`so-${k}`}>{k.charAt(0).toUpperCase() + k.slice(1)}</Label>
                  <input id={`so-${k}`} value={settings.socialLinks[k] || ""} onChange={(e) => patch("socialLinks", { [k]: e.target.value })} placeholder={`https://${k}.com/…`} className={input} />
                </div>
              ))}
            </div>
          </Card>

          <Card id="payments" title="Payments" description="Methods offered at checkout." icon={CreditCard}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
                <Toggle key={method} checked={!!enabled} onChange={(v) => patch("paymentMethods", { [method]: v })} label={PAYMENT_LABELS[method] || method} />
              ))}
            </div>
          </Card>

          <Card id="delivery" title="Delivery zones" icon={Truck}>
            <div className="flex flex-wrap gap-2">
              {settings.deliveryZones.map((zone) => (
                <span key={zone} className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-secondary text-sm border border-border">
                  {zone}
                  <button type="button" onClick={() => patch("deliveryZones", settings.deliveryZones.filter((z) => z !== zone))} className="p-0.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label={`Remove ${zone}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const zone = zoneInput.trim();
                if (zone && !settings.deliveryZones.includes(zone)) patch("deliveryZones", [...settings.deliveryZones, zone]);
                setZoneInput("");
              }}
              className="flex gap-2"
            >
              <input value={zoneInput} onChange={(e) => setZoneInput(e.target.value)} placeholder="Add a district, e.g. Gazipur" aria-label="New delivery zone" className={input} />
              <button type="submit" className="px-4 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Add</button>
            </form>
          </Card>

          <Card id="admin" title="Admin panel" description="Only affects this browser. Saved instantly." icon={SlidersHorizontal}>
            <Toggle checked={prefs.sidebar === "rail"} onChange={(v) => setPrefs({ sidebar: v ? "rail" : "full" })} label="Compact sidebar" description="Shows icons only, giving pages more room. Hover an icon to see its name." />
            <Toggle checked={prefs.density === "compact"} onChange={(v) => setPrefs({ density: v ? "compact" : "comfortable" })} label="Dense tables" description="Fits more rows on screen in products, orders and logs." />
            <Toggle checked={prefs.reduceMotion} onChange={(v) => setPrefs({ reduceMotion: v })} label="Reduce motion" description="Turns off animations in the admin panel." />
          </Card>
        </div>
      </div>

      {/* Save bar: appears only with unsaved changes */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-[calc(50%+var(--admin-sidebar-w,270px)/2)] z-40 transition-all duration-300 ${dirty ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-brand-dark text-white shadow-2xl border border-white/10">
          <span className="text-sm">Unsaved changes</span>
          <button type="button" onClick={() => setSettings(saved)} className="px-3 py-1.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition">Discard</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-1.5 rounded-xl gradient-brand text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-60">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
