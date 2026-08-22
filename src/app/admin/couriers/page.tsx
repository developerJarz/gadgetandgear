"use client";

import { useState } from "react";
import { Truck, Settings, CheckCircle, XCircle, MapPin, DollarSign, Clock, Phone, Globe, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface CourierConfig {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  webhookUrl: string;
  sandbox: boolean;
  coverage: string[];
  avgDeliveryDays: string;
  ratePerKg: number;
  baseRate: number;
  supportPhone: string;
  features: string[];
}

const couriers: CourierConfig[] = [
  { id: "pathao", name: "Pathao Courier", logo: "🚲", enabled: true, apiKey: "pk_test_***", secretKey: "••••••••", baseUrl: "https://api-hermes.pathao.com", webhookUrl: "/api/webhooks/pathao", sandbox: true, coverage: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"], avgDeliveryDays: "1-2 days (Dhaka), 2-4 days (Outside)", ratePerKg: 15, baseRate: 60, supportPhone: "+8809612-001122", features: ["Real-time tracking", "COD support", "Return pickup", "Zone-based pricing"] },
  { id: "redx", name: "RedX", logo: "📦", enabled: true, apiKey: "rx_test_***", secretKey: "••••••••", baseUrl: "https://openapi.redx.com.bd", webhookUrl: "/api/webhooks/redx", sandbox: true, coverage: ["All 64 Districts"], avgDeliveryDays: "2-3 days (Dhaka), 3-5 days (Outside)", ratePerKg: 12, baseRate: 70, supportPhone: "+8809612-888222", features: ["Nationwide coverage", "COD collection", "Store pickup", "Bulk parcel"] },
  { id: "steadfast", name: "Steadfast Courier", logo: "🏃", enabled: false, apiKey: "", secretKey: "", baseUrl: "https://portal.steadfast.com.bd/api/v1", webhookUrl: "/api/webhooks/steadfast", sandbox: false, coverage: ["Dhaka", "Chattogram", "Gazipur", "Narayanganj"], avgDeliveryDays: "1-2 days (Dhaka), 3-5 days (Outside)", ratePerKg: 10, baseRate: 55, supportPhone: "+8801844-055056", features: ["Fast Dhaka delivery", "COD support", "API integration", "Consignment tracking"] },
  { id: "paperfly", name: "Paperfly", logo: "✈️", enabled: false, apiKey: "", secretKey: "", baseUrl: "https://api.paperfly.com.bd", webhookUrl: "/api/webhooks/paperfly", sandbox: false, coverage: ["Dhaka", "Key districts"], avgDeliveryDays: "2-3 days (Dhaka), 4-6 days (Outside)", ratePerKg: 14, baseRate: 65, supportPhone: "+8809612-444555", features: ["E-commerce focused", "Return management", "Live tracking", "SMS notifications"] },
  { id: "ecourier", name: "eCourier", logo: "📬", enabled: false, apiKey: "", secretKey: "", baseUrl: "https://backoffice.ecourier.com.bd/api", webhookUrl: "/api/webhooks/ecourier", sandbox: false, coverage: ["All 64 Districts"], avgDeliveryDays: "1-2 days (Dhaka), 3-5 days (Outside)", ratePerKg: 13, baseRate: 60, supportPhone: "+8809612-277277", features: ["Nationwide network", "Same-day delivery (Dhaka)", "COD", "Package insurance"] },
];

export default function CouriersPage() {
  const [courierList, setCourierList] = useState(couriers);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);

  const toggleCourier = (id: string) => {
    setCourierList((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
    const courier = courierList.find((c) => c.id === id);
    toast.success(`${courier?.name} ${courier?.enabled ? "disabled" : "enabled"}`);
  };

  const selected = courierList.find((c) => c.id === selectedCourier);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl">Courier Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure Bangladesh courier services for order fulfillment</p>
      </div>

      {/* Courier Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courierList.map((courier) => (
          <div key={courier.id} className={`bg-card border rounded-2xl p-5 transition hover:shadow-lg ${courier.enabled ? "border-primary/30 shadow-sm" : "border-border opacity-75"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{courier.logo}</span>
                <div>
                  <h3 className="font-display font-semibold">{courier.name}</h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {courier.enabled ? <CheckCircle className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3" />}
                    {courier.enabled ? "Active" : "Inactive"}
                    {courier.sandbox && courier.enabled && <span className="ml-1 px-1.5 py-0.5 rounded bg-warning/20 text-warning text-[8px] font-bold">SANDBOX</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => toggleCourier(courier.id)} className="p-1">
                {courier.enabled ? <ToggleRight className="w-6 h-6 text-success" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3 h-3" /><span className="truncate">{courier.avgDeliveryDays.split(",")[0]}</span></div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="w-3 h-3" /><span>৳{courier.baseRate} base</span></div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3 h-3" /><span>{courier.coverage.length > 2 ? courier.coverage[0] : courier.coverage.join(", ")}</span></div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3 h-3" /><span className="truncate">{courier.supportPhone}</span></div>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {courier.features.slice(0, 3).map((f) => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{f}</span>
              ))}
            </div>

            <button
              onClick={() => setSelectedCourier(courier.id)}
              className="w-full mt-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent transition flex items-center justify-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" /> Configure
            </button>
          </div>
        ))}
      </div>

      {/* Rate Comparison */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Rate Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Courier</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Base Rate</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Per KG</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">1kg Total</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery Time</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {courierList.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-2.5 px-3 font-medium">{c.logo} {c.name}</td>
                  <td className="py-2.5 px-3">৳{c.baseRate}</td>
                  <td className="py-2.5 px-3">৳{c.ratePerKg}</td>
                  <td className="py-2.5 px-3 font-display font-semibold">৳{c.baseRate + c.ratePerKg}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.avgDeliveryDays.split(",")[0]}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${c.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {c.enabled ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">{selected.logo} {selected.name} Config</h2>
              <button onClick={() => setSelectedCourier(null)} className="p-2 hover:bg-accent rounded-lg"><span className="text-lg">×</span></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setSelectedCourier(null); toast.success("Configuration saved!"); }} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API Key</label>
                <input defaultValue={selected.apiKey} placeholder="Enter API key" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Secret Key</label>
                <input defaultValue={selected.secretKey} type="password" placeholder="Enter secret key" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Base URL</label>
                <input defaultValue={selected.baseUrl} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Webhook URL</label>
                <input defaultValue={selected.webhookUrl} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Sandbox Mode</span>
                <button type="button" className="p-1">
                  {selected.sandbox ? <ToggleRight className="w-6 h-6 text-warning" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedCourier(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition">Save Config</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
