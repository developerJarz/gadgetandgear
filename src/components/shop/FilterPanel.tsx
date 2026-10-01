"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Check, ChevronDown, Search, Star } from "lucide-react";
import { OFFICIAL_BRANDS } from "@/lib/site-data";
import { BrandLogo } from "@/components/BrandLogo";
import {
  DISCOUNT_STEPS, PRICE_BANDS, RATING_STEPS, TAGS, formatTaka,
  type FacetCounts, type ShopState,
} from "@/lib/shop-filters";

interface FilterPanelProps {
  state: ShopState;
  counts: FacetCounts;
  onChange: (patch: Partial<ShopState>) => void;
  /** Brands to list: catalog brands, plus anything selected. */
  brandNames: string[];
}

function Section({ title, summary, defaultOpen = true, children }: { title: string; summary?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-border py-4 first:pt-0 last:border-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-2 text-left">
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-2 min-w-0">
          {summary && <span className="text-xs text-primary truncate">{summary}</span>}
          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CheckRow({ checked, disabled, onToggle, count, children }: { checked: boolean; disabled?: boolean; onToggle: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled && !checked}
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-lg text-sm text-left hover:bg-accent/50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <span className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"}`}>
        {checked && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
      <span className="flex-1 min-w-0 flex items-center gap-2">{children}</span>
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

function Pill({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled && !active}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
        active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40 bg-background"
      }`}
    >
      {children}
    </button>
  );
}

/* Price: two-thumb slider + typed inputs + quick bands. Commits on release so the grid doesn't thrash. */
function PriceFilter({ state, counts, onChange }: Pick<FilterPanelProps, "state" | "counts" | "onChange">) {
  const [lo, hi] = counts.priceBounds;
  const floor = Math.floor(lo / 500) * 500;
  const ceil = Math.max(floor + 500, Math.ceil(hi / 500) * 500);
  const current: [number, number] = [state.min ?? floor, state.max ?? ceil];
  const [draft, setDraft] = useState<[number, number]>(current);

  useEffect(() => setDraft([state.min ?? floor, state.max ?? ceil]), [state.min, state.max, floor, ceil]);

  const commit = ([a, b]: [number, number]) =>
    onChange({ min: a <= floor ? null : Math.round(a), max: b >= ceil ? null : Math.round(b) });

  return (
    <div className="space-y-4">
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center h-5"
        min={floor}
        max={ceil}
        step={500}
        minStepsBetweenThumbs={1}
        value={draft}
        onValueChange={(v) => setDraft([v[0], v[1]])}
        onValueCommit={(v) => commit([v[0], v[1]])}
        aria-label="Price range"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {["Minimum price", "Maximum price"].map((label) => (
          <SliderPrimitive.Thumb
            key={label}
            aria-label={label}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-110"
          />
        ))}
      </SliderPrimitive.Root>

      <div className="grid grid-cols-2 gap-2">
        {(["min", "max"] as const).map((key, i) => (
          <label key={key} className="block">
            <span className="text-[11px] text-muted-foreground">{key === "min" ? "From" : "To"}</span>
            <span className="mt-1 flex items-center rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
              <span className="pl-2.5 text-xs text-muted-foreground">৳</span>
              <input
                type="number"
                inputMode="numeric"
                value={Math.round(draft[i])}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDraft((d) => (i === 0 ? [v, d[1]] : [d[0], v]));
                }}
                onBlur={() => commit([Math.max(floor, Math.min(draft[0], draft[1])), Math.min(ceil, Math.max(draft[0], draft[1]))])}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full min-w-0 bg-transparent px-1.5 py-1.5 text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRICE_BANDS.map((b, i) => {
          const active = state.min === b.min && state.max === b.max;
          return (
            <Pill
              key={b.label}
              active={active}
              disabled={!counts.priceBands[i]}
              onClick={() => onChange(active ? { min: null, max: null } : { min: b.min, max: b.max })}
            >
              {b.label} <span className="opacity-60 tabular-nums">{counts.priceBands[i]}</span>
            </Pill>
          );
        })}
      </div>
    </div>
  );
}

function BrandFilter({ state, counts, onChange, brandNames }: FilterPanelProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const ordered = useMemo(() => {
    // Selected first, then by how many products match right now, then A–Z.
    return [...brandNames].sort(
      (a, b) =>
        Number(state.brands.includes(b)) - Number(state.brands.includes(a)) ||
        (counts.brands.get(b) || 0) - (counts.brands.get(a) || 0) ||
        a.localeCompare(b)
    );
  }, [brandNames, counts.brands, state.brands]);
  const filtered = ordered.filter((b) => b.toLowerCase().includes(query.toLowerCase()));
  const visible = showAll || query ? filtered : filtered.slice(0, 8);

  const toggle = (b: string) =>
    onChange({ brands: state.brands.includes(b) ? state.brands.filter((x) => x !== b) : [...state.brands, b] });

  return (
    <div>
      {brandNames.length > 8 && (
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${brandNames.length} brands`}
            aria-label="Search brands"
            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
      <div className="space-y-0.5">
        {visible.map((b) => {
          const n = counts.brands.get(b) || 0;
          return (
            <CheckRow key={b} checked={state.brands.includes(b)} disabled={!n} onToggle={() => toggle(b)} count={n}>
              <span className="w-10 h-4 flex items-center justify-center text-foreground/70 shrink-0">
                <BrandLogo name={b} className="h-3.5 w-10" />
              </span>
              <span className="truncate">{b}</span>
            </CheckRow>
          );
        })}
        {!visible.length && <p className="text-xs text-muted-foreground py-2">No brand called “{query}”.</p>}
      </div>
      {!query && filtered.length > 8 && (
        <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-2 text-xs font-medium text-primary hover:underline">
          {showAll ? "Show fewer" : `Show all ${filtered.length} brands`}
        </button>
      )}
    </div>
  );
}

export function FilterPanel(props: FilterPanelProps) {
  const { state, counts, onChange } = props;
  const priceSummary =
    state.min !== null || state.max !== null
      ? `${state.min !== null ? formatTaka(state.min) : "Any"} – ${state.max !== null ? formatTaka(state.max) : "Any"}`
      : undefined;

  return (
    <div>
      <Section title="Price" summary={priceSummary}>
        <PriceFilter state={state} counts={counts} onChange={onChange} />
      </Section>

      <Section title="Brand" summary={state.brands.length ? `${state.brands.length} selected` : undefined}>
        <BrandFilter {...props} />
      </Section>

      <Section title="Payment">
        <CheckRow checked={state.emi} disabled={!counts.emi} onToggle={() => onChange({ emi: !state.emi })} count={counts.emi}>
          0% EMI available
        </CheckRow>
      </Section>

      <Section title="Discount" summary={state.minDiscount ? `${state.minDiscount}% or more` : undefined}>
        <div className="flex flex-wrap gap-1.5">
          {DISCOUNT_STEPS.filter((d) => counts.discount[d] || state.minDiscount === d).map((d) => (
            <Pill key={d} active={state.minDiscount === d} onClick={() => onChange({ minDiscount: state.minDiscount === d ? 0 : d })}>
              {d}% or more <span className="opacity-60 tabular-nums">{counts.discount[d]}</span>
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Deals and labels" summary={state.tags.length ? `${state.tags.length} selected` : undefined}>
        <div className="space-y-0.5">
          {TAGS.map((t) => {
            const n = counts.tags.get(t) || 0;
            const checked = state.tags.includes(t);
            return (
              <CheckRow key={t} checked={checked} disabled={!n} count={n} onToggle={() => onChange({ tags: checked ? state.tags.filter((x) => x !== t) : [...state.tags, t] })}>
                {t}
              </CheckRow>
            );
          })}
        </div>
      </Section>

      <Section title="Customer rating" defaultOpen={false} summary={state.minRating ? `${state.minRating}★ and up` : undefined}>
        <div className="space-y-0.5">
          {RATING_STEPS.map((r) => (
            <CheckRow
              key={r}
              checked={state.minRating === r}
              disabled={!counts.rating[r]}
              count={counts.rating[r]}
              onToggle={() => onChange({ minRating: state.minRating === r ? 0 : r })}
            >
              <Star className="w-3.5 h-3.5 fill-warning text-warning" /> {r} and up
            </CheckRow>
          ))}
        </div>
      </Section>
    </div>
  );
}

/** Every brand the catalog sells, in registry order. */
export const ALL_BRAND_NAMES = OFFICIAL_BRANDS.map((b) => b.name);
