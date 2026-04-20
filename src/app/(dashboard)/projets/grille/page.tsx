import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { chargerGrilleProjetsAvecFournisseurs } from "@/lib/queries/grille";
import { GrilleClient } from "./_GrilleClient";

export const dynamic = "force-dynamic";

/** Vue grille type Excel — 1 ligne par chantier, toutes les colonnes visibles. */
export default async function GrilleProjetsPage() {
  const { lignes } = await chargerGrilleProjetsAvecFournisseurs();

  return (
    <div className="flex flex-col gap-3 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <Link
            href="/projets"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-3 w-3" /> Vue fiche
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">
            Grille chantiers
          </h1>
          <p className="text-xs text-slate-500">
            Vue dense type Excel — clique sur les cellules pour cycler les statuts.
          </p>
        </div>
      </header>

      <GrilleClient lignesInitiales={lignes} />
    </div>
  );
}
