import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProjetById } from "@/lib/queries/projets";
import { LIBELLES_TYPE_PROJET } from "@/lib/validations/projet";
import {
  LIBELLES_CATEGORIE,
  LIBELLES_STATUT_COMMANDE,
  LIBELLES_STATUT_LIVRAISON,
} from "@/lib/validations/commande";
import { LIBELLES_STATUT_SAV } from "@/lib/validations/sav";
import {
  COULEURS_STATUT_GLOBAL,
  LIBELLES_STATUT_GLOBAL,
} from "@/lib/metier/statuts";
import { calculerAlertes } from "@/lib/metier/alertes";
import { joursAvantSemaine } from "@/lib/metier/semaines";
import { BoutonImpression } from "./_BoutonImpression";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LIBELLES_STATUT_ETAPE = {
  non_commence: "Non commencé",
  en_cours: "En cours",
  termine: "Terminé",
  bloque: "Bloqué",
} as const;

/** Fiche chantier optimisée impression A4. */
export default async function FicheImpressionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projet = await getProjetById(id);
  if (!projet) notFound();

  const jours = joursAvantSemaine(projet.semainePose, projet.anneePose);
  const alertes = calculerAlertes({
    semainePose: projet.semainePose,
    anneePose: projet.anneePose,
    estRenovation: projet.estRenovation,
    etapes: projet.etapes.map((e) => ({ numero: e.numero, statut: e.statut })),
    commandes: projet.commandes.map((c) => ({
      categorie: c.categorie,
      statutCommande: c.statutCommande,
      statutLivraison: c.statutLivraison,
      semaineLivraisonPrevue: c.semaineLivraisonPrevue,
      essentielle: c.essentielle,
    })),
    sav: projet.sav.map((s) => ({
      statut: s.statut,
      bloquant: s.bloquant,
      dateOuverture: s.dateOuverture,
    })),
  });

  return (
    <div className="mx-auto max-w-4xl p-6 text-sm text-slate-900 print:p-0">
      {/* Barre de navigation écran uniquement */}
      <div className="flex items-center justify-between pb-4 print-hide">
        <Link
          href={`/projets/${projet.id}`}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Retour fiche projet
        </Link>
        <BoutonImpression />
      </div>

      {/* En-tête fiche */}
      <header className="flex items-start justify-between border-b border-slate-900 pb-3 print-avoid-break">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
            GL Cuisines · Fiche chantier
          </div>
          <h1 className="mt-1 text-2xl font-bold">
            {projet.reference} — {projet.client.prenom} {projet.client.nom}
          </h1>
          <div className="mt-1 text-xs text-slate-600">
            {LIBELLES_TYPE_PROJET[projet.typeProjet]} ·{" "}
            {projet.estRenovation ? "Rénovation" : "Neuf"}
          </div>
        </div>
        <div className="text-right">
          <div
            className="inline-block rounded px-2 py-1 text-xs font-bold uppercase text-white"
            style={{ backgroundColor: COULEURS_STATUT_GLOBAL[projet.statutGlobal] }}
          >
            {LIBELLES_STATUT_GLOBAL[projet.statutGlobal]}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-600">
            Pose {projet.semainePose} · {projet.anneePose}
          </div>
          <div className="text-[11px] text-slate-500">
            {jours >= 0 ? `Dans ${jours}j` : `Il y a ${-jours}j`}
          </div>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-4 print-avoid-break">
        <Section titre="Client">
          <Ligne k="Nom">
            {projet.client.prenom} {projet.client.nom}
          </Ligne>
          <Ligne k="Tél.">{projet.client.telephone}</Ligne>
          <Ligne k="Email">{projet.client.email ?? "—"}</Ligne>
          <Ligne k="Adresse">
            {projet.client.adresse}
            <br />
            {projet.client.codePostal} {projet.client.ville}
          </Ligne>
        </Section>
        <Section titre="Chantier & vente">
          <Ligne k="Adresse">
            {projet.adresseChantier}
            <br />
            {projet.codePostalChantier} {projet.villeChantier}
          </Ligne>
          <Ligne k="Vendeur">
            {projet.vendeur
              ? `${projet.vendeur.prenom} ${projet.vendeur.nom}`
              : "—"}
          </Ligne>
          <Ligne k="HT">
            {projet.montantHT
              ? `${projet.montantHT.toLocaleString("fr-FR")} €`
              : "—"}
          </Ligne>
          <Ligne k="TTC">
            {projet.montantTTC
              ? `${projet.montantTTC.toLocaleString("fr-FR")} €`
              : "—"}
          </Ligne>
          <Ligne k="Signature">
            {projet.dateSignature
              ? new Date(projet.dateSignature).toLocaleDateString("fr-FR")
              : "—"}
          </Ligne>
        </Section>
      </div>

      <Section titre="Workflow" className="print-avoid-break">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-300 text-left uppercase tracking-wide text-slate-500">
              <th className="py-1 pr-2">#</th>
              <th className="py-1 pr-2">Étape</th>
              <th className="py-1 pr-2">Statut</th>
              <th className="py-1 pr-2">Date fin</th>
              <th className="py-1">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {projet.etapes.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="py-1 pr-2 font-mono">{e.numero}</td>
                <td className="py-1 pr-2">{e.nom}</td>
                <td
                  className={cn(
                    "py-1 pr-2",
                    e.statut === "bloque" && "font-semibold text-red-700",
                    e.statut === "termine" && "text-green-700",
                  )}
                >
                  {LIBELLES_STATUT_ETAPE[e.statut]}
                </td>
                <td className="py-1 pr-2 text-slate-600">
                  {e.dateFin
                    ? new Date(e.dateFin).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="py-1 text-slate-700">{e.commentaire ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section titre="Commandes" className="print-avoid-break">
        {projet.commandes.length === 0 ? (
          <p className="text-xs text-slate-500">Aucune commande.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-left uppercase tracking-wide text-slate-500">
                <th className="py-1 pr-2">Catégorie</th>
                <th className="py-1 pr-2">Fournisseur</th>
                <th className="py-1 pr-2">Statut cmd.</th>
                <th className="py-1 pr-2">Livraison</th>
                <th className="py-1 pr-2">Sem.</th>
                <th className="py-1 pr-2">Ess.</th>
                <th className="py-1">Remarque</th>
              </tr>
            </thead>
            <tbody>
              {projet.commandes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-1 pr-2">
                    {LIBELLES_CATEGORIE[c.categorie]}
                  </td>
                  <td className="py-1 pr-2">{c.fournisseur.nom}</td>
                  <td className="py-1 pr-2">
                    {LIBELLES_STATUT_COMMANDE[c.statutCommande]}
                  </td>
                  <td className="py-1 pr-2">
                    {LIBELLES_STATUT_LIVRAISON[c.statutLivraison]}
                  </td>
                  <td className="py-1 pr-2 font-mono">
                    {c.semaineLivraisonPrevue ?? "—"}
                  </td>
                  <td className="py-1 pr-2">{c.essentielle ? "•" : ""}</td>
                  <td className="py-1 text-slate-700">{c.remarque ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section titre="Poseurs assignés" className="print-avoid-break">
        {projet.assignations.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun poseur assigné.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-xs">
            {projet.assignations.map((a) => (
              <li key={a.id}>
                <span className="font-mono text-slate-600">
                  {a.semaine} {a.annee}
                </span>{" "}
                · {a.poseur.prenom} {a.poseur.nom} ·{" "}
                <span className="text-slate-500">{a.role}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section titre={`Alertes (${alertes.length})`} className="print-avoid-break">
        {alertes.length === 0 ? (
          <p className="text-xs text-slate-500">Aucune alerte.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-xs">
            {alertes.map((a, i) => (
              <li
                key={`${a.id}-${i}`}
                className={cn(
                  "border-l-2 pl-2",
                  a.niveau === "rouge" && "border-red-600",
                  a.niveau === "orange" && "border-orange-500",
                  a.niveau === "jaune" && "border-yellow-500",
                )}
              >
                <span className="font-mono text-slate-500">{a.id}</span> ·{" "}
                {a.message}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section titre={`SAV (${projet.sav.length})`} className="print-avoid-break">
        {projet.sav.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun ticket SAV.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-xs">
            {projet.sav.map((s) => (
              <li key={s.id}>
                <span className="font-semibold">{s.typeProbleme}</span>{" "}
                <span className="text-slate-600">
                  ({LIBELLES_STATUT_SAV[s.statut]}
                  {s.bloquant && ", bloquant"})
                </span>
                {s.commentaire && (
                  <div className="text-slate-700"> ↳ {s.commentaire}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <footer className="mt-6 border-t border-slate-300 pt-2 text-center text-[10px] text-slate-500">
        Fiche générée le {new Date().toLocaleDateString("fr-FR")} · GL Cuisines
      </footer>
    </div>
  );
}

function Section({
  titre,
  children,
  className,
}: {
  titre: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-4", className)}>
      <h2 className="mb-1 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
        {titre}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function Ligne({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-0.5 text-xs">
      <span className="w-16 shrink-0 text-slate-500">{k}</span>
      <span>{children}</span>
    </div>
  );
}
