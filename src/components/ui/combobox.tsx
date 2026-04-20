"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  recherchePlaceholder?: string;
  videLabel?: string;
  className?: string;
  disabled?: boolean;
  /** Bouton "+ Nouveau" optionnel sous la liste pour créer un item à la volée. */
  onCreer?: () => void;
  labelCreer?: string;
}

/**
 * Select recherchable type combobox. Préférable à un <select> natif
 * dès qu'il y a > 10 options.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  recherchePlaceholder = "Rechercher…",
  videLabel = "Aucun résultat",
  className,
  disabled,
  onCreer,
  labelCreer = "+ Nouveau",
}: Props) {
  const [open, setOpen] = useState(false);
  const [recherche, setRecherche] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const filtres = recherche
    ? options.filter((o) => o.label.toLowerCase().includes(recherche.toLowerCase()))
    : options;

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className={cn("truncate", !selected && "text-slate-500")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-200 px-2">
            <Search className="h-3 w-3 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={recherchePlaceholder}
              className="h-8 w-full border-0 bg-transparent text-sm outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtres.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-slate-500">
                {videLabel}
              </li>
            ) : (
              filtres.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setRecherche("");
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-2 py-1.5 text-sm hover:bg-slate-100",
                    o.value === value && "bg-slate-50",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Check
                      className={cn(
                        "h-3 w-3 shrink-0",
                        o.value === value ? "opacity-100 text-slate-900" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{o.label}</span>
                  </div>
                  {o.hint && (
                    <span className="ml-2 shrink-0 text-[11px] text-slate-500">
                      {o.hint}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
          {onCreer && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreer();
              }}
              className="block w-full border-t border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {labelCreer}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
