import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listerClients, listerVendeurs } from "@/lib/queries/projets";
import { anneeActuelle, semaineActuelle } from "@/lib/metier/semaines";
import { FormulaireProjet } from "./_FormulaireProjet";

export const dynamic = "force-dynamic";

export default async function NouveauProjetPage() {
  const [clients, vendeurs] = await Promise.all([
    listerClients(),
    listerVendeurs(),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/projets"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Retour aux projets
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Nouveau projet</h1>
        <p className="text-xs text-slate-500">
          Les 9 étapes du workflow seront créées automatiquement.
        </p>
      </header>

      <FormulaireProjet
        clients={clients.map((c) => ({ id: c.id, label: `${c.prenom} ${c.nom}` }))}
        vendeurs={vendeurs.map((v) => ({ id: v.id, label: `${v.prenom} ${v.nom}` }))}
        anneeCourante={anneeActuelle()}
        semaineCourante={semaineActuelle()}
      />
    </div>
  );
}
