"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Option {
  id: string;
  label: string;
}

export function ChoixPoseur({ poseurs }: { poseurs: Option[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const sel = params.get("p") ?? "";

  function choisir(id: string) {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("p", id);
    else next.delete("p");
    router.replace(`/poseur?${next.toString()}`);
  }

  return (
    <select
      value={sel}
      onChange={(e) => choisir(e.target.value)}
      className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base"
    >
      <option value="">— Choisir mon nom —</option>
      {poseurs.map((p) => (
        <option key={p.id} value={p.id}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
