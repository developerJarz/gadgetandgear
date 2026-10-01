"use client";

/*
 * Browser side of the Cloudinary pipeline:
 *   1. ask our API for a signature        (/api/upload/sign)
 *   2. upload the file straight to Cloudinary with XHR progress
 *   3. register the verified result        (/api/media)
 */

export interface UploadedAsset {
  _id?: string;
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resourceType?: "image" | "video" | "raw";
  originalFilename?: string;
  alreadyHosted?: boolean;
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export class UploadError extends Error {
  allowRaw: boolean;
  constructor(message: string, allowRaw = false) {
    super(message);
    this.allowRaw = allowRaw;
  }
}

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file: File, opts: { allowVideo?: boolean } = {}): string | null {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !(opts.allowVideo && isVideo)) {
    return `${file.name} isn't an image${opts.allowVideo ? " or video" : ""}. Use JPG, PNG, WebP, SVG or GIF.`;
  }
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${max / 1024 / 1024} MB.`;
  }
  return null;
}

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new UploadError("Your session has expired. Sign in again to upload.");
    throw new UploadError(data.error || `Request failed (${res.status})`, !!data.allowRaw);
  }
  return data;
}

export async function uploadFile(
  file: File,
  opts: { folder?: string; onProgress?: (pct: number) => void; signal?: AbortSignal } = {}
): Promise<UploadedAsset> {
  const sign = await readJson(
    await fetch("/api/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: opts.folder }),
    })
  );

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("folder", sign.folder);
  form.append("signature", sign.signature);

  const result = await new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", sign.uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: any = {};
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new UploadError(data?.error?.message || `Cloudinary rejected ${file.name} (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new UploadError("Upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new UploadError("Upload cancelled."));
    opts.signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });

  return readJson(
    await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "direct", result }),
    })
  );
}

/** Imports a remote image into Cloudinary. Throws UploadError with allowRaw when the site blocks fetching. */
export async function importLink(url: string, folder?: string): Promise<UploadedAsset> {
  return readJson(
    await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "link", url, folder }),
    })
  );
}
