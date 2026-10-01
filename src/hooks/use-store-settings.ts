"use client";

import { useEffect, useState } from "react";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  socialLinks?: Record<string, string>;
  branding?: { logo?: string; favicon?: string };
  contact?: { email?: string; phone?: string; whatsapp?: string; address?: string };
  header?: {
    showTopBar?: boolean;
    announcements?: string[];
    quickLinks?: { label: string; href: string }[];
    showPromoBadges?: boolean;
  };
  hero?: { image?: string; eyebrow?: string; title?: string; subtitle?: string; ctaLabel?: string; ctaHref?: string };
}

// One request per page load, shared by every component that asks.
let cache: StoreSettings | null = null;
let inflight: Promise<StoreSettings | null> | null = null;
const listeners = new Set<(s: StoreSettings) => void>();

function load(): Promise<StoreSettings | null> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          cache = data;
          listeners.forEach((l) => l(data));
        }
        return cache;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Store settings from the admin panel; null until loaded, so callers keep their defaults. */
export function useStoreSettings(): StoreSettings | null {
  const [settings, setSettings] = useState<StoreSettings | null>(cache);

  useEffect(() => {
    listeners.add(setSettings);
    load();
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  return settings;
}
