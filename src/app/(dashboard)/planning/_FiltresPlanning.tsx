"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Option {
  value: string;
  label: string;
}

export function FiltresPlanning({
  poseurs,
  types,
  statuts,
}: {
  poseurs: Option[];
  types: Option[];
  statuts: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, start] = useTransition();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    start(() => router.replace(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select label="Poseur" value={params.get("poseur") ?? ""} options={[{ value: "", label: "Tous" }, ...poseurs]} onChange={(v) => set("poseur", v)} />
      <Select label="Type" value={params.get("type") ?? ""} options={[{ value: "", label: "Tous" }, ...types]} onChange={(v) => set("type", v)} />
      <Select label="Statut" value={params.get("statut") ?? ""} options={[{ value: "", label: "Tous" }, ...statuts]} onChange={(v) => set("statut", v)} />
      <Select
        label="Année"
        value={params.get("annee") ?? ""}
        options={[
          { value: "", label: "Courante" },
          { value: "2025", label: "2025" },
          { value: "2026", label: "2026" },
          { value: "2027", label: "2027" },
        ]}
        onChange={(v) => set("annee", v)}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
