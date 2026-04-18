"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import type { StatutGlobalProjet } from "@/lib/metier/statuts";

interface Option {
  value: string;
  label: string;
}

interface FiltresProjetsProps {
  statuts: Array<{ value: StatutGlobalProjet | "tous"; label: string }>;
  semaines: Option[];
  poseurs: Option[];
  vendeurs: Option[];
}

export function FiltresProjets({ statuts, semaines, poseurs, vendeurs }: FiltresProjetsProps) {
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
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      <SelectFilter
        label="Statut"
        value={params.get("statut") ?? ""}
        options={statuts.map((s) => ({ value: s.value === "tous" ? "" : s.value, label: s.label }))}
        onChange={(v) => set("statut", v)}
      />
      <SelectFilter
        label="Semaine pose"
        value={params.get("semaine") ?? ""}
        options={[{ value: "", label: "Toutes" }, ...semaines]}
        onChange={(v) => set("semaine", v)}
      />
      <SelectFilter
        label="Poseur"
        value={params.get("poseur") ?? ""}
        options={[{ value: "", label: "Tous" }, ...poseurs]}
        onChange={(v) => set("poseur", v)}
      />
      <SelectFilter
        label="Vendeur"
        value={params.get("vendeur") ?? ""}
        options={[{ value: "", label: "Tous" }, ...vendeurs]}
        onChange={(v) => set("vendeur", v)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Recherche
        </label>
        <Input
          placeholder="Réf, client, ville…"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => set("q", e.target.value)}
        />
      </div>
    </div>
  );
}

function SelectFilter({
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
        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
