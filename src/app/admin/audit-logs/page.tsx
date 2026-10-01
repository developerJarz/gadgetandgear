"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Search, Download, Package, ShoppingCart, Settings, Shield, Tag, FolderOpen, Image as ImageIcon,
  LogIn, LogOut, ShieldAlert, Plus, Pencil, Trash2, CloudUpload, Users, AlertTriangle, X, Monitor,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatDistanceToNowStrict, format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

interface Log {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  entityName?: string;
  performedByName: string;
  performedByRole?: string;
  details: string;
  changes?: Record<string, { from: unknown; to: unknown }> | null;
  severity?: "info" | "warning" | "critical";
  ip: string;
  userAgent?: string;
  createdAt: string;
  fresh?: boolean;
}

interface Stats {
  total: number;
  severity: { info: number; warning: number; critical: number };
  failedLogins: number;
  onlineNow: string[];
  byEntity: { entity: string; count: number }[];
  byUser: { name: string; role?: string; count: number; lastSeen: string }[];
  series: { bucket: string; total: number; warnings: number }[];
  filters: { actions: string[]; entities: string[]; users: string[] };
}

type Range = "24h" | "7d" | "30d";

const VERBS: Record<string, string> = {
  create: "created", update: "updated", delete: "deleted", login: "signed in", logout: "signed out",
  login_failed: "failed to sign in", upload: "uploaded",
};
const ACTION_ICON: Record<string, React.ElementType> = {
  create: Plus, update: Pencil, delete: Trash2, login: LogIn, logout: LogOut, login_failed: ShieldAlert, upload: CloudUpload,
};
const ENTITY_ICON: Record<string, React.ElementType> = {
  Product: Package, Order: ShoppingCart, Settings, Staff: Shield, Brand: Tag, Category: FolderOpen, Media: ImageIcon,
};
const ENTITY_LINK: Record<string, string> = {
  Product: "/admin/products", Brand: "/admin/brands", Category: "/admin/categories", Media: "/admin/media",
  Settings: "/admin/settings", Staff: "/admin/staff", Order: "/admin/orders",
};
const SEVERITY_STYLE = {
  info: "bg-muted text-muted-foreground",
  warning: "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};

const selectClass = "px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function dayLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, d MMM yyyy");
}

function deviceFrom(ua?: string) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

const show = (v: unknown) => {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

export default function ActivityMonitorPage() {
  const [range, setRange] = useState<Range>("24h");
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [live, setLive] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [action, setAction] = useState("all");
  const [entity, setEntity] = useState("all");
  const [user, setUser] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [selected, setSelected] = useState<Log | null>(null);
  const newestRef = useRef<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const rangeStart = useMemo(() => {
    const ms = { "24h": 24 * 3600e3, "7d": 7 * 24 * 3600e3, "30d": 30 * 24 * 3600e3 }[range];
    return new Date(Date.now() - ms).toISOString();
  }, [range]);

  const query = useCallback(
    (extra: Record<string, string> = {}) =>
      new URLSearchParams({ action, entity, user, severity, search: debounced, from: rangeStart, limit: "50", ...extra }).toString(),
    [action, entity, user, severity, debounced, rangeStart]
  );

  const loadStats = useCallback(async () => {
    const res = await fetch(`/api/audit-logs/stats?range=${range}`);
    if (res.ok) setStats(await res.json());
  }, [range]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?${query({ page: "1" })}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load activity.");
      setLogs(data.logs);
      setTotal(data.total);
      setPage(1);
      newestRef.current = data.logs[0]?.createdAt || new Date().toISOString();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Live mode: poll for newer entries while the tab is visible.
  useEffect(() => {
    if (!live) return;
    const poll = async () => {
      if (document.hidden || !newestRef.current) return;
      try {
        const res = await fetch(`/api/audit-logs?${query({ since: newestRef.current })}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.logs.length) {
          newestRef.current = data.logs[0].createdAt;
          const fresh = data.logs.map((l: Log) => ({ ...l, fresh: true }));
          setLogs((prev) => [...fresh, ...prev.filter((p) => !fresh.some((f: Log) => f._id === p._id))]);
          setTotal((t) => t + data.logs.length);
          setTimeout(() => setLogs((prev) => prev.map((l) => (l.fresh ? { ...l, fresh: false } : l))), 4000);
          loadStats();
        }
      } catch {}
    };
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, [live, query, loadStats]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/audit-logs?${query({ page: String(page + 1) })}`);
      const data = await res.json();
      setLogs((prev) => [...prev, ...data.logs]);
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: { label: string; items: Log[] }[] = [];
    for (const log of logs) {
      const label = dayLabel(new Date(log.createdAt));
      const last = groups[groups.length - 1];
      if (last?.label === label) last.items.push(log);
      else groups.push({ label, items: [log] });
    }
    return groups;
  }, [logs]);

  const filtersActive = action !== "all" || entity !== "all" || user !== "all" || severity !== "all" || debounced;
  const maxEntity = Math.max(1, ...(stats?.byEntity.map((e) => e.count) || [1]));

  const exportCsv = () => {
    exportToCSV(
      logs.map((l) => ({
        Time: new Date(l.createdAt).toISOString(),
        Person: l.performedByName,
        Role: l.performedByRole || "",
        Action: l.action,
        Area: l.entity,
        Item: l.entityName || l.entityId,
        Details: l.details,
        Severity: l.severity || "info",
        IP: l.ip,
      })),
      `activity_${range}`
    );
    toast.success(`Exported ${logs.length} entries`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Activity monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Who changed what in your store, and when.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-xl bg-muted" role="tablist" aria-label="Time range">
            {(["24h", "7d", "30d"] as Range[]).map((r) => (
              <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${range === r ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {r === "24h" ? "24 hours" : r === "7d" ? "7 days" : "30 days"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setLive((l) => !l)}
            aria-pressed={live}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${live ? "border-success/40 bg-success/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent"}`}
          >
            <span className="relative flex w-2 h-2">
              {live && <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping motion-reduce:hidden" />}
              <span className={`relative inline-flex w-2 h-2 rounded-full ${live ? "bg-success" : "bg-muted-foreground"}`} />
            </span>
            {live ? "Live" : "Paused"}
          </button>
          <button onClick={exportCsv} disabled={!logs.length} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent transition disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Actions", value: stats?.total, icon: Activity, tone: "text-primary" },
          { label: "Online now", value: stats?.onlineNow.length, icon: Users, tone: "text-success", title: stats?.onlineNow.join(", ") },
          { label: "Warnings", value: stats ? stats.severity.warning + stats.severity.critical : undefined, icon: AlertTriangle, tone: "text-warning", onClick: () => setSeverity("warning") },
          { label: "Failed sign-ins", value: stats?.failedLogins, icon: ShieldAlert, tone: "text-destructive", onClick: () => setAction("login_failed") },
        ].map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            disabled={!s.onClick}
            title={s.title}
            className="text-left bg-card border border-border rounded-2xl p-4 enabled:hover:border-primary/30 transition disabled:cursor-default"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.icon className={`w-3.5 h-3.5 ${s.tone}`} /> {s.label}
            </div>
            <p className="font-display font-bold text-2xl mt-1 tabular-nums">{s.value ?? <span className="inline-block w-10 h-6 rounded bg-muted animate-pulse align-middle" />}</p>
          </button>
        ))}
      </div>

      {/* Timeline chart */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Activity over time</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /> All actions</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-warning" /> Warnings</span>
          </div>
        </div>
        <div className="h-36">
          {stats ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.series} barGap={-10} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="bucket"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(b: string) => (range === "24h" ? b.slice(11, 16) : format(new Date(b), "d MMM"))}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  labelFormatter={(b: string) => (range === "24h" ? `${b.slice(11, 16)} · ${format(new Date(b.slice(0, 10)), "d MMM")}` : format(new Date(b), "EEE d MMM"))}
                  formatter={(v: number, name: string) => [v, name === "total" ? "Actions" : "Warnings"]}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
                <Bar dataKey="warnings" fill="var(--warning)" radius={[4, 4, 0, 0]} maxBarSize={10} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl bg-muted animate-pulse" />
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Feed */}
        <div className="space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search details, item, person or IP" className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className={selectClass}>
                <option value="all">Any action</option>
                {stats?.filters.actions.map((a) => <option key={a} value={a}>{VERBS[a] ? VERBS[a].charAt(0).toUpperCase() + VERBS[a].slice(1) : a}</option>)}
              </select>
              <select aria-label="Area" value={entity} onChange={(e) => setEntity(e.target.value)} className={selectClass}>
                <option value="all">Any area</option>
                {stats?.filters.entities.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select aria-label="Person" value={user} onChange={(e) => setUser(e.target.value)} className={selectClass}>
                <option value="all">Anyone</option>
                {stats?.filters.users.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select aria-label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)} className={selectClass}>
                <option value="all">Any level</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{loading ? "Loading…" : `${total.toLocaleString()} ${total === 1 ? "entry" : "entries"} in this range`}</span>
            {filtersActive && (
              <button onClick={() => { setSearch(""); setAction("all"); setEntity("all"); setUser("all"); setSeverity("all"); }} className="text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-14 text-center bg-card border border-border rounded-2xl">
              <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">{filtersActive ? "Nothing matches these filters" : "No activity in this range"}</p>
              <p className="text-sm text-muted-foreground mt-1">{filtersActive ? "Try a wider time range or clear the filters." : "Changes to products, settings and media will show up here as they happen."}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map((g) => (
                <div key={g.label}>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 sticky top-14 z-10 bg-background/90 backdrop-blur py-1">{g.label}</h3>
                  <ol className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                    {g.items.map((log) => {
                      const Icon = ACTION_ICON[log.action] || ENTITY_ICON[log.entity] || Activity;
                      const sev = log.severity || "info";
                      return (
                        <li key={log._id}>
                          <button
                            onClick={() => setSelected(log)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/40 transition-colors ${log.fresh ? "bg-primary/5" : ""}`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${SEVERITY_STYLE[sev]}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm leading-snug">
                                <span className="font-semibold">{log.performedByName}</span>{" "}
                                <span className="text-muted-foreground">{VERBS[log.action] || log.action}</span>{" "}
                                {log.action !== "login" && log.action !== "logout" && log.action !== "login_failed" && (
                                  <>
                                    <span className="text-muted-foreground">{log.entity.toLowerCase()}</span>{" "}
                                    {log.entityName && <span className="font-medium">{log.entityName}</span>}
                                  </>
                                )}
                              </span>
                              {log.details && <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-1">{log.details}</span>}
                            </span>
                            <span className="text-right shrink-0">
                              <time dateTime={log.createdAt} title={new Date(log.createdAt).toLocaleString()} className="block text-[11px] text-muted-foreground tabular-nums">
                                {formatDistanceToNowStrict(new Date(log.createdAt), { addSuffix: true })}
                              </time>
                              {log.fresh && <span className="text-[10px] font-semibold text-primary">New</span>}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
              {logs.length < total && (
                <button onClick={loadMore} disabled={loadingMore} className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition disabled:opacity-50">
                  {loadingMore ? "Loading…" : `Show more (${(total - logs.length).toLocaleString()} left)`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Side panels */}
        <aside className="space-y-4 xl:sticky xl:top-20">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3">Most active people</h3>
            {stats?.byUser.length ? (
              <ul className="space-y-2.5">
                {stats.byUser.map((u) => {
                  const online = stats.onlineNow.includes(u.name);
                  return (
                    <li key={u.name}>
                      <button onClick={() => setUser(user === u.name ? "all" : u.name)} className={`w-full flex items-center gap-2.5 text-left rounded-lg -mx-1 px-1 py-0.5 transition ${user === u.name ? "bg-primary/10" : "hover:bg-accent/50"}`}>
                        <span className="relative w-8 h-8 rounded-full gradient-brand text-primary-foreground text-xs font-bold flex items-center justify-center uppercase shrink-0">
                          {u.name.charAt(0)}
                          {online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" title="Active in the last 15 minutes" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{u.name}</span>
                          <span className="block text-[11px] text-muted-foreground truncate">
                            {u.role ? `${u.role} · ` : ""}{formatDistanceToNowStrict(new Date(u.lastSeen), { addSuffix: true })}
                          </span>
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">{u.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No staff activity in this range.</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3">By area</h3>
            {stats?.byEntity.length ? (
              <ul className="space-y-2">
                {stats.byEntity.map((e) => {
                  const Icon = ENTITY_ICON[e.entity] || Activity;
                  return (
                    <li key={e.entity}>
                      <button onClick={() => setEntity(entity === e.entity ? "all" : e.entity)} className={`w-full text-left rounded-lg -mx-1 px-1 py-1 transition ${entity === e.entity ? "bg-primary/10" : "hover:bg-accent/50"}`}>
                        <span className="flex items-center justify-between text-xs mb-1">
                          <span className="inline-flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-muted-foreground" /> {e.entity}</span>
                          <span className="tabular-nums text-muted-foreground">{e.count}</span>
                        </span>
                        <span className="block h-1.5 rounded-full bg-muted overflow-hidden">
                          <span className="block h-full rounded-full bg-primary/70" style={{ width: `${(e.count / maxEntity) * 100}%` }} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Nothing yet.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Detail */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 gap-0 flex flex-col">
          {selected && (
            <>
              <div className="p-5 border-b border-border">
                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${SEVERITY_STYLE[selected.severity || "info"]}`}>{selected.severity || "info"}</span>
                <SheetTitle className="font-display text-lg mt-2 pr-6">
                  {selected.performedByName} {VERBS[selected.action] || selected.action} {!["login", "logout", "login_failed"].includes(selected.action) && selected.entity.toLowerCase()}
                </SheetTitle>
                <SheetDescription className="text-xs">{format(new Date(selected.createdAt), "EEEE d MMM yyyy, h:mm:ss a")}</SheetDescription>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                {selected.details && <p className="text-sm">{selected.details}</p>}

                {selected.changes && Object.keys(selected.changes).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">What changed</h4>
                    <div className="rounded-xl border border-border overflow-hidden text-xs">
                      {Object.entries(selected.changes).map(([field, c]) => (
                        <div key={field} className="grid grid-cols-[90px_1fr] border-b border-border last:border-0">
                          <span className="px-3 py-2 bg-muted/50 font-medium break-words">{field}</span>
                          <span className="px-3 py-2 space-y-1 min-w-0">
                            <span className="block text-destructive line-through break-words">{show(c.from)}</span>
                            <span className="block text-success break-words">{show(c.to)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <dl className="text-xs space-y-2">
                  {[
                    ["Person", `${selected.performedByName}${selected.performedByRole ? ` (${selected.performedByRole})` : ""}`],
                    ["Area", selected.entity],
                    ["Item", selected.entityName || selected.entityId || "—"],
                    ["IP address", selected.ip || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right break-all">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Device</dt>
                    <dd className="text-right inline-flex items-center gap-1"><Monitor className="w-3 h-3" /> {deviceFrom(selected.userAgent)}</dd>
                  </div>
                </dl>
              </div>
              <div className="p-4 border-t border-border flex gap-2">
                {ENTITY_LINK[selected.entity] && selected.action !== "delete" && (
                  <a href={ENTITY_LINK[selected.entity]} className="flex-1 text-center py-2 rounded-xl gradient-brand text-primary-foreground text-sm font-medium">Open {selected.entity.toLowerCase()}s</a>
                )}
                <button onClick={() => { setUser(selected.performedByName); setSelected(null); }} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent">
                  More from {selected.performedByName.split(" ")[0]}
                </button>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl border border-border hover:bg-accent sm:hidden" aria-label="Close"><X className="w-4 h-4" /></button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <span className="sr-only" aria-live="polite">{live ? "Live updates on" : "Live updates paused"}</span>
    </div>
  );
}
