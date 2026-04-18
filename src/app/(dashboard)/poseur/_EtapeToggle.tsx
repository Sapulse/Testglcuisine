"use client";

import { useState, useTransition } from "react";
import type { StatutEtape } from "@prisma/client";
import { Check, CircleDashed, Circle, AlertTriangle } from "lucide-react";
import { modifierEtape } from "@/app/(dashboard)/projets/_actions";
import { cn } from "@/lib/utils";

/** Boutons gros pouce : non_commence → en_cours → termine (cycle). */
export function EtapeToggle({
  etapeId,
  projetId,
  numero,
  nom,
  statut: statutInitial,
}: {
  etapeId: string;
  projetId: string;
  numero: number;
  nom: string;
  statut: StatutEtape;
}) {
  const [statut, setStatut] = useState<StatutEtape>(statutInitial);
  const [pending, start] = useTransition();

  function cycle() {
    const ordre: StatutEtape[] = ["non_commence", "en_cours", "termine"];
    const idx = ordre.indexOf(statut);
    const suivant = ordre[(idx + 1) % ordre.length];
    setStatut(suivant);
    start(async () => {
      await modifierEtape({ etapeId, statut: suivant, projetId });
    });
  }

  const { icon: Icone, classe, label } = configStatut[statut];

  return (
    <button
      onClick={cycle}
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-base transition-colors",
        classe,
        pending && "opacity-60",
      )}
    >
      <Icone className="h-6 w-6 shrink-0" />
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide opacity-70">
          Étape {numero}
        </div>
        <div className="font-semibold">{nom}</div>
      </div>
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </span>
    </button>
  );
}

const configStatut: Record<
  StatutEtape,
  { icon: React.ComponentType<{ className?: string }>; classe: string; label: string }
> = {
  non_commence: {
    icon: Circle,
    classe: "border-slate-200 bg-white text-slate-700 active:bg-slate-50",
    label: "À faire",
  },
  en_cours: {
    icon: CircleDashed,
    classe: "border-blue-300 bg-blue-50 text-blue-900 active:bg-blue-100",
    label: "En cours",
  },
  termine: {
    icon: Check,
    classe: "border-green-300 bg-green-50 text-green-900 active:bg-green-100",
    label: "Fait",
  },
  bloque: {
    icon: AlertTriangle,
    classe: "border-red-300 bg-red-50 text-red-900",
    label: "Bloqué",
  },
};
