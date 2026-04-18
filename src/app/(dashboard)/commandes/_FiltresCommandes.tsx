"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";

interface Option {
  value: string;
  label: string;
}

interface Props {
  fournisseurs: Option[];
  categories: Option[];
  statutsCommande: Option[];
  statutsLivraison: Option[];
  semaines: Option[];
}

export function FiltresCommandes({
  fournisseurs,
  categories,
  statutsCommande,
  statutsLivraison,
  semaines,
}: Props) {
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
    <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
      <Select label="Fournisseur" value={params.get("fournisseur") ?? ""} options={[{ value: "", label: "Tous" }, ...fournisseurs]} onChange={(v) => set("fournisseur", v)} />
      <Select label="Catégorie" value={params.get("categorie") ?? ""} options={[{ value: "", label: "Toutes" }, ...categories]} onChange={(v) => set("categorie", v)} />
      <Select label="Statut cmd" value={params.get("statutCmd") ?? ""} options={[{ value: "", label: "Tous" }, ...statutsCommande]} onChange={(v) => set("statutCmd", v)} />
      <Select label="Livraison" value={params.get("statutLiv") ?? ""} options={[{ value: "", label: "Tous" }, ...statutsLivraison]} onChange={(v) => set("statutLiv", v)} />
      <Select label="Semaine" value={params.get("semaine") ?? ""} options={[{ value: "", label: "Toutes" }, ...semaines]} onChange={(v) => set("semaine", v)} />
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Recherche</label>
        <Input
          placeholder="Réf, client, fournisseur…"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => set("q", e.target.value)}
        />
      </div>
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
        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
