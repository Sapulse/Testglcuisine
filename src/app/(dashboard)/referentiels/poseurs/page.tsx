import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listerPoseursRef } from "@/lib/queries/referentiels";
import { EditeurPoseurs } from "./_Editeur";

export default async function PoseursPage() {
  const poseurs = await listerPoseursRef();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/referentiels"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Référentiels
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Poseurs</h1>
        <p className="text-xs text-slate-500">
          {poseurs.length} poseur{poseurs.length > 1 ? "s" : ""}
        </p>
      </header>
      <EditeurPoseurs
        initial={poseurs.map((p) => ({
          id: p.id,
          nom: p.nom,
          prenom: p.prenom,
          telephone: p.telephone,
          interne: p.interne,
        }))}
      />
    </div>
  );
}
