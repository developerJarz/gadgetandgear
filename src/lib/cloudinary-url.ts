/*
 * Client-safe helpers for Cloudinary delivery URLs. No secrets here.
 */

/** Inserts transformations after /upload/ in a Cloudinary URL. Non-Cloudinary URLs are returned unchanged. */
export function cldTransform(url: string | undefined | null, transform: string): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

/** Square-ish thumbnail with automatic format and quality. */
export function cldThumb(url: string | undefined | null, size = 160): string {
  return cldTransform(url, `c_fill,w_${size},h_${size},f_auto,q_auto`);
}

/** Width-bounded image with automatic format and quality. */
export function cldFit(url: string | undefined | null, width = 800): string {
  return cldTransform(url, `c_limit,w_${width},f_auto,q_auto`);
}

export function isCloudinaryUrl(url: string | undefined | null): boolean {
  return !!url && url.includes("res.cloudinary.com");
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
