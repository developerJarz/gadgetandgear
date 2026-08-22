"use client";

import { useState } from "react";
import { Database, Download, Upload, Clock, CheckCircle, AlertTriangle, HardDrive, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

const backupHistory = [
  { id: "BK-001", type: "Full Backup", size: "12.4 MB", collections: 8, date: "Aug 18, 2026 12:00 AM", status: "Completed", auto: true },
  { id: "BK-002", type: "Full Backup", size: "12.1 MB", collections: 8, date: "Aug 17, 2026 12:00 AM", status: "Completed", auto: true },
  { id: "BK-003", type: "Manual Backup", size: "12.0 MB", collections: 8, date: "Aug 16, 2026 3:45 PM", status: "Completed", auto: false },
  { id: "BK-004", type: "Full Backup", size: "11.8 MB", collections: 8, date: "Aug 16, 2026 12:00 AM", status: "Completed", auto: true },
  { id: "BK-005", type: "Full Backup", size: "11.5 MB", collections: 8, date: "Aug 15, 2026 12:00 AM", status: "Completed", auto: true },
];

export default function BackupPage() {
  const [backing, setBacking] = useState(false);

  const handleBackup = () => {
    setBacking(true);
    setTimeout(() => { setBacking(false); toast.success("Backup completed successfully!"); }, 2000);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display font-bold text-3xl">Backup & Recovery</h1><p className="text-sm text-muted-foreground mt-1">Database backups, restore points & disaster recovery</p></div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white mb-3"><Database className="w-5 h-5" /></div>
          <p className="font-display font-bold text-xl">{backupHistory.length}</p><p className="text-[10px] text-muted-foreground">Total Backups</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center text-white mb-3"><HardDrive className="w-5 h-5" /></div>
          <p className="font-display font-bold text-xl">12.4 MB</p><p className="text-[10px] text-muted-foreground">Latest Backup Size</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center text-white mb-3"><Clock className="w-5 h-5" /></div>
          <p className="font-display font-bold text-xl">{backupHistory[0].date.split(",")[0]}</p><p className="text-[10px] text-muted-foreground">Last Backup</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Manual Backup</h2>
          <p className="text-sm text-muted-foreground mb-4">Create a full backup of all MongoDB collections (Products, Orders, Users, Staff, Coupons, Settings, etc.)</p>
          <button onClick={handleBackup} disabled={backing} className="w-full py-3 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2">
            {backing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating Backup...</> : <><Database className="w-4 h-4" /> Create Backup Now</>}
          </button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Auto Backup Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2"><span className="text-sm">Daily backup at midnight</span><span className="w-10 h-6 rounded-full bg-primary flex items-center justify-end px-0.5"><span className="w-5 h-5 rounded-full bg-white shadow" /></span></div>
            <div className="flex items-center justify-between py-2"><span className="text-sm">Keep last 30 days</span><span className="text-xs text-muted-foreground">30 backups</span></div>
            <div className="flex items-center justify-between py-2"><span className="text-sm">Email notification on failure</span><span className="w-10 h-6 rounded-full bg-primary flex items-center justify-end px-0.5"><span className="w-5 h-5 rounded-full bg-white shadow" /></span></div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="font-display font-semibold text-lg">Backup History</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Backup</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Size</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody>
              {backupHistory.map((bk) => (
                <tr key={bk.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{bk.id}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${bk.auto ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>{bk.type}</span></td>
                  <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground text-xs">{bk.size} · {bk.collections} collections</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-xs">{bk.date}</td>
                  <td className="py-3 px-4"><span className="flex items-center gap-1 text-xs text-success"><CheckCircle className="w-3.5 h-3.5" /> {bk.status}</span></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => toast.success("Backup downloaded!")} className="p-1.5 hover:bg-accent rounded-lg"><Download className="w-3.5 h-3.5 text-primary" /></button>
                      <button onClick={() => toast.info("Restore initiated...")} className="p-1.5 hover:bg-accent rounded-lg"><Upload className="w-3.5 h-3.5 text-warning" /></button>
                      <button className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
