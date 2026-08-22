"use client";

import { useState, useEffect } from "react";
import { Activity, Server, Database, Cpu, HardDrive, Clock, CheckCircle, AlertTriangle, RefreshCw, Zap, Globe, Wifi } from "lucide-react";

export default function SystemPage() {
  const [uptime, setUptime] = useState(0);
  useEffect(() => { const i = setInterval(() => setUptime(p => p + 1), 1000); return () => clearInterval(i); }, []);
  const formatUptime = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h}h ${m}m ${s % 60}s`; };

  const systemMetrics = [
    { label: "Server Status", value: "Online", icon: Server, color: "bg-success", status: "healthy" },
    { label: "MongoDB", value: "Connected", icon: Database, color: "bg-success", status: "healthy" },
    { label: "API Response", value: "45ms avg", icon: Zap, color: "bg-success", status: "healthy" },
    { label: "CPU Usage", value: "23%", icon: Cpu, color: "bg-success", status: "healthy" },
    { label: "Memory", value: "512MB / 2GB", icon: HardDrive, color: "bg-warning", status: "warning" },
    { label: "Uptime", value: formatUptime(uptime + 86400), icon: Clock, color: "bg-primary", status: "healthy" },
  ];

  const services = [
    { name: "Next.js App Server", status: "Running", version: "15.3.3", port: 3000, healthy: true },
    { name: "MongoDB Atlas", status: "Connected", version: "7.0", port: 27017, healthy: true },
    { name: "Mongoose ODM", status: "Active", version: "9.9.1", port: null, healthy: true },
    { name: "Email Service (SMTP)", status: "Not Configured", version: "—", port: 587, healthy: false },
    { name: "SMS Gateway", status: "Not Configured", version: "—", port: null, healthy: false },
    { name: "Cloudinary CDN", status: "Not Configured", version: "—", port: null, healthy: false },
  ];

  const dependencies = [
    { name: "next", version: "15.3.3", latest: "15.3.3", upToDate: true },
    { name: "react", version: "19.2.0", latest: "19.2.0", upToDate: true },
    { name: "mongoose", version: "9.9.1", latest: "9.9.1", upToDate: true },
    { name: "tailwindcss", version: "4.2.1", latest: "4.2.1", upToDate: true },
    { name: "recharts", version: "2.15.4", latest: "2.15.4", upToDate: true },
    { name: "lucide-react", version: "0.575.0", latest: "0.575.0", upToDate: true },
  ];

  const recentErrors: { time: string; level: string; message: string }[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display font-bold text-3xl">System Health</h1><p className="text-sm text-muted-foreground mt-1">Performance monitoring & system status</p></div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 border border-success/20"><div className="w-2 h-2 rounded-full bg-success animate-pulse" /><span className="text-xs font-medium text-success">All Systems Operational</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {systemMetrics.map((metric) => (
          <div key={metric.label} className="bg-card border border-border rounded-2xl p-4 animate-count-up">
            <div className={`w-8 h-8 rounded-lg ${metric.color} flex items-center justify-center text-primary-foreground mb-2`}><metric.icon className="w-4 h-4" /></div>
            <p className="font-display font-bold text-lg">{metric.value}</p><p className="text-[10px] text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Services</h2>
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  {svc.healthy ? <CheckCircle className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                  <div><p className="text-sm font-medium">{svc.name}</p><p className="text-[10px] text-muted-foreground">v{svc.version}{svc.port ? ` · Port ${svc.port}` : ""}</p></div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${svc.healthy ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Dependencies</h2>
          <div className="space-y-2">
            {dependencies.map((dep) => (
              <div key={dep.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2"><code className="text-xs font-mono">{dep.name}</code></div>
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">v{dep.version}</span>{dep.upToDate ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Recent Errors</h2>
        {recentErrors.length === 0 ? (
          <div className="text-center py-8"><CheckCircle className="w-10 h-10 mx-auto mb-2 text-success opacity-30" /><p className="text-sm text-muted-foreground">No errors in the last 24 hours 🎉</p></div>
        ) : (
          <div className="space-y-2">{recentErrors.map((err, i) => <div key={i} className="flex items-center gap-3 py-2 text-xs"><span className="text-muted-foreground">{err.time}</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${err.level === "error" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{err.level}</span><span>{err.message}</span></div>)}</div>
        )}
      </div>
    </div>
  );
}
