"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CloudUpload, Grid, List, Search, Trash2, Copy, Link2, Loader2, ImageOff, ExternalLink, X, Film,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile, importLink, validateFile, UploadError } from "@/lib/upload-client";
import { cldThumb, cldFit, formatBytes } from "@/lib/cloudinary-url";

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width: number;
  height: number;
  originalFilename: string;
  folder: string;
  source: "upload" | "link";
  sourceUrl: string;
  uploadedByName: string;
  createdAt: string;
}

interface QueueItem { id: string; name: string; progress: number }

const FOLDERS = ["all", "products", "brands", "categories", "branding", "banners", "general"];

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [usage, setUsage] = useState({ bytes: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [folder, setFolder] = useState("all");
  const [uploadFolder, setUploadFolder] = useState("general");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100", search: debounced, folder });
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.items);
      setUsage(data.usage);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't load media.");
    } finally {
      setLoading(false);
    }
  }, [debounced, folder]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (files: File[]) => {
    const accepted = files.filter((f) => {
      const problem = validateFile(f, { allowVideo: true });
      if (problem) toast.error(problem);
      return !problem;
    });
    if (!accepted.length) return;
    let done = 0;
    await Promise.all(
      accepted.map(async (file) => {
        const id = `${file.name}-${Math.random().toString(36).slice(2)}`;
        setQueue((q) => [...q, { id, name: file.name, progress: 0 }]);
        try {
          await uploadFile(file, {
            folder: uploadFolder,
            onProgress: (p) => setQueue((q) => q.map((i) => (i.id === id ? { ...i, progress: p } : i))),
          });
          done++;
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setQueue((q) => q.filter((i) => i.id !== id));
        }
      })
    );
    if (done) {
      toast.success(`${done} ${done === 1 ? "file" : "files"} uploaded to Cloudinary`);
      load();
    }
  };

  const handleImport = async () => {
    if (!linkUrl.trim()) return;
    setLinkBusy(true);
    try {
      const asset = await importLink(linkUrl.trim(), uploadFolder);
      toast.success(asset.alreadyHosted ? "That image is already on Cloudinary" : "Imported to Cloudinary");
      setLinkUrl("");
      load();
    } catch (e) {
      toast.error((e as UploadError).message);
    } finally {
      setLinkBusy(false);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media/${selected._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't delete the file.");
      setItems((list) => list.filter((i) => i._id !== selected._id));
      setUsage((u) => ({ bytes: u.bytes - selected.bytes, count: u.count - 1 }));
      toast.success("Deleted from Cloudinary");
      setSelected(null);
      setConfirmDelete(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="space-y-6"
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.files);
        if (files.length) handleFiles(files);
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {usage.count} files on Cloudinary · {formatBytes(usage.bytes)}
          </p>
        </div>
        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <CloudUpload className="w-4 h-4" /> Upload files
        </button>
      </div>

      {/* Upload + link import */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
        >
          <CloudUpload className={`w-7 h-7 mx-auto mb-2 transition ${dragOver ? "text-primary scale-110" : "text-muted-foreground"}`} />
          <p className="text-sm font-medium">{dragOver ? "Drop to upload" : "Drop files here, click to browse, or paste"}</p>
          <p className="text-xs text-muted-foreground mt-1">Images up to 10 MB · Videos up to 100 MB</p>
        </button>

        <div className="rounded-2xl border border-border p-4 space-y-3 bg-card">
          <div>
            <label htmlFor="upload-folder" className="text-xs font-medium text-muted-foreground block mb-1.5">Save new files to</label>
            <select id="upload-folder" value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring capitalize">
              {FOLDERS.filter((f) => f !== "all").map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="import-link" className="text-xs font-medium text-muted-foreground block mb-1.5">Import from a link</label>
            <div className="flex gap-2">
              <input
                id="import-link"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImport()}
                placeholder="https://…/image.jpg"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={handleImport} disabled={!linkUrl.trim() || linkBusy} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent disabled:opacity-40 transition">
                {linkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {queue.map((q) => (
            <div key={q.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              <span className="truncate flex-1">{q.name}</span>
              <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${q.progress}%` }} />
              </div>
              <span className="w-9 text-right tabular-nums text-xs text-muted-foreground">{q.progress}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file name" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => setFolder(f)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium border capitalize transition ${folder === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
              {f === "all" ? "All folders" : f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 sm:ml-auto">
          <button onClick={() => setView("grid")} aria-pressed={view === "grid"} aria-label="Grid view" className={`p-2 rounded-lg transition ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} aria-pressed={view === "list"} aria-label="List view" className={`p-2 rounded-lg transition ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-border bg-card">
          <ImageOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="font-medium">{debounced || folder !== "all" ? "No files match" : "No files yet"}</p>
          <p className="text-sm text-muted-foreground mt-1">Upload or import an image and it will appear here.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <button key={item._id} onClick={() => setSelected(item)} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {item.resourceType === "image" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={cldThumb(item.url, 300)} alt={item.originalFilename} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <Film className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate">{item.originalFilename}.{item.format}</p>
                <p className="text-[10px] text-muted-foreground">{formatBytes(item.bytes)} · {item.width}×{item.height}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">File</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Size</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Dimensions</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Folder</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Added</th>
                  <th className="text-right py-3 px-4 font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-2 px-4">
                      <button onClick={() => setSelected(item)} className="flex items-center gap-2.5 text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cldThumb(item.url, 64)} alt="" className="w-8 h-8 rounded-md object-cover bg-muted" loading="lazy" />
                        <span className="font-medium text-xs truncate max-w-[220px]">{item.originalFilename}.{item.format}</span>
                      </button>
                    </td>
                    <td className="py-2 px-4 hidden sm:table-cell text-xs text-muted-foreground">{formatBytes(item.bytes)}</td>
                    <td className="py-2 px-4 hidden md:table-cell text-xs text-muted-foreground">{item.width}×{item.height}</td>
                    <td className="py-2 px-4 hidden md:table-cell text-xs text-muted-foreground capitalize">{item.folder.split("/").pop()}</td>
                    <td className="py-2 px-4 hidden lg:table-cell text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()} · {item.uploadedByName}</td>
                    <td className="py-2 px-4 text-right">
                      <button className="p-1.5 hover:bg-accent rounded-lg" onClick={() => copy(item.url)} aria-label="Copy link"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => !deleting && (setSelected(null), setConfirmDelete(false))}>
          <div role="dialog" aria-modal="true" aria-labelledby="media-title" className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up overflow-hidden grid md:grid-cols-[1fr_260px]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-muted flex items-center justify-center min-h-[240px] max-h-[70vh]">
              {selected.resourceType === "video" ? (
                <video src={selected.url} controls className="max-h-[70vh] w-full" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={cldFit(selected.url, 1000)} alt={selected.originalFilename} className="max-h-[70vh] w-full object-contain" />
              )}
            </div>
            <div className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h2 id="media-title" className="font-display font-semibold text-base break-all">{selected.originalFilename}.{selected.format}</h2>
                <button onClick={() => (setSelected(null), setConfirmDelete(false))} className="p-1 hover:bg-accent rounded-lg shrink-0" aria-label="Close"><X className="w-4 h-4" /></button>
              </div>
              <dl className="mt-4 space-y-2 text-xs">
                {[
                  ["Size", formatBytes(selected.bytes)],
                  ["Dimensions", `${selected.width}×${selected.height}`],
                  ["Folder", selected.folder],
                  ["Added by", selected.uploadedByName],
                  ["Added", new Date(selected.createdAt).toLocaleString()],
                  ["Source", selected.source === "link" ? "Imported link" : "Upload"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right truncate">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto pt-5 space-y-2">
                <button onClick={() => copy(selected.url)} className="w-full py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition inline-flex items-center justify-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy link</button>
                <a href={selected.url} target="_blank" rel="noreferrer" className="w-full py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition inline-flex items-center justify-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Open original</a>
                {confirmDelete ? (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs">Delete from Cloudinary? Products using this image will show a broken picture.</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent">Keep</button>
                      <button onClick={handleDelete} disabled={deleting} className="flex-1 py-1.5 rounded-lg bg-destructive text-white text-xs font-medium disabled:opacity-60">{deleting ? "Deleting…" : "Delete"}</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className="w-full py-2 rounded-xl text-destructive text-sm font-medium hover:bg-destructive/10 transition inline-flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
