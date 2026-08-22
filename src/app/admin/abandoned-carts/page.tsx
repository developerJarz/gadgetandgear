"use client";

import { useState } from "react";
import { ShoppingBag, Mail, Clock, DollarSign, TrendingUp, Send, Eye, Search } from "lucide-react";
import { toast } from "sonner";

interface AbandonedCart { id: string; customer: string; email: string; phone: string; items: { name: string; price: number; qty: number }[]; total: number; lastActivity: string; recoveryStatus: "Not Sent" | "Email Sent" | "SMS Sent" | "Recovered" | "Lost"; }

const demoCarts: AbandonedCart[] = [
  { id: "AC-001", customer: "Rafiq Islam", email: "rafiq@example.com", phone: "+8801712345678", items: [{ name: "Galaxy Flagship Pro 5G", price: 129900, qty: 1 }], total: 129900, lastActivity: "2 hours ago", recoveryStatus: "Not Sent" },
  { id: "AC-002", customer: "Mila Rahman", email: "mila@example.com", phone: "+8801812345678", items: [{ name: "Pods Pro ANC Earbuds", price: 18990, qty: 1 }, { name: "Watt 20K Power Bank", price: 3490, qty: 1 }], total: 22480, lastActivity: "5 hours ago", recoveryStatus: "Email Sent" },
  { id: "AC-003", customer: "Kamal Hossain", email: "kamal@example.com", phone: "+8801912345678", items: [{ name: "Aurora Ultrabook 14", price: 145900, qty: 1 }], total: 145900, lastActivity: "1 day ago", recoveryStatus: "SMS Sent" },
  { id: "AC-004", customer: "Fatema Begum", email: "fatema@example.com", phone: "+8801612345678", items: [{ name: "Pulse Smartwatch S3", price: 12500, qty: 2 }], total: 25000, lastActivity: "3 days ago", recoveryStatus: "Recovered" },
  { id: "AC-005", customer: "Arif Khan", email: "arif@example.com", phone: "+8801512345678", items: [{ name: "Wave ANC Headphones", price: 34900, qty: 1 }], total: 34900, lastActivity: "5 days ago", recoveryStatus: "Lost" },
];

const STATUS_COLORS: Record<string, string> = { "Not Sent": "bg-muted text-muted-foreground", "Email Sent": "bg-primary/20 text-primary", "SMS Sent": "bg-warning/20 text-warning", Recovered: "bg-success/20 text-success", Lost: "bg-destructive/20 text-destructive" };

export default function AbandonedCartsPage() {
  const [carts] = useState(demoCarts);
  const [search, setSearch] = useState("");

  const totalValue = carts.reduce((s, c) => s + c.total, 0);
  const recoveredValue = carts.filter((c) => c.recoveryStatus === "Recovered").reduce((s, c) => s + c.total, 0);
  const recoveryRate = ((carts.filter((c) => c.recoveryStatus === "Recovered").length / carts.length) * 100).toFixed(0);
  const filtered = carts.filter((c) => c.customer.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="font-display font-bold text-3xl">Abandoned Carts</h1><p className="text-sm text-muted-foreground mt-1">Recover lost sales with automated reminders</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Abandoned Carts", value: carts.length.toString(), icon: ShoppingBag, color: "bg-warning" },
          { label: "Lost Revenue", value: `৳${(totalValue / 1000).toFixed(0)}k`, icon: DollarSign, color: "bg-destructive" },
          { label: "Recovered", value: `৳${(recoveredValue / 1000).toFixed(0)}k`, icon: TrendingUp, color: "bg-success" },
          { label: "Recovery Rate", value: `${recoveryRate}%`, icon: TrendingUp, color: "gradient-brand" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground mb-2`}><kpi.icon className="w-4 h-4" /></div>
            <p className="font-display font-bold text-xl">{kpi.value}</p><p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>

      <div className="space-y-3">
        {filtered.map((cart) => (
          <div key={cart.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><h3 className="font-display font-semibold">{cart.customer}</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[cart.recoveryStatus]}`}>{cart.recoveryStatus}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">{cart.email} · <Clock className="w-3 h-3 inline" /> {cart.lastActivity}</p>
                <div className="mt-2 space-y-1">{cart.items.map((item, i) => (<p key={i} className="text-xs"><span className="text-muted-foreground">{item.qty}× </span>{item.name} <span className="font-display font-semibold">৳{item.price.toLocaleString()}</span></p>))}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="font-display font-bold text-lg">৳{cart.total.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Cart Value</p></div>
                {cart.recoveryStatus !== "Recovered" && cart.recoveryStatus !== "Lost" && (
                  <div className="flex gap-1">
                    <button onClick={() => toast.success("Recovery email sent!")} className="p-2 hover:bg-primary/10 rounded-lg" title="Send email"><Mail className="w-4 h-4 text-primary" /></button>
                    <button onClick={() => toast.success("Recovery SMS sent!")} className="p-2 hover:bg-warning/10 rounded-lg" title="Send SMS"><Send className="w-4 h-4 text-warning" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
