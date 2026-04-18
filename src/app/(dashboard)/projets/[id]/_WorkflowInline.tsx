"use client";

import { useState, useTransition } from "react";
import type { StatutEtape } from "@prisma/client";
import { cn } from "@/lib/utils";
import { modifierEtape } from "@/app/(dashboard)/projets/_actions";

interface Etape {
  id: string;
  numero: number;
  nom: string;
  statut: StatutEtape;
  commentaire: string | null;
  dateFin: Date | null;
}

const STATUTS: Array<{ value: StatutEtape; label: string; classe: string }> = [
  { value: "non_commence", label: "Non commencé", classe: "bg-slate-100 text-slate-700" },
  { value: "en_cours", label: "En cours", classe: "bg-blue-100 text-blue-800" },
  { value: "termine", label: "Terminé", classe: "bg-green-100 text-green-800" },
  { value: "bloque", label: "Bloqué", classe: "bg-red-100 text-red-800" },
];

export function WorkflowInline({
  etapes,
  projetId,
}: {
  etapes: Etape[];
  projetId: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
          <tr>
            <th className="w-10 px-3 py-2">#</th>
            <th className="px-3 py-2">Étape</th>
            <th className="px-3 py-2">Statut</th>
            <th className="px-3 py-2">Date fin</th>
            <th className="px-3 py-2">Commentaire</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {etapes.map((e) => (
            <LigneEtape key={e.id} etape={e} projetId={projetId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LigneEtape({ etape, projetId }: { etape: Etape; projetId: string }) {
  const [statut, setStatut] = useState<StatutEtape>(etape.statut);
  const [commentaire, setCommentaire] = useState(etape.commentaire ?? "");
  const [pending, start] = useTransition();

  function changerStatut(s: StatutEtape) {
    setStatut(s);
    start(async () => {
      await modifierEtape({ etapeId: etape.id, statut: s, commentaire, projetId });
    });
  }

  function sauverCommentaire() {
    start(async () => {
      await modifierEtape({ etapeId: etape.id, statut, commentaire, projetId });
    });
  }

  const dateFin = etape.dateFin
    ? new Date(etape.dateFin).toLocaleDateString("fr-FR")
    : "—";

  return (
    <tr className={cn(pending && "opacity-60")}>
      <td className="px-3 py-2 font-mono text-xs text-slate-500">{etape.numero}</td>
      <td className="px-3 py-2 font-medium text-slate-900">{etape.nom}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {STATUTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => changerStatut(s.value)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-semibold transition-colors",
                statut === s.value ? s.classe : "bg-white text-slate-500 hover:bg-slate-100",
                "border border-slate-200",
              )}
              disabled={pending}
            >
              {s.label}
            </button>
          ))}
        </div>
      </td>
      <td className="px-3 py-2 text-xs text-slate-600">{dateFin}</td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          onBlur={sauverCommentaire}
          placeholder="—"
          className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:border-slate-400 focus:outline-none"
          disabled={pending}
        />
      </td>
    </tr>
  );
}
