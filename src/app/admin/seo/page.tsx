"use client";

import { useState } from "react";
import { Search, Globe, FileText, CheckCircle, AlertTriangle, XCircle, TrendingUp, Code, Settings } from "lucide-react";
import { toast } from "sonner";

const seoPages = [
  { url: "/", title: "Home", score: 92, issues: 0, indexed: true },
  { url: "/shop", title: "Shop All Products", score: 88, issues: 1, indexed: true },
  { url: "/shop/smartphones", title: "Smartphones", score: 85, issues: 2, indexed: true },
  { url: "/shop/laptops", title: "Laptops & Notebooks", score: 78, issues: 3, indexed: true },
  { url: "/product/galaxy-flagship-pro", title: "Galaxy Flagship Pro 5G", score: 95, issues: 0, indexed: true },
  { url: "/about", title: "About Us", score: 70, issues: 4, indexed: true },
  { url: "/contact", title: "Contact Us", score: 65, issues: 5, indexed: false },
];

const seoMetrics = {
  avgScore: 82,
  indexedPages: 45,
  totalBacklinks: 234,
  organicTraffic: "12.5K",
  topKeywords: [
    { keyword: "gadget shop bangladesh", position: 3, volume: 5400 },
    { keyword: "buy smartphone dhaka", position: 5, volume: 3200 },
    { keyword: "laptop price bd", position: 8, volume: 4800 },
    { keyword: "best earbuds bangladesh", position: 4, volume: 2100 },
    { keyword: "tech store online bd", position: 6, volume: 1800 },
  ],
};

export default function SEOPage() {
  const [tab, setTab] = useState<"audit" | "sitemap" | "schema" | "settings">("audit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl">SEO Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Search engine optimization, sitemaps & structured data</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Avg SEO Score", value: `${seoMetrics.avgScore}/100`, icon: TrendingUp, color: "gradient-brand" },
          { label: "Indexed Pages", value: seoMetrics.indexedPages.toString(), icon: Globe, color: "bg-success" },
          { label: "Backlinks", value: seoMetrics.totalBacklinks.toString(), icon: FileText, color: "bg-warning" },
          { label: "Organic Traffic", value: seoMetrics.organicTraffic, icon: TrendingUp, color: "bg-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground mb-2`}><kpi.icon className="w-4 h-4" /></div>
            <p className="font-display font-bold text-xl">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "audit", label: "SEO Audit", icon: Search },
          { key: "sitemap", label: "Sitemap", icon: Globe },
          { key: "schema", label: "Schema Markup", icon: Code },
          { key: "settings", label: "Settings", icon: Settings },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "audit" && (
        <>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-lg">Page SEO Scores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Page</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Issues</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Indexed</th>
                  </tr>
                </thead>
                <tbody>
                  {seoPages.map((page) => (
                    <tr key={page.url} className="border-b border-border/50 hover:bg-accent/30 transition">
                      <td className="py-3 px-4">
                        <p className="font-medium text-xs">{page.title}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{page.url}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${page.score >= 90 ? "bg-success/20 text-success" : page.score >= 70 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`}>
                            {page.score}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        {page.issues === 0 ? <CheckCircle className="w-4 h-4 text-success" /> : <span className="text-xs text-warning">{page.issues} issues</span>}
                      </td>
                      <td className="py-3 px-4">
                        {page.indexed ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Top Keywords</h2>
            <div className="space-y-3">
              {seoMetrics.topKeywords.map((kw) => (
                <div key={kw.keyword} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div><p className="text-sm font-medium">{kw.keyword}</p><p className="text-[10px] text-muted-foreground">{kw.volume.toLocaleString()} monthly searches</p></div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${kw.position <= 3 ? "bg-success/20 text-success" : kw.position <= 10 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                    #{kw.position}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "sitemap" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Sitemap Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div><p className="text-sm font-medium">Auto-generate sitemap.xml</p><p className="text-xs text-muted-foreground">Automatically update sitemap when pages change</p></div>
              <button className="p-1"><span className="w-10 h-6 rounded-full bg-primary flex items-center justify-end px-0.5"><span className="w-5 h-5 rounded-full bg-white shadow" /></span></button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div><p className="text-sm font-medium">Include product pages</p><p className="text-xs text-muted-foreground">Add all product URLs to sitemap</p></div>
              <button className="p-1"><span className="w-10 h-6 rounded-full bg-primary flex items-center justify-end px-0.5"><span className="w-5 h-5 rounded-full bg-white shadow" /></span></button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Include blog posts</p><p className="text-xs text-muted-foreground">Add blog post URLs to sitemap</p></div>
              <button className="p-1"><span className="w-10 h-6 rounded-full bg-primary flex items-center justify-end px-0.5"><span className="w-5 h-5 rounded-full bg-white shadow" /></span></button>
            </div>
            <button onClick={() => toast.success("Sitemap regenerated!")} className="px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Regenerate Sitemap</button>
          </div>
        </div>
      )}

      {tab === "schema" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Schema Markup Generator</h2>
          <p className="text-sm text-muted-foreground mb-4">Auto-generated JSON-LD structured data for your store</p>
          <pre className="bg-muted rounded-xl p-4 overflow-x-auto text-xs font-mono">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Gadget & Gear BD",
            "url": "https://gadgetandgear.bd",
            "description": "Premium Electronics & Gadgets in Bangladesh",
            "address": { "@type": "PostalAddress", "addressCountry": "BD", "addressLocality": "Dhaka" },
            "paymentAccepted": "bKash, Nagad, Rocket, SSLCommerz, Cash on Delivery",
          }, null, 2)}</pre>
        </div>
      )}

      {tab === "settings" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">Global SEO Settings</h2>
          <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Default Title Template</label><input defaultValue="%s | Gadget & Gear BD" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Default Meta Description</label><textarea defaultValue="Shop the latest smartphones, laptops, audio and smart tech at Gadget & Gear BD. Official warranty, 0% EMI, and express nationwide delivery across Bangladesh." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Robots.txt</label><textarea defaultValue={"User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://gadgetandgear.bd/sitemap.xml"} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
          <button onClick={() => toast.success("SEO settings saved!")} className="px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Save Settings</button>
        </div>
      )}
    </div>
  );
}
