"use client";

import { useState } from "react";
import { MessageSquare, Calendar, Zap, Gift, Star, TrendingUp, Plus, Search, ToggleRight, ToggleLeft, Eye, Pencil, Copy, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  type: "Flash Sale" | "Seasonal" | "Clearance" | "Launch" | "Festival";
  season?: string;
  status: "Active" | "Scheduled" | "Ended" | "Draft";
  startDate: string;
  endDate: string;
  discount: string;
  products: number;
  revenue: number;
  orders: number;
  conversionRate: number;
}

const demoCampaigns: Campaign[] = [
  { id: "CMP-001", name: "Eid-ul-Adha Mega Sale", type: "Festival", season: "Eid", status: "Active", startDate: "Aug 15, 2026", endDate: "Aug 22, 2026", discount: "Up to 40%", products: 45, revenue: 1250000, orders: 342, conversionRate: 8.2 },
  { id: "CMP-002", name: "Back to School Tech", type: "Seasonal", season: "Academic", status: "Active", startDate: "Aug 10, 2026", endDate: "Sep 10, 2026", discount: "15-25%", products: 28, revenue: 680000, orders: 156, conversionRate: 5.4 },
  { id: "CMP-003", name: "Pohela Boishakh Collection", type: "Festival", season: "Pohela Boishakh", status: "Ended", startDate: "Apr 10, 2026", endDate: "Apr 20, 2026", discount: "Up to 30%", products: 32, revenue: 920000, orders: 278, conversionRate: 7.8 },
  { id: "CMP-004", name: "Ramadan Special Deals", type: "Festival", season: "Ramadan", status: "Ended", startDate: "Mar 1, 2026", endDate: "Mar 30, 2026", discount: "20-50%", products: 55, revenue: 2150000, orders: 523, conversionRate: 9.1 },
  { id: "CMP-005", name: "Galaxy S26 Launch Offer", type: "Launch", status: "Scheduled", startDate: "Sep 1, 2026", endDate: "Sep 15, 2026", discount: "Free accessories", products: 5, revenue: 0, orders: 0, conversionRate: 0 },
  { id: "CMP-006", name: "Victory Day Flash Sale", type: "Festival", season: "Victory Day", status: "Draft", startDate: "Dec 14, 2026", endDate: "Dec 18, 2026", discount: "Up to 45%", products: 0, revenue: 0, orders: 0, conversionRate: 0 },
];

const seasonTemplates = [
  { name: "Eid-ul-Fitr", emoji: "🌙", color: "from-emerald-500 to-teal-600" },
  { name: "Eid-ul-Adha", emoji: "🐏", color: "from-amber-500 to-orange-600" },
  { name: "Ramadan", emoji: "☪️", color: "from-indigo-500 to-purple-600" },
  { name: "Pohela Boishakh", emoji: "🎭", color: "from-red-500 to-pink-600" },
  { name: "Victory Day", emoji: "🇧🇩", color: "from-green-600 to-emerald-700" },
  { name: "Independence Day", emoji: "🏳️", color: "from-green-500 to-red-500" },
  { name: "Valentine's Day", emoji: "❤️", color: "from-pink-500 to-rose-600" },
  { name: "New Year", emoji: "🎆", color: "from-blue-500 to-indigo-600" },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-success/20 text-success",
  Scheduled: "bg-primary/20 text-primary",
  Ended: "bg-muted text-muted-foreground",
  Draft: "bg-warning/20 text-warning",
};

export default function CampaignsPage() {
  const [campaigns] = useState(demoCampaigns);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const active = campaigns.filter((c) => c.status === "Active").length;
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = campaigns.reduce((s, c) => s + c.orders, 0);

  const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Marketing campaigns, seasonal promotions & festival sales</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Campaigns", value: active, icon: Zap, color: "bg-success" },
          { label: "Campaign Revenue", value: `৳${(totalRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: "gradient-brand" },
          { label: "Campaign Orders", value: totalOrders.toLocaleString(), icon: Gift, color: "bg-warning" },
          { label: "Avg Conversion", value: `${(campaigns.filter(c => c.conversionRate > 0).reduce((s, c) => s + c.conversionRate, 0) / campaigns.filter(c => c.conversionRate > 0).length).toFixed(1)}%`, icon: Star, color: "bg-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground mb-2`}><kpi.icon className="w-4 h-4" /></div>
            <p className="font-display font-bold text-xl">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Season Templates */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-lg mb-4">🇧🇩 Bangladesh Festival & Season Templates</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {seasonTemplates.map((t) => (
            <button
              key={t.name}
              onClick={() => { setShowCreate(true); toast.info(`${t.name} template loaded!`); }}
              className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition text-left"
            >
              <span className="text-2xl block mb-2">{t.emoji}</span>
              <p className="text-sm font-medium group-hover:text-primary transition">{t.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Use template</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {filtered.map((campaign) => (
          <div key={campaign.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground ${campaign.status === "Active" ? "gradient-brand" : "bg-muted"}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{campaign.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[campaign.status]}`}>{campaign.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {campaign.startDate} — {campaign.endDate}
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{campaign.type}</span>
                    {campaign.season && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{campaign.season}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="font-display font-semibold text-sm">৳{campaign.revenue > 0 ? (campaign.revenue / 1000).toFixed(0) + "k" : "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="font-display font-semibold text-sm">{campaign.orders || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Orders</p>
                </div>
                <div className="text-right hidden lg:block">
                  <p className="font-display font-semibold text-sm">{campaign.conversionRate > 0 ? campaign.conversionRate + "%" : "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Conv Rate</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-accent rounded-lg transition"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                  <button className="p-2 hover:bg-accent rounded-lg transition"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button className="p-2 hover:bg-destructive/10 rounded-lg transition"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">Create Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreate(false); toast.success("Campaign created!"); }} className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Campaign Name</label><input required placeholder="e.g. Eid Mega Sale 2026" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label><select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option>Flash Sale</option><option>Seasonal</option><option>Festival</option><option>Launch</option><option>Clearance</option></select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Discount</label><input placeholder="e.g. Up to 40%" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date</label><input type="date" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label><input type="date" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label><textarea rows={3} placeholder="Campaign description..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
