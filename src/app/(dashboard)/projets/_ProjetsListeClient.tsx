"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { BadgeStatut } from "@/components/metier/BadgeStatut";
import { Button } from "@/components/ui/button";
import {
  LIBELLES_STATUT_GLOBAL,
  type StatutGlobalProjet,
} from "@/lib/metier/statuts";
import { LIBELLES_TYPE_PROJET } from "@/lib/validations/projet";
import { estDemoStatique } from "@/lib/mode";
import { FiltresProjets } from "./_FiltresProjets";

interface Projet {
  id: string;
  reference: string;
  clientPrenom: string;
  clientNom: string;
  typeProjet: keyof typeof LIBELLES_TYPE_PROJET;
  villeChantier: string;
  semainePose: string;
  anneePose: number;
  poseursNoms: string;
  vendeurId: string | null;
  poseurIds: string[];
  statutGlobal: StatutGlobalProjet;
}

interface Option {
  value: string;
  label: string;
}

const STATUTS: Array<{ value: StatutGlobalProjet | "tous"; label: string }> = [
  { value: "tous", label: "Tous" },
  ...(Object.keys(LIBELLES_STATUT_GLOBAL) as StatutGlobalProjet[]).map((s) => ({
    value: s,
    label: LIBELLES_STATUT_GLOBAL[s],
  })),
];

export function ProjetsListeClient({
  projets,
  poseurs,
  vendeurs,
}: {
  projets: Projet[];
  poseurs: Option[];
  vendeurs: Option[];
}) {
  const params = useSearchParams();
  const isDemo = estDemoStatique();

  const filtres = useMemo(
    () => ({
      statut: params.get("statut") ?? "",
      semaine: params.get("semaine") ?? "",
      poseur: params.get("poseur") ?? "",
      vendeur: params.get("vendeur") ?? "",
      q: (params.get("q") ?? "").toLowerCase(),
    }),
    [params],
  );

  const filtered = useMemo(() => {
    return projets.filter((p) => {
      if (filtres.statut && filtres.statut !== "tous" && p.statutGlobal !== filtres.statut) return false;
      if (filtres.semaine && p.semainePose !== filtres.semaine) return false;
      if (filtres.vendeur && p.vendeurId !== filtres.vendeur) return false;
      if (filtres.poseur && !p.poseurIds.includes(filtres.poseur)) return false;
      if (filtres.q) {
        const hay = `${p.reference} ${p.clientPrenom} ${p.clientNom} ${p.villeChantier}`.toLowerCase();
        if (!hay.includes(filtres.q)) return false;
      }
      return true;
    });
  }, [projets, filtres]);

  const semainesUniques = useMemo(
    () => Array.from(new Set(projets.map((p) => p.semainePose))).sort(),
    [projets],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projets</h1>
          <p className="text-xs text-slate-500">
            {filtered.length} / {projets.length} chantier(s) · liste filtrable
          </p>
        </div>
        {!isDemo && (
          <Button asChild size="sm">
            <Link href="/projets/nouveau">
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Link>
          </Button>
        )}
      </header>

      <FiltresProjets
        statuts={STATUTS}
        semaines={semainesUniques.map((s) => ({ value: s, label: s }))}
        poseurs={poseurs}
        vendeurs={vendeurs}
      />

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Réf.</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Ville</th>
              <th className="px-3 py-2">Pose</th>
              <th className="px-3 py-2">Poseur(s)</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link
                    href={`/projets/${p.id}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {p.reference}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {p.clientPrenom} {p.clientNom}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {LIBELLES_TYPE_PROJET[p.typeProjet]}
                </td>
                <td className="px-3 py-2 text-slate-600">{p.villeChantier}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-700">
                  {p.semainePose} · {p.anneePose}
                </td>
                <td className="px-3 py-2 text-slate-600">{p.poseursNoms}</td>
                <td className="px-3 py-2">
                  <BadgeStatut statut={p.statutGlobal} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucun chantier pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
