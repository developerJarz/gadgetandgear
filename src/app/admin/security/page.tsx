"use client";

import { useState } from "react";
import { Shield, Key, Globe, Monitor, Clock, AlertTriangle, CheckCircle, Lock, Unlock, Search, Eye, EyeOff, Smartphone, Fingerprint } from "lucide-react";
import { toast } from "sonner";

const loginLogs = [
  { id: "LL-001", user: "admin@gadgethub.bd", role: "Admin", ip: "103.145.22.44", device: "Chrome / Windows", location: "Dhaka, BD", time: "Aug 18, 2026 11:30 PM", status: "Success" },
  { id: "LL-002", user: "manager@gadgethub.bd", role: "Manager", ip: "103.145.22.45", device: "Firefox / Mac", location: "Dhaka, BD", time: "Aug 18, 2026 10:15 PM", status: "Success" },
  { id: "LL-003", user: "unknown@test.com", role: "Unknown", ip: "45.33.12.88", device: "Chrome / Linux", location: "Unknown", time: "Aug 18, 2026 8:45 PM", status: "Failed" },
  { id: "LL-004", user: "staff@gadgethub.bd", role: "Staff", ip: "103.145.22.46", device: "Safari / iPhone", location: "Chattogram, BD", time: "Aug 18, 2026 6:20 PM", status: "Success" },
  { id: "LL-005", user: "admin@gadgethub.bd", role: "Admin", ip: "103.145.22.44", device: "Chrome / Windows", location: "Dhaka, BD", time: "Aug 17, 2026 9:00 AM", status: "Success" },
];

const activeSessions = [
  { id: "S-001", user: "System Admin", role: "Admin", device: "Chrome / Windows", ip: "103.145.22.44", location: "Dhaka", started: "2 hours ago", current: true },
  { id: "S-002", user: "Store Manager", role: "Manager", device: "Firefox / Mac", ip: "103.145.22.45", location: "Dhaka", started: "4 hours ago", current: false },
];

export default function SecurityPage() {
  const [tab, setTab] = useState<"overview" | "2fa" | "login-logs" | "sessions" | "ip">("overview");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const failedLogins = loginLogs.filter((l) => l.status === "Failed").length;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display font-bold text-3xl">Security Center</h1><p className="text-sm text-muted-foreground mt-1">Authentication, access control & threat monitoring</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Security Score", value: "85/100", icon: Shield, color: "gradient-brand" },
          { label: "2FA Status", value: twoFAEnabled ? "Enabled" : "Disabled", icon: Key, color: twoFAEnabled ? "bg-success" : "bg-warning" },
          { label: "Failed Logins (24h)", value: failedLogins.toString(), icon: AlertTriangle, color: failedLogins > 0 ? "bg-destructive" : "bg-success" },
          { label: "Active Sessions", value: activeSessions.length.toString(), icon: Monitor, color: "bg-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center text-primary-foreground mb-2`}><kpi.icon className="w-4 h-4" /></div>
            <p className="font-display font-bold text-xl">{kpi.value}</p><p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {([
          { key: "overview", label: "Overview", icon: Shield },
          { key: "2fa", label: "2FA Setup", icon: Fingerprint },
          { key: "login-logs", label: "Login Logs", icon: Clock },
          { key: "sessions", label: "Sessions", icon: Monitor },
          { key: "ip", label: "IP Control", icon: Globe },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}><t.icon className="w-4 h-4" /> {t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: "Two-Factor Authentication", desc: "Add an extra layer of security", enabled: twoFAEnabled, action: () => setTab("2fa") },
            { title: "Password Policy", desc: "Min 8 characters, uppercase, number", enabled: true },
            { title: "Login Rate Limiting", desc: "Max 5 failed attempts per 15 min", enabled: true },
            { title: "Session Timeout", desc: "Auto-logout after 30 min inactivity", enabled: true },
            { title: "IP Whitelisting", desc: "Restrict admin access by IP", enabled: false, action: () => setTab("ip") },
            { title: "SSL/TLS Encryption", desc: "All data encrypted in transit", enabled: true },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between">
              <div><h3 className="font-display font-semibold text-sm">{item.title}</h3><p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p></div>
              <div className="flex items-center gap-2">
                {item.enabled ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
                {item.action && <button onClick={item.action} className="text-xs text-primary hover:underline">Configure</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "2fa" && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-4"><Fingerprint className="w-6 h-6 text-primary" /><h2 className="font-display font-semibold text-lg">Two-Factor Authentication</h2></div>
          <p className="text-sm text-muted-foreground mb-4">Add TOTP-based two-factor authentication for enhanced security. Use apps like Google Authenticator or Authy.</p>
          <div className="bg-muted rounded-xl p-6 text-center mb-4"><div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center mb-3 border"><Key className="w-12 h-12 text-muted-foreground" /></div><p className="text-xs text-muted-foreground">QR code will appear here after enabling 2FA</p></div>
          <button onClick={() => { setTwoFAEnabled(!twoFAEnabled); toast.success(twoFAEnabled ? "2FA disabled" : "2FA enabled!"); }} className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${twoFAEnabled ? "border border-destructive text-destructive hover:bg-destructive/10" : "gradient-brand text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25"}`}>{twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}</button>
        </div>
      )}

      {tab === "login-logs" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">IP</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Device</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Location</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody>
              {loginLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-3 px-4"><p className="font-medium text-xs">{log.user}</p><p className="text-[10px] text-muted-foreground">{log.role}</p></td>
                  <td className="py-3 px-4 hidden md:table-cell font-mono text-xs">{log.ip}</td>
                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-muted-foreground">{log.device}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">{log.location}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{log.time}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${log.status === "Success" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "sessions" && (
        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div key={session.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.current ? "gradient-brand text-white" : "bg-muted"}`}><Monitor className="w-5 h-5" /></div>
                <div><p className="font-medium text-sm">{session.user} <span className="text-muted-foreground text-xs">({session.role})</span></p><p className="text-xs text-muted-foreground">{session.device} · {session.ip} · {session.location}</p><p className="text-[10px] text-muted-foreground">Started {session.started}</p></div>
              </div>
              <div className="flex items-center gap-2">{session.current ? <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-medium">Current</span> : <button onClick={() => toast.success("Session terminated!")} className="px-3 py-1.5 rounded-lg border border-destructive text-destructive text-xs font-medium hover:bg-destructive/10 transition">Force Logout</button>}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "ip" && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
          <h2 className="font-display font-semibold text-lg mb-4">IP Access Control</h2>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Whitelisted IPs (one per line)</label><textarea rows={4} defaultValue="103.145.22.44\n103.145.22.45" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Blacklisted IPs</label><textarea rows={3} defaultValue="45.33.12.88" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
            <button onClick={() => toast.success("IP rules saved!")} className="px-5 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Save IP Rules</button>
          </div>
        </div>
      )}
    </div>
  );
}
