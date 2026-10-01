"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export interface SelectOption {
  value: string;
  label: string;
  image?: string;
  /** Rendered instead of image, e.g. a <BrandLogo />. */
  icon?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
}

interface SearchSelectProps {
  id?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Enables "Create “query”" when nothing matches. Resolve with the new option's value. */
  onCreate?: (name: string) => Promise<string | null>;
  createNoun?: string;
  invalid?: boolean;
}

export function SearchSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  onCreate,
  createNoun = "item",
  invalid,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const selected = options.find((o) => o.value === value);
  const exactMatch = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  const create = async () => {
    if (!onCreate || !query.trim()) return;
    setCreating(true);
    try {
      const newValue = await onCreate(query.trim());
      if (newValue) {
        onChange(newValue);
        setOpen(false);
        setQuery("");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-background text-sm text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            invalid ? "border-destructive" : "border-border hover:border-primary/40"
          }`}
        >
          {selected?.icon ? (
            <span className="w-10 h-5 shrink-0 flex items-center">{selected.icon}</span>
          ) : selected?.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={selected.image} alt="" className="w-5 h-5 object-contain shrink-0 dark:invert" onError={(e) => ((e.target as HTMLElement).style.display = "none")} />
          )}
          <span className={`flex-1 truncate ${selected ? "" : "text-muted-foreground"}`}>{selected?.label || placeholder}</span>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] min-w-56 rounded-xl" align="start">
        <Command
          filter={(itemValue, search) => (itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-3 px-3 text-xs text-muted-foreground text-center">
              {onCreate && query.trim() ? null : `No ${createNoun} found.`}
            </CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.hint || ""}`}
                  disabled={o.disabled}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="rounded-lg"
                >
                  {o.icon ? (
                    <span className="w-10 h-5 shrink-0 flex items-center">{o.icon}</span>
                  ) : o.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={o.image} alt="" className="w-5 h-5 object-contain shrink-0 dark:invert" onError={(e) => ((e.target as HTMLElement).style.visibility = "hidden")} />
                  ) : (
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {o.label.charAt(0)}
                    </span>
                  )}
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.hint && <span className="text-[10px] text-muted-foreground">{o.hint}</span>}
                  <Check className={`w-3.5 h-3.5 text-primary ${value === o.value ? "opacity-100" : "opacity-0"}`} />
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreate && query.trim() && !exactMatch && (
              <CommandGroup>
                <CommandItem value={`__create__ ${query}`} onSelect={create} className="rounded-lg text-primary">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add {createNoun} “{query.trim()}”
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
