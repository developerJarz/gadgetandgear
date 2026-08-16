"use client";

import { useEffect, useState } from "react";
import {
  Save, Store, Globe, CreditCard, Truck, Megaphone, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  socialLinks: { instagram: string; facebook: string; youtube: string };
  paymentMethods: {
    bkash: boolean;
    nagad: boolean;
    rocket: boolean;
    sslcommerz: boolean;
    cod: boolean;
  };
  deliveryZones: string[];
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch {
      toast.error("Failed to load settings");
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      toast.success("Settings saved to MongoDB!");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const togglePayment = (method: keyof StoreSettings["paymentMethods"]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      paymentMethods: {
        ...settings.paymentMethods,
        [method]: !settings.paymentMethods[method],
      },
    });
  };

  const removeZone = (zone: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      deliveryZones: settings.deliveryZones.filter((z) => z !== zone),
    });
  };

  const addZone = (zone: string) => {
    if (!settings) return;
    if (zone && !settings.deliveryZones.includes(zone)) {
      setSettings({
        ...settings,
        deliveryZones: [...settings.deliveryZones, zone],
      });
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your store configuration (MongoDB synced)</p>
        </div>
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg ${
            saved
              ? "bg-success text-brand-dark shadow-success/25"
              : "gradient-brand text-primary-foreground shadow-primary/25 hover:opacity-90"
          }`}
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Store Info */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Store Information</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Store Name</label>
            <input
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tagline</label>
            <input
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Announcement Bar</h2>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Announcement Text</label>
          <textarea
            value={settings.announcementText}
            onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-[11px] text-muted-foreground mt-1">This text scrolls across the top of your store. Use emojis and pipe separators (|) to separate messages.</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Social Links</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Instagram</label>
            <input
              value={settings.socialLinks?.instagram || ""}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Facebook</label>
            <input
              value={settings.socialLinks?.facebook || ""}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
              placeholder="https://facebook.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">YouTube</label>
            <input
              value={settings.socialLinks?.youtube || ""}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Payment Methods</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {settings.paymentMethods && (Object.entries(settings.paymentMethods) as [keyof StoreSettings["paymentMethods"], boolean][]).map(([method, enabled]) => (
            <button
              key={method}
              onClick={() => togglePayment(method)}
              className={`flex items-center justify-between p-4 rounded-xl border transition ${
                enabled
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:bg-accent/50"
              }`}
            >
              <span className="text-sm font-medium capitalize">{method === "cod" ? "Cash on Delivery" : method === "sslcommerz" ? "SSLCommerz" : method.charAt(0).toUpperCase() + method.slice(1)}</span>
              <div className={`w-10 h-6 rounded-full transition flex items-center ${enabled ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow mx-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Delivery Zones</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.deliveryZones?.map((zone) => (
            <span key={zone} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm border border-border">
              {zone}
              <button onClick={() => removeZone(zone)} className="text-muted-foreground hover:text-destructive transition text-xs">×</button>
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector("input") as HTMLInputElement;
            addZone(input.value.trim());
            input.value = "";
          }}
          className="flex gap-2"
        >
          <input placeholder="Add delivery zone..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" className="px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition">Add</button>
        </form>
      </div>
    </div>
  );
}
