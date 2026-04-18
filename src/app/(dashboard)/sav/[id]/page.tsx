import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getSavById } from "@/lib/queries/sav";
import {
  LIBELLES_STATUT_SAV,
  LIBELLES_TYPE_JOURNAL,
} from "@/lib/validations/sav";
import { LIBELLES_CATEGORIE } from "@/lib/validations/commande";
import { cn } from "@/lib/utils";
import { EditeurSav, FormulaireJournal } from "./_Editeur";
import { SAVS } from "@/lib/data/snapshot";

export async function generateStaticParams() {
  return SAVS.map((s) => ({ id: s.id }));
}

export default async function SavDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sav = await getSavById(id);
  if (!sav) notFound();

  const age = Math.floor(
    (Date.now() - new Date(sav.dateOuverture).getTime()) / 86_400_000,
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/sav"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Retour SAV
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projets/${sav.projet.id}`}
            className="font-mono text-sm text-slate-500 hover:underline"
          >
            {sav.projet.reference}
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">{sav.typeProbleme}</h1>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] font-semibold",
              sav.statut === "ouvert" && "bg-red-100 text-red-800",
              sav.statut === "en_attente_fournisseur" && "bg-orange-100 text-orange-800",
              sav.statut === "planifie" && "bg-blue-100 text-blue-800",
              sav.statut === "resolu" && "bg-green-100 text-green-800",
              sav.statut === "clos" && "bg-slate-100 text-slate-700",
            )}
          >
            {LIBELLES_STATUT_SAV[sav.statut]}
          </span>
          {sav.bloquant && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">
              bloquant
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span>
            Client : {sav.projet.client.prenom} {sav.projet.client.nom}
          </span>
          <span>·</span>
          <span>Ouvert le {new Date(sav.dateOuverture).toLocaleDateString("fr-FR")} ({age}j)</span>
          {sav.fournisseur && (
            <>
              <span>·</span>
              <span>Fournisseur : {sav.fournisseur.nom}</span>
            </>
          )}
          {sav.categorie && (
            <>
              <span>·</span>
              <span>Catégorie : {LIBELLES_CATEGORIE[sav.categorie]}</span>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <EditeurSav
            id={sav.id}
            projetId={sav.projetId}
            statut={sav.statut}
            bloquant={sav.bloquant}
            commentaire={sav.commentaire}
            dateIntervention={sav.dateIntervention}
            dateCloture={sav.dateCloture}
          />
          <FormulaireJournal savId={sav.id} />
        </div>

        <section className="rounded-md border border-slate-200 bg-white">
          <header className="border-b border-slate-200 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Journal ({sav.journal.length})
            </h2>
          </header>
          <ol className="divide-y divide-slate-100">
            {sav.journal.map((j) => (
              <li key={j.id} className="flex gap-3 px-3 py-2">
                <div className="min-w-[6rem] text-[11px] text-slate-500">
                  {new Date(j.horodatage).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        j.type === "creation" && "bg-blue-100 text-blue-800",
                        j.type === "changement_statut" && "bg-indigo-100 text-indigo-800",
                        j.type === "intervention" && "bg-orange-100 text-orange-800",
                        j.type === "cloture" && "bg-slate-200 text-slate-800",
                        j.type === "note" && "bg-slate-100 text-slate-700",
                      )}
                    >
                      {LIBELLES_TYPE_JOURNAL[j.type]}
                    </span>
                    {j.auteur && (
                      <span className="text-xs text-slate-500">· {j.auteur}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-900">{j.commentaire}</div>
                </div>
              </li>
            ))}
            {sav.journal.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                Journal vide.
              </li>
            )}
          </ol>
        </section>
      </div>
    </div>
  );
}
