"use client";

import { useState } from "react";
import { Key, Globe, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyItem { id: string; name: string; key: string; permissions: string[]; created: string; lastUsed: string; status: "Active" | "Revoked"; }
interface WebhookItem { id: string; url: string; events: string[]; status: "Active" | "Inactive"; lastDelivery: string; successRate: number; }

const demoApiKeys: ApiKeyItem[] = [
  { id: "AK-001", name: "Mobile App", key: "gk_live_a1b2c3d4e5f6", permissions: ["products:read", "orders:read", "orders:write"], created: "Jul 15, 2026", lastUsed: "Aug 18, 2026", status: "Active" },
  { id: "AK-002", name: "POS Integration", key: "gk_live_x7y8z9w0v1u2", permissions: ["products:read", "orders:write", "inventory:write"], created: "Aug 1, 2026", lastUsed: "Aug 17, 2026", status: "Active" },
  { id: "AK-003", name: "Old Website", key: "gk_live_old_key_123", permissions: ["products:read"], created: "Mar 10, 2026", lastUsed: "Jun 5, 2026", status: "Revoked" },
];

const demoWebhooks: WebhookItem[] = [
  { id: "WH-001", url: "https://myapp.com/webhooks/orders", events: ["order.created", "order.updated", "order.fulfilled"], status: "Active", lastDelivery: "Aug 18, 2026 11:30 PM", successRate: 98.5 },
  { id: "WH-002", url: "https://analytics.com/ingest", events: ["order.created", "product.viewed"], status: "Active", lastDelivery: "Aug 18, 2026 10:15 PM", successRate: 100 },
  { id: "WH-003", url: "https://old-system.com/hook", events: ["order.created"], status: "Inactive", lastDelivery: "Jul 1, 2026", successRate: 85.2 },
];

export default function ApiManagementPage() {
  const [tab, setTab] = useState<"keys" | "webhooks">("keys");
  const [showCreate, setShowCreate] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div><h1 className="font-display font-bold text-3xl">API & Webhooks</h1><p className="text-sm text-muted-foreground mt-1">Manage API keys and webhook configurations</p></div>

      <div className="flex gap-1 border-b border-border">
        {([{ key: "keys", label: "API Keys", icon: Key }, { key: "webhooks", label: "Webhooks", icon: Globe }] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}><t.icon className="w-4 h-4" /> {t.label}</button>
        ))}
      </div>

      {tab === "keys" && (
        <>
          <div className="flex justify-end"><button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"><Plus className="w-4 h-4" /> Generate Key</button></div>
          <div className="space-y-3">
            {demoApiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2"><h3 className="font-display font-semibold">{apiKey.name}</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${apiKey.status === "Active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{apiKey.status}</span></div>
                    <div className="flex items-center gap-2 mt-2"><code className="px-2.5 py-1 rounded-lg bg-muted text-xs font-mono">{visibleKeys[apiKey.id] ? apiKey.key : apiKey.key.slice(0, 12) + "••••••••"}</code>
                      <button onClick={() => setVisibleKeys(p => ({ ...p, [apiKey.id]: !p[apiKey.id] }))} className="p-1 hover:bg-accent rounded">{visibleKeys[apiKey.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                      <button onClick={() => { navigator.clipboard.writeText(apiKey.key); toast.success("Copied!"); }} className="p-1 hover:bg-accent rounded"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">{apiKey.permissions.map(p => <span key={p} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono">{p}</span>)}</div>
                    <p className="text-[10px] text-muted-foreground mt-2">Created: {apiKey.created} · Last used: {apiKey.lastUsed}</p>
                  </div>
                  {apiKey.status === "Active" && <button onClick={() => toast.success("API key revoked!")} className="px-3 py-1.5 rounded-lg border border-destructive text-destructive text-xs font-medium hover:bg-destructive/10 transition">Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "webhooks" && (
        <>
          <div className="flex justify-end"><button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"><Plus className="w-4 h-4" /> Add Webhook</button></div>
          <div className="space-y-3">
            {demoWebhooks.map((wh) => (
              <div key={wh.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2"><code className="text-sm font-mono font-medium">{wh.url}</code><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${wh.status === "Active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{wh.status}</span></div>
                    <div className="flex flex-wrap gap-1 mt-2">{wh.events.map(e => <span key={e} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono">{e}</span>)}</div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>Last delivery: {wh.lastDelivery}</span>
                      <span className={wh.successRate >= 95 ? "text-success" : "text-warning"}>Success: {wh.successRate}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1"><button className="p-2 hover:bg-accent rounded-lg"><Eye className="w-4 h-4 text-muted-foreground" /></button><button className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6"><h2 className="font-display font-semibold text-xl">{tab === "keys" ? "Generate API Key" : "Add Webhook"}</h2><button onClick={() => setShowCreate(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreate(false); toast.success(tab === "keys" ? "API key generated!" : "Webhook added!"); }} className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tab === "keys" ? "Key Name" : "Webhook URL"}</label><input required placeholder={tab === "keys" ? "e.g. Mobile App" : "https://example.com/webhook"} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              {tab === "webhooks" && <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Events</label><select multiple className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-24"><option>order.created</option><option>order.updated</option><option>order.fulfilled</option><option>product.created</option><option>product.updated</option><option>payment.received</option></select></div>}
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button><button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">{tab === "keys" ? "Generate" : "Add"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
