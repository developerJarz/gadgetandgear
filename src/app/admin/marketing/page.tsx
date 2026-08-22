"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Send, Users, TrendingUp, Clock, Plus, Search, Eye, Pencil, Trash2, X, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";

const emailTemplates = [
  { id: "et1", name: "Welcome Email", subject: "Welcome to Gadget & Gear BD!", type: "Automated", sent: 1245, openRate: 68, clickRate: 12 },
  { id: "et2", name: "Order Confirmation", subject: "Your order has been confirmed ✅", type: "Automated", sent: 8234, openRate: 85, clickRate: 24 },
  { id: "et3", name: "Abandoned Cart Reminder", subject: "You left items in your cart!", type: "Automated", sent: 3421, openRate: 42, clickRate: 8 },
  { id: "et4", name: "Eid Sale Announcement", subject: "🌙 Eid Mega Sale - Up to 40% OFF!", type: "Campaign", sent: 15420, openRate: 55, clickRate: 15 },
  { id: "et5", name: "Product Review Request", subject: "How do you like your purchase?", type: "Automated", sent: 6789, openRate: 38, clickRate: 6 },
];

const smsCampaigns = [
  { id: "sms1", name: "Flash Sale Alert", message: "⚡ 24-hour Flash Sale! Up to 50% off on gadgets. Shop now: gadgetgear.bd/sale", recipients: 5420, delivered: 5380, status: "Sent" },
  { id: "sms2", name: "Delivery Update", message: "Your order #{orderId} is out for delivery. Track: {trackUrl}", recipients: 234, delivered: 234, status: "Automated" },
  { id: "sms3", name: "Ramadan Offer", message: "🌙 Ramadan Mubarak! Enjoy 25% off on selected items. Valid till Eid. Code: RAMADAN25", recipients: 8900, delivered: 8756, status: "Sent" },
];

export default function MarketingPage() {
  const [tab, setTab] = useState<"email" | "sms" | "push">("email");
  const [showCreate, setShowCreate] = useState(false);

  const totalEmailsSent = emailTemplates.reduce((s, t) => s + t.sent, 0);
  const avgOpenRate = (emailTemplates.reduce((s, t) => s + t.openRate, 0) / emailTemplates.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Marketing Suite</h1>
          <p className="text-sm text-muted-foreground mt-1">Email, SMS & push notification marketing</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Emails Sent", value: totalEmailsSent.toLocaleString(), icon: Mail, color: "gradient-brand" },
          { label: "Avg Open Rate", value: `${avgOpenRate}%`, icon: Eye, color: "bg-success" },
          { label: "SMS Campaigns", value: smsCampaigns.length.toString(), icon: Smartphone, color: "bg-warning" },
          { label: "Push Subscribers", value: "3,420", icon: Bell, color: "bg-accent" },
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
          { key: "email", label: "Email Marketing", icon: Mail },
          { key: "sms", label: "SMS Marketing", icon: Smartphone },
          { key: "push", label: "Push Notifications", icon: Bell },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "email" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Subject</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Open Rate</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Click Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emailTemplates.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                    <td className="py-3 px-4 font-medium text-xs">{t.name}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground truncate max-w-[200px]">{t.subject}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${t.type === "Automated" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>{t.type}</span></td>
                    <td className="py-3 px-4 font-display font-semibold text-xs">{t.sent.toLocaleString()}</td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-success" style={{ width: `${t.openRate}%` }} /></div>
                        <span className="text-xs">{t.openRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs">{t.clickRate}%</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 hover:bg-accent rounded-lg"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button className="p-1.5 hover:bg-accent rounded-lg"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button className="p-1.5 hover:bg-accent rounded-lg"><Send className="w-3.5 h-3.5 text-primary" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "sms" && (
        <div className="space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
            <p className="font-medium text-primary">📱 Bangladesh SMS Marketing</p>
            <p className="text-xs text-muted-foreground mt-1">Messages sent to +880 numbers. Standard SMS rates apply. Ensure compliance with BTRC regulations.</p>
          </div>
          {smsCampaigns.map((sms) => (
            <div key={sms.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">{sms.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">{sms.message}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div><p className="font-display font-semibold text-sm">{sms.recipients.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Recipients</p></div>
                  <div><p className="font-display font-semibold text-sm text-success">{((sms.delivered / sms.recipients) * 100).toFixed(1)}%</p><p className="text-[10px] text-muted-foreground">Delivered</p></div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${sms.status === "Automated" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>{sms.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "push" && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="font-display font-semibold text-lg">Push Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Send browser push notifications to subscribed users. Configure service worker and notification permissions to get started.</p>
          <button className="mt-4 px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Configure Push Notifications</button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">New Marketing Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreate(false); toast.success("Campaign created!"); }} className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Channel</label><select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option>Email</option><option>SMS</option><option>Push Notification</option></select></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Campaign Name</label><input required placeholder="Campaign name" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject / Message</label><textarea rows={3} placeholder="Message content..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Segment</label><select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option>All Customers</option><option>VIP Customers</option><option>New Customers</option><option>At-Risk Customers</option><option>Abandoned Cart Users</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Create & Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
