"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LIBELLES_STATUT_SAV, STATUTS_SAV } from "@/lib/validations/sav";
import { estDemoStatique } from "@/lib/mode";
import { FiltresSav } from "./_FiltresSav";

interface Ligne {
  id: string;
  projetId: string;
  reference: string;
  clientPrenom: string;
  clientNom: string;
  typeProbleme: string;
  fournisseurNom: string | null;
  statut: keyof typeof LIBELLES_STATUT_SAV;
  dateOuverture: string;
  bloquant: boolean;
}

export function SavListeClient({ savs }: { savs: Ligne[] }) {
  const params = useSearchParams();
  const isDemo = estDemoStatique();
  const JOUR_MS = 86_400_000;
  const maintenant = Date.now();

  const filtered = useMemo(() => {
    return savs.filter((s) => {
      if (params.get("statut") && s.statut !== params.get("statut")) return false;
      if (params.get("bloquant") === "1" && !s.bloquant) return false;
      const q = (params.get("q") ?? "").toLowerCase();
      if (q) {
        const hay = `${s.reference} ${s.clientPrenom} ${s.clientNom} ${s.typeProbleme}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [savs, params]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">SAV</h1>
          <p className="text-xs text-slate-500">
            {filtered.length} / {savs.length} ticket(s) ·{" "}
            {filtered.filter((s) => s.bloquant).length} bloquant(s)
          </p>
        </div>
        {!isDemo && (
          <Button asChild size="sm">
            <Link href="/sav/nouveau">
              <Plus className="h-4 w-4" />
              Nouveau ticket
            </Link>
          </Button>
        )}
      </header>

      <FiltresSav statuts={STATUTS_SAV.map((s) => ({ value: s, label: LIBELLES_STATUT_SAV[s] }))} />

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
            {filtered.map((s) => {
              const age = Math.floor(
                (maintenant - new Date(s.dateOuverture).getTime()) / JOUR_MS,
              );
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link href={`/sav/${s.id}`} className="font-semibold hover:underline">
                      {s.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {s.clientPrenom} {s.clientNom}
                  </td>
                  <td className="px-3 py-2">{s.typeProbleme}</td>
                  <td className="px-3 py-2 text-slate-600">{s.fournisseurNom ?? "—"}</td>
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
            {filtered.length === 0 && (
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
