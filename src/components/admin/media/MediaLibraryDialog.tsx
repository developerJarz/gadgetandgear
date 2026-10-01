"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ImageOff, Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cldThumb, formatBytes } from "@/lib/cloudinary-url";

interface LibraryItem {
  _id: string;
  url: string;
  originalFilename: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  resourceType: "image" | "video" | "raw";
}

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  /** Hide items already in use, e.g. images already in a gallery. */
  exclude?: string[];
}

export function MediaLibraryDialog({ open, onOpenChange, onSelect, multiple = false, exclude = [] }: MediaLibraryDialogProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/media?type=image&limit=60&search=${encodeURIComponent(debounced)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Couldn't load the library.");
        if (!cancelled) setItems(data.items || []);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, debounced]);

  useEffect(() => {
    if (!open) setSelected([]);
  }, [open]);

  const visible = useMemo(() => items.filter((i) => !exclude.includes(i.url)), [items, exclude]);

  const toggle = (url: string) => {
    if (!multiple) {
      onSelect([url]);
      onOpenChange(false);
      return;
    }
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <DialogTitle className="font-display text-lg">Media library</DialogTitle>
          <DialogDescription className="text-xs">
            Images already on Cloudinary. {multiple ? "Pick one or more." : "Pick one to use it."}
          </DialogDescription>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </DialogHeader>

        <div className="p-5 max-h-[55vh] overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : visible.length === 0 ? (
            <div className="py-12 text-center">
              <ImageOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{debounced ? "No files match that name" : "Nothing uploaded yet"}</p>
              <p className="text-xs text-muted-foreground mt-1">Close this and use Upload or Link to add an image.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {visible.map((item) => {
                const isSelected = selected.includes(item.url);
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => toggle(item.url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-muted text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected ? "border-primary" : "border-transparent hover:border-primary/40"
                    }`}
                    title={`${item.originalFilename}.${item.format} · ${formatBytes(item.bytes)}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cldThumb(item.url, 240)} alt={item.originalFilename} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-[10px] text-white truncate">
                      {item.width}×{item.height}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between gap-3 p-4 border-t border-border bg-muted/30">
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">
                Cancel
              </button>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => {
                  onSelect(selected);
                  onOpenChange(false);
                }}
                className="px-4 py-2 rounded-xl gradient-brand text-primary-foreground text-sm font-medium disabled:opacity-40 transition inline-flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add {selected.length || ""} {selected.length === 1 ? "image" : "images"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
