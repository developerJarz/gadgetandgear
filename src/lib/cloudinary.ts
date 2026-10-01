import crypto from "crypto";

/*
 * Server-only Cloudinary helpers. Uses the REST API directly (no SDK) so the
 * API secret never leaves the server. The browser uploads straight to
 * Cloudinary with a short-lived signature from /api/upload/sign.
 */

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  baseFolder: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type: "image" | "video" | "raw";
  bytes: number;
  url: string;
  secure_url: string;
  original_filename?: string;
  folder?: string;
  created_at?: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local.");
  }
  return {
    cloudName,
    apiKey,
    apiSecret,
    baseFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "gadget-gear",
  };
}

/** Folders are always nested under the base folder, e.g. "gadget-gear/products". */
export function resolveFolder(sub?: string): string {
  const { baseFolder } = getCloudinaryConfig();
  const clean = (sub || "general")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "")
    .replace(/\.\.+/g, "")
    .replace(/^\/+|\/+$/g, "");
  return `${baseFolder}/${clean || "general"}`;
}

/** Cloudinary signature: sorted key=value pairs joined by &, then the secret, SHA-1 hex. */
export function signParams(params: Record<string, string | number>): string {
  const { apiSecret } = getCloudinaryConfig();
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

/** Verifies the signature Cloudinary returns on an upload response, so clients can't register forged assets. */
export function verifyUploadSignature(result: Pick<CloudinaryUploadResult, "public_id" | "version" | "signature">): boolean {
  if (!result?.public_id || !result?.version || !result?.signature) return false;
  const expected = signParams({ public_id: result.public_id, version: result.version });
  const a = Buffer.from(expected);
  const b = Buffer.from(String(result.signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Upload a remote URL (or data URI) from the server. Cloudinary fetches the file itself. */
export async function uploadFromUrl(
  source: string,
  opts: { folder?: string; tags?: string[] } = {}
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = resolveFolder(opts.folder);
  const tags = (opts.tags || []).join(",");

  const signed: Record<string, string | number> = { folder, timestamp };
  if (tags) signed.tags = tags;

  const form = new FormData();
  form.append("file", source);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  if (tags) form.append("tags", tags);
  form.append("signature", signParams(signed));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Cloudinary upload failed (${res.status})`);
  }
  return data as CloudinaryUploadResult;
}

export async function destroyAsset(publicId: string, resourceType: "image" | "video" | "raw" = "image"): Promise<boolean> {
  const { cloudName, apiKey } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signParams({ public_id: publicId, timestamp }));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  return res.ok && (data.result === "ok" || data.result === "not found");
}

/** True when a URL is hosted on this account's Cloudinary delivery domain. */
export function isOwnCloudinaryUrl(url: string): boolean {
  try {
    const { cloudName } = getCloudinaryConfig();
    const u = new URL(url);
    return u.hostname === "res.cloudinary.com" && u.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
}
