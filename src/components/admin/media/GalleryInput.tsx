"use client";

import { useRef, useState } from "react";
import { CloudUpload, GripVertical, Images, Link2, Loader2, Star, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryDialog } from "./MediaLibraryDialog";
import { uploadFile, importLink, validateFile, UploadError } from "@/lib/upload-client";
import { cldThumb, isCloudinaryUrl } from "@/lib/cloudinary-url";

interface QueueItem {
  id: string;
  name: string;
  progress: number;
}

interface GalleryInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  max?: number;
  /** When provided, each image gets a "Make cover" action. */
  onSetCover?: (url: string) => void;
  coverUrl?: string;
}

export function GalleryInput({ value, onChange, folder, label, max = 12, onSetCover, coverUrl }: GalleryInputProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Keep the latest list so parallel uploads append instead of overwriting each other.
  const valueRef = useRef(value);
  valueRef.current = value;

  const remaining = max - value.length - queue.length;

  const append = (urls: string[]) => {
    const next = [...valueRef.current, ...urls.filter((u) => !valueRef.current.includes(u))].slice(0, max);
    valueRef.current = next;
    onChange(next);
  };

  const handleFiles = async (files: File[]) => {
    const accepted: File[] = [];
    for (const f of files) {
      const problem = validateFile(f);
      if (problem) toast.error(problem);
      else accepted.push(f);
    }
    const slots = Math.max(0, remaining);
    if (accepted.length > slots) toast.warning(`Only ${slots} more ${slots === 1 ? "image fits" : "images fit"} in this gallery.`);

    await Promise.all(
      accepted.slice(0, slots).map(async (file) => {
        const id = `${file.name}-${Math.random().toString(36).slice(2)}`;
        setQueue((q) => [...q, { id, name: file.name, progress: 0 }]);
        try {
          const asset = await uploadFile(file, {
            folder,
            onProgress: (p) => setQueue((q) => q.map((i) => (i.id === id ? { ...i, progress: p } : i))),
          });
          append([asset.url]);
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setQueue((q) => q.filter((i) => i.id !== id));
        }
      })
    );
  };

  const handleLink = async (allowRaw = false) => {
    const url = linkUrl.trim();
    if (!url) return;
    if (allowRaw) {
      append([url]);
      setLinkUrl("");
      return;
    }
    setLinkBusy(true);
    try {
      const asset = await importLink(url, folder);
      append([asset.url]);
      setLinkUrl("");
      toast.success("Imported to Cloudinary");
    } catch (e) {
      const err = e as UploadError;
      toast.error(err.message, err.allowRaw ? { action: { label: "Use as-is", onClick: () => handleLink(true) } } : undefined);
    } finally {
      setLinkBusy(false);
    }
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div
      className="space-y-1.5"
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.files);
        if (files.length) {
          e.preventDefault();
          handleFiles(files);
        }
      }}
    >
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {value.length}/{max}
          </span>
        </div>
      )}

      <div
        className={`rounded-xl border border-dashed p-2 transition ${dropActive ? "border-primary bg-primary/5" : "border-border"}`}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDropActive(true);
          }
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(e) => {
          if (e.dataTransfer.files.length) {
            e.preventDefault();
            setDropActive(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }
        }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (dragIndex !== null) {
                  e.preventDefault();
                  e.stopPropagation();
                  move(dragIndex, i);
                  setDragIndex(null);
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative aspect-square rounded-lg overflow-hidden bg-muted border transition ${
                dragIndex === i ? "opacity-40" : ""
              } ${coverUrl === url ? "border-primary ring-2 ring-primary/30" : "border-border/60"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cldThumb(url, 240)} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute top-1 left-1 p-0.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition cursor-grab" title="Drag to reorder">
                <GripVertical className="w-3 h-3" />
              </span>
              {!isCloudinaryUrl(url) && (
                <span className="absolute bottom-1 left-1 p-0.5 rounded bg-warning text-brand-dark" title="External link, not on Cloudinary">
                  <AlertCircle className="w-3 h-3" />
                </span>
              )}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                {onSetCover && coverUrl !== url && (
                  <button type="button" onClick={() => onSetCover(url)} className="p-1 rounded bg-black/60 text-white hover:bg-primary" title="Make cover image">
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((u) => u !== url))}
                  className="p-1 rounded bg-black/60 text-white hover:bg-destructive"
                  title="Remove from gallery"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {coverUrl === url && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-semibold">Cover</span>
              )}
            </div>
          ))}

          {queue.map((q) => (
            <div key={q.id} className="relative aspect-square rounded-lg bg-muted border border-border/60 flex flex-col items-center justify-center gap-1.5 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground truncate max-w-full">{q.name}</span>
              <div className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${q.progress}%` }} />
              </div>
            </div>
          ))}

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-lg border border-border/60 bg-background hover:bg-accent/50 hover:border-primary/40 transition flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <CloudUpload className="w-5 h-5" />
              <span className="text-[10px] font-medium">Upload</span>
            </button>
          )}
        </div>

        {remaining > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2 text-[11px]">
            <button type="button" onClick={() => setLinkOpen((o) => !o)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition ${linkOpen ? "bg-accent" : "hover:bg-accent"}`}>
              <Link2 className="w-3 h-3" /> Add by link
            </button>
            <button type="button" onClick={() => setLibraryOpen(true)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium hover:bg-accent transition">
              <Images className="w-3 h-3" /> From library
            </button>
            <span className="text-muted-foreground ml-auto hidden sm:inline">Drop or paste several images at once</span>
          </div>
        )}

        {linkOpen && remaining > 0 && (
          <div className="flex gap-2 mt-2">
            <input
              type="url"
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLink();
                }
              }}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => handleLink()}
              disabled={!linkUrl.trim() || linkBusy}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg gradient-brand text-primary-foreground text-xs font-medium disabled:opacity-40"
            >
              {linkBusy && <Loader2 className="w-3 h-3 animate-spin" />} Import
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
      <MediaLibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} multiple exclude={value} onSelect={append} />
    </div>
  );
}
