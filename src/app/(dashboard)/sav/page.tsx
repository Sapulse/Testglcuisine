import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listerSav } from "@/lib/queries/sav";
import {
  LIBELLES_STATUT_SAV,
  STATUTS_SAV,
} from "@/lib/validations/sav";
import { cn } from "@/lib/utils";
import { FiltresSav } from "./_FiltresSav";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function SAVPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const savs = await listerSav({
    statut: sp.statut,
    bloquant: sp.bloquant,
    recherche: sp.q,
  });

  const JOUR_MS = 86_400_000;
  const maintenant = Date.now();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">SAV</h1>
          <p className="text-xs text-slate-500">
            {savs.length} ticket{savs.length > 1 ? "s" : ""} ·{" "}
            {savs.filter((s) => s.bloquant).length} bloquant(s)
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/sav/nouveau">
            <Plus className="h-4 w-4" />
            Nouveau ticket
          </Link>
        </Button>
      </header>

      <FiltresSav
        statuts={STATUTS_SAV.map((s) => ({ value: s, label: LIBELLES_STATUT_SAV[s] }))}
      />

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Projet</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Problème</th>
              <th className="px-3 py-2">Fournisseur</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Ouvert</th>
              <th className="px-3 py-2">Âge</th>
              <th className="px-3 py-2">Bloquant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {savs.map((s) => {
              const age = Math.floor(
                (maintenant - new Date(s.dateOuverture).getTime()) / JOUR_MS,
              );
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link
                      href={`/sav/${s.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {s.projet.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {s.projet.client.prenom} {s.projet.client.nom}
                  </td>
                  <td className="px-3 py-2">{s.typeProbleme}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {s.fournisseur?.nom ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        s.statut === "ouvert" && "bg-red-100 text-red-800",
                        s.statut === "en_attente_fournisseur" && "bg-orange-100 text-orange-800",
                        s.statut === "planifie" && "bg-blue-100 text-blue-800",
                        s.statut === "resolu" && "bg-green-100 text-green-800",
                        s.statut === "clos" && "bg-slate-100 text-slate-700",
                      )}
                    >
                      {LIBELLES_STATUT_SAV[s.statut]}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {new Date(s.dateOuverture).toLocaleDateString("fr-FR")}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono text-xs",
                      age > 15 && "font-semibold text-orange-700",
                      age > 30 && "font-bold text-red-700",
                    )}
                  >
                    {age}j
                  </td>
                  <td className="px-3 py-2">
                    {s.bloquant ? (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">
                        Bloquant
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {savs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucun ticket SAV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
