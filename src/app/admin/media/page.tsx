"use client";

import { useState } from "react";
import { Image, Upload, Grid, List, Search, Trash2, Copy, Eye, FolderOpen, HardDrive } from "lucide-react";
import { toast } from "sonner";

interface MediaItem { id: string; name: string; type: "image" | "video"; url: string; size: string; dimensions: string; uploaded: string; usedIn: number; }

const demoMedia: MediaItem[] = [
  { id: "M-001", name: "galaxy-flagship-pro.jpg", type: "image", url: "/placeholder-product.jpg", size: "245 KB", dimensions: "800×800", uploaded: "Aug 15, 2026", usedIn: 3 },
  { id: "M-002", name: "aurora-ultrabook-14.jpg", type: "image", url: "/placeholder-product.jpg", size: "312 KB", dimensions: "800×800", uploaded: "Aug 14, 2026", usedIn: 2 },
  { id: "M-003", name: "pods-pro-anc.jpg", type: "image", url: "/placeholder-product.jpg", size: "189 KB", dimensions: "800×800", uploaded: "Aug 12, 2026", usedIn: 1 },
  { id: "M-004", name: "banner-eid-sale.jpg", type: "image", url: "/placeholder-banner.jpg", size: "520 KB", dimensions: "1920×600", uploaded: "Aug 10, 2026", usedIn: 1 },
  { id: "M-005", name: "smartwatch-lifestyle.jpg", type: "image", url: "/placeholder-product.jpg", size: "380 KB", dimensions: "1200×800", uploaded: "Aug 8, 2026", usedIn: 2 },
  { id: "M-006", name: "keyboard-rgb-demo.mp4", type: "video", url: "/placeholder-video.mp4", size: "4.2 MB", dimensions: "1920×1080", uploaded: "Aug 5, 2026", usedIn: 1 },
];

export default function MediaPage() {
  const [media] = useState(demoMedia);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const totalSize = "12.4 MB";
  const filtered = media.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-display font-bold text-3xl">Media Library</h1><p className="text-sm text-muted-foreground mt-1">{media.length} files · {totalSize} total</p></div>
        <button className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"><Upload className="w-4 h-4" /> Upload Files</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <div className="flex gap-1">
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-2 rounded-lg transition ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/30 transition cursor-pointer">
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse · Max 10MB per file</p>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div key={item.id} onClick={() => setSelectedMedia(item)} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition cursor-pointer group">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {item.type === "image" ? <Image className="w-8 h-8 text-muted-foreground" /> : <span className="text-2xl">🎬</span>}
                <div className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><Eye className="w-4 h-4 text-white" /></button>
                  <button className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); toast.success("URL copied!"); }}><Copy className="w-4 h-4 text-white" /></button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.size} · {item.dimensions}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">File</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Size</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Dimensions</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Uploaded</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Used</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition cursor-pointer" onClick={() => setSelectedMedia(item)}>
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><Image className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-medium text-xs truncate">{item.name}</span></div></td>
                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-muted-foreground">{item.size}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground">{item.dimensions}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">{item.uploaded}</td>
                  <td className="py-3 px-4 text-xs">{item.usedIn} products</td>
                  <td className="py-3 px-4 text-right"><div className="flex justify-end gap-1"><button className="p-1.5 hover:bg-accent rounded-lg" onClick={(e) => { e.stopPropagation(); toast.success("Copied!"); }}><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button><button className="p-1.5 hover:bg-destructive/10 rounded-lg" onClick={(e) => e.stopPropagation()}><Trash2 className="w-3.5 h-3.5 text-destructive" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">{selectedMedia.name}</h2>
              <button onClick={() => setSelectedMedia(null)} className="p-2 hover:bg-accent rounded-lg text-lg">×</button>
            </div>
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-4"><Image className="w-12 h-12 text-muted-foreground" /></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="capitalize">{selectedMedia.type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Size:</span><span>{selectedMedia.size}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dimensions:</span><span>{selectedMedia.dimensions}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Uploaded:</span><span>{selectedMedia.uploaded}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Used in:</span><span>{selectedMedia.usedIn} products</span></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { toast.success("URL copied!"); }} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition flex items-center justify-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy URL</button>
              <button className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
