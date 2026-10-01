"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CloudUpload, Link2, Images, Loader2, X, RefreshCw, ExternalLink, CheckCircle2, AlertCircle, CloudCog,
} from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryDialog } from "./MediaLibraryDialog";
import { uploadFile, importLink, validateFile, UploadError } from "@/lib/upload-client";
import { cldFit, isCloudinaryUrl } from "@/lib/cloudinary-url";

type Mode = "upload" | "link" | "library";

interface MediaInputProps {
  value: string;
  onChange: (url: string) => void;
  /** Cloudinary sub-folder, e.g. "products", "brands". */
  folder?: string;
  label?: string;
  hint?: string;
  /** Preview shape. */
  aspect?: "square" | "wide" | "logo";
  id?: string;
}

const ASPECT_CLASS = {
  square: "aspect-square",
  wide: "aspect-[16/7]",
  logo: "aspect-[3/2]",
};

export function MediaInput({ value, onChange, folder, label, hint, aspect = "square", id }: MediaInputProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [editing, setEditing] = useState(!value);
  const [progress, setProgress] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState<{ message: string; allowRaw: boolean } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // A new value from outside (e.g. the form loaded a different record) closes the editor.
  useEffect(() => {
    if (value) setEditing(false);
  }, [value]);

  const showEditor = editing || !value;

  const commit = (url: string) => {
    onChange(url);
    setEditing(false);
    setLinkUrl("");
    setLinkError(null);
  };

  const handleFile = useCallback(
    async (file: File) => {
      const problem = validateFile(file);
      if (problem) {
        toast.error(problem);
        return;
      }
      abortRef.current = new AbortController();
      setProgress(0);
      try {
        const asset = await uploadFile(file, { folder, onProgress: setProgress, signal: abortRef.current.signal });
        commit(asset.url);
        toast.success("Uploaded to Cloudinary");
      } catch (e) {
        if ((e as Error).message !== "Upload cancelled.") toast.error((e as Error).message);
      } finally {
        setProgress(null);
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder]
  );

  const handleImport = async () => {
    const url = linkUrl.trim();
    if (!url) return;
    setLinkBusy(true);
    setLinkError(null);
    try {
      const asset = await importLink(url, folder);
      commit(asset.url);
      toast.success(asset.alreadyHosted ? "Already on Cloudinary" : "Imported to Cloudinary");
    } catch (e) {
      const err = e as UploadError;
      setLinkError({ message: err.message, allowRaw: !!err.allowRaw });
    } finally {
      setLinkBusy(false);
    }
  };

  const moveToCloudinary = async () => {
    setLinkBusy(true);
    try {
      const asset = await importLink(value, folder);
      onChange(asset.url);
      toast.success("Moved to Cloudinary");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLinkBusy(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData.files)[0];
    if (file) {
      e.preventDefault();
      handleFile(file);
      return;
    }
    const text = e.clipboardData.getData("text").trim();
    if (/^https?:\/\//i.test(text) && mode === "upload") {
      e.preventDefault();
      setMode("link");
      setLinkUrl(text);
    }
  };

  return (
    <div className="space-y-1.5" onPaste={onPaste}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground block">
          {label}
        </label>
      )}

      {!showEditor ? (
        /* ─── Current image ─── */
        <div className="flex gap-3 items-stretch p-2 rounded-xl border border-border bg-background">
          <div className={`${aspect === "wide" ? "w-36" : "w-20"} shrink-0 rounded-lg overflow-hidden bg-muted border border-border/60 ${ASPECT_CLASS[aspect]}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cldFit(value, 400)} alt="" className={`w-full h-full ${aspect === "logo" ? "object-contain p-2" : "object-cover"}`} />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
            <div>
              {isCloudinaryUrl(value) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hosted on Cloudinary
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning">
                  <AlertCircle className="w-3.5 h-3.5" /> External link
                </span>
              )}
              <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={value}>
                {value}
              </p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium hover:bg-accent transition">
                <RefreshCw className="w-3 h-3" /> Replace
              </button>
              {!isCloudinaryUrl(value) && !value.startsWith("/") && (
                <button
                  type="button"
                  onClick={moveToCloudinary}
                  disabled={linkBusy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 transition disabled:opacity-50"
                >
                  {linkBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudCog className="w-3 h-3" />} Move to Cloudinary
                </button>
              )}
              <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium hover:bg-accent transition">
                <ExternalLink className="w-3 h-3" /> Open
              </a>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-destructive hover:bg-destructive/10 transition"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Editor: upload / link / library ─── */
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="flex items-center border-b border-border bg-muted/40 p-1 gap-1" role="tablist">
            {([
              { key: "upload", label: "Upload", icon: CloudUpload },
              { key: "link", label: "Link", icon: Link2 },
              { key: "library", label: "Library", icon: Images },
            ] as const).map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={mode === t.key}
                onClick={() => (t.key === "library" ? setLibraryOpen(true) : setMode(t.key))}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  mode === t.key && t.key !== "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
            {value && (
              <button type="button" onClick={() => setEditing(false)} className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground" aria-label="Keep current image">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {mode === "upload" ? (
            progress !== null ? (
              <div className="p-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Uploading to Cloudinary
                  </span>
                  <span className="tabular-nums text-muted-foreground">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <button type="button" onClick={() => abortRef.current?.abort()} className="mt-3 text-[11px] text-muted-foreground hover:text-destructive">
                  Cancel upload
                </button>
              </div>
            ) : (
              <button
                id={id}
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
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                className={`w-full px-4 py-6 text-center transition focus-visible:outline-none focus-visible:bg-primary/5 ${
                  dragOver ? "bg-primary/10" : "hover:bg-accent/40"
                }`}
              >
                <CloudUpload className={`w-6 h-6 mx-auto mb-1.5 transition ${dragOver ? "text-primary scale-110" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium">{dragOver ? "Drop to upload" : "Drop an image, click to browse, or paste"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{hint || "JPG, PNG, WebP or SVG up to 10 MB"}</p>
              </button>
            )
          ) : (
            <div className="p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleImport();
                    }
                  }}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!linkUrl.trim() || linkBusy}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-brand text-primary-foreground text-xs font-medium disabled:opacity-40 transition"
                >
                  {linkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                  Import
                </button>
              </div>
              {linkError ? (
                <div className="text-[11px] text-destructive">
                  {linkError.message}
                  {linkError.allowRaw && (
                    <button type="button" onClick={() => commit(linkUrl.trim())} className="ml-1 font-semibold text-foreground underline underline-offset-2">
                      Use link as-is
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">The image is copied to Cloudinary so it stays fast and never breaks.</p>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <MediaLibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} onSelect={([url]) => url && commit(url)} />
    </div>
  );
}
