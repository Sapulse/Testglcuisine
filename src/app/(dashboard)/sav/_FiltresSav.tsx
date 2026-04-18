"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";

interface Option {
  value: string;
  label: string;
}

export function FiltresSav({ statuts }: { statuts: Option[] }) {
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
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Statut
        </label>
        <select
          value={params.get("statut") ?? ""}
          onChange={(e) => set("statut", e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
        >
          <option value="">Tous</option>
          {statuts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={params.get("bloquant") === "1"}
          onChange={(e) => set("bloquant", e.target.checked ? "1" : "")}
        />
        <span>Bloquants uniquement</span>
      </label>
      <div className="flex flex-col gap-1 md:ml-auto md:w-64">
        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Recherche
        </label>
        <Input
          placeholder="Réf, client, problème…"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => set("q", e.target.value)}
        />
      </div>
    </div>
  );
}
