import Link from "next/link";
import { Plus } from "lucide-react";
import { BadgeStatut } from "@/components/metier/BadgeStatut";
import { Button } from "@/components/ui/button";
import {
  LIBELLES_STATUT_GLOBAL,
  type StatutGlobalProjet,
} from "@/lib/metier/statuts";
import {
  listerProjets,
  listerPoseurs,
  listerVendeurs,
} from "@/lib/queries/projets";
import { LIBELLES_TYPE_PROJET } from "@/lib/validations/projet";
import { FiltresProjets } from "./_FiltresProjets";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const STATUTS: Array<{ value: StatutGlobalProjet | "tous"; label: string }> = [
  { value: "tous", label: "Tous" },
  ...(Object.keys(LIBELLES_STATUT_GLOBAL) as StatutGlobalProjet[]).map((s) => ({
    value: s,
    label: LIBELLES_STATUT_GLOBAL[s],
  })),
];

export default async function ProjetsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const [projets, poseurs, vendeurs] = await Promise.all([
    listerProjets({
      statut: (sp.statut as StatutGlobalProjet | undefined) ?? "tous",
      semainePose: sp.semaine,
      poseurId: sp.poseur,
      vendeurId: sp.vendeur,
      recherche: sp.q,
    }),
    listerPoseurs(),
    listerVendeurs(),
  ]);

  const semainesUniques = Array.from(
    new Set(projets.map((p) => p.semainePose)),
  ).sort();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projets</h1>
          <p className="text-xs text-slate-500">
            {projets.length} chantier{projets.length > 1 ? "s" : ""} · liste
            filtrable
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/projets/nouveau">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </header>

      <FiltresProjets
        statuts={STATUTS}
        semaines={semainesUniques.map((s) => ({ value: s, label: s }))}
        poseurs={poseurs.map((p) => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))}
        vendeurs={vendeurs.map((v) => ({ value: v.id, label: `${v.prenom} ${v.nom}` }))}
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
            {projets.map((p) => {
              const poseursNoms = p.assignations
                .map((a) => a.poseur.prenom)
                .join(" / ") || "—";
              return (
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
                    {p.client.prenom} {p.client.nom}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {LIBELLES_TYPE_PROJET[p.typeProjet]}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{p.villeChantier}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {p.semainePose} · {p.anneePose}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{poseursNoms}</td>
                  <td className="px-3 py-2">
                    <BadgeStatut statut={p.statutGlobal} />
                  </td>
                </tr>
              );
            })}
            {projets.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
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
