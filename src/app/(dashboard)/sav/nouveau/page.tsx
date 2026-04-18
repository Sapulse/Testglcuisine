import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { projetsAvecClient, listerFournisseursRef } from "@/lib/queries/referentiels";
import { FormulaireSav } from "./_Formulaire";
export const dynamic = "force-dynamic";


export default async function NouveauSavPage() {
  const [projets, fournisseurs] = await Promise.all([
    projetsAvecClient(),
    listerFournisseursRef(),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/sav"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Retour SAV
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Nouveau ticket SAV</h1>
      </header>
      <Suspense>
        <FormulaireSav
          projets={projets.map((p) => ({
            id: p.id,
            label: `${p.reference} · ${p.client.prenom} ${p.client.nom}`,
          }))}
          fournisseurs={fournisseurs.map((f) => ({ id: f.id, label: f.nom }))}
        />
      </Suspense>
    </div>
  );
}
