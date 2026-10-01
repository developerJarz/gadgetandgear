"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminPrefs {
  sidebar: "full" | "rail";
  density: "comfortable" | "compact";
  reduceMotion: boolean;
}

const KEY = "gh_admin_prefs";
const EVENT = "gh-admin-prefs";
const DEFAULTS: AdminPrefs = { sidebar: "full", density: "comfortable", reduceMotion: false };

function read(): AdminPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Per-browser admin panel preferences, kept in sync across components. */
export function useAdminPrefs() {
  const [prefs, setState] = useState<AdminPrefs>(DEFAULTS);

  useEffect(() => {
    setState(read());
    const sync = () => setState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setPrefs = useCallback((patch: Partial<AdminPrefs>) => {
    const next = { ...read(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setState(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { prefs, setPrefs };
}
