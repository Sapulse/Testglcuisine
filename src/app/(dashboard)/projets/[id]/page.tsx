import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeStatut } from "@/components/metier/BadgeStatut";
import { getProjetById } from "@/lib/queries/projets";
import { LIBELLES_TYPE_PROJET } from "@/lib/validations/projet";
import { calculerAlertes } from "@/lib/metier/alertes";
import { joursAvantSemaine } from "@/lib/metier/semaines";
import { WorkflowInline } from "./_WorkflowInline";
import { TableauCommandesProjet } from "@/components/metier/TableauCommandesProjet";
import { AssignationsPoseurs } from "@/components/metier/AssignationsPoseurs";
import { listerFournisseurs } from "@/lib/queries/commandes";
import { listerPoseurs } from "@/lib/queries/projets";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FicheProjetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [projet, fournisseurs, poseurs] = await Promise.all([
    getProjetById(id),
    listerFournisseurs(),
    listerPoseurs(),
  ]);
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
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/projets"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Retour aux projets
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-500">{projet.reference}</span>
          <h1 className="text-xl font-semibold text-slate-900">
            {projet.client.prenom} {projet.client.nom}
          </h1>
          <BadgeStatut statut={projet.statutGlobal} />
        </div>
        <div className="flex gap-4 text-xs text-slate-600">
          <span>{LIBELLES_TYPE_PROJET[projet.typeProjet]}</span>
          <span>· {projet.villeChantier}</span>
          <span>
            · Pose {projet.semainePose} {projet.anneePose}{" "}
            <span className="text-slate-400">
              ({jours >= 0 ? `dans ${jours}j` : `il y a ${-jours}j`})
            </span>
          </span>
          {projet.estRenovation && <span>· Rénovation</span>}
        </div>
      </header>

      <Tabs defaultValue="infos">
        <TabsList>
          <TabsTrigger value="infos">Infos client</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="commandes">
            Commandes ({projet.commandes.length})
          </TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="sav">SAV ({projet.sav.length})</TabsTrigger>
          <TabsTrigger value="alertes">Alertes ({alertes.length})</TabsTrigger>
        </TabsList>

        {/* ─── Infos client ─── */}
        <TabsContent value="infos">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Bloc titre="Client">
              <Ligne k="Nom">{projet.client.prenom} {projet.client.nom}</Ligne>
              <Ligne k="Téléphone">{projet.client.telephone}</Ligne>
              <Ligne k="Email">{projet.client.email ?? "—"}</Ligne>
              <Ligne k="Adresse">
                {projet.client.adresse}
                <br />
                {projet.client.codePostal} {projet.client.ville}
              </Ligne>
            </Bloc>
            <Bloc titre="Chantier & vente">
              <Ligne k="Adresse chantier">
                {projet.adresseChantier}
                <br />
                {projet.codePostalChantier} {projet.villeChantier}
              </Ligne>
              <Ligne k="Type">{LIBELLES_TYPE_PROJET[projet.typeProjet]}</Ligne>
              <Ligne k="Vendeur">
                {projet.vendeur
                  ? `${projet.vendeur.prenom} ${projet.vendeur.nom}`
                  : "—"}
              </Ligne>
              <Ligne k="Montant HT">
                {projet.montantHT ? `${projet.montantHT.toLocaleString("fr-FR")} €` : "—"}
              </Ligne>
              <Ligne k="Montant TTC">
                {projet.montantTTC ? `${projet.montantTTC.toLocaleString("fr-FR")} €` : "—"}
              </Ligne>
              <Ligne k="Signature">
                {projet.dateSignature
                  ? new Date(projet.dateSignature).toLocaleDateString("fr-FR")
                  : "—"}
              </Ligne>
            </Bloc>
          </div>
        </TabsContent>

        {/* ─── Workflow ─── */}
        <TabsContent value="workflow">
          <WorkflowInline etapes={projet.etapes} projetId={projet.id} />
        </TabsContent>

        {/* ─── Commandes ─── */}
        <TabsContent value="commandes">
          <TableauCommandesProjet
            projetId={projet.id}
            commandes={projet.commandes.map((c) => ({
              id: c.id,
              categorie: c.categorie,
              fournisseurId: c.fournisseurId,
              fournisseurNom: c.fournisseur.nom,
              statutCommande: c.statutCommande,
              semaineLivraisonPrevue: c.semaineLivraisonPrevue,
              statutLivraison: c.statutLivraison,
              essentielle: c.essentielle,
              remarque: c.remarque,
            }))}
            fournisseurs={fournisseurs.map((f) => ({ id: f.id, nom: f.nom }))}
          />
        </TabsContent>

        {/* ─── Planning ─── */}
        <TabsContent value="planning">
          <AssignationsPoseurs
            projetId={projet.id}
            assignations={projet.assignations.map((a) => ({
              id: a.id,
              poseurId: a.poseurId,
              poseurNom: `${a.poseur.prenom} ${a.poseur.nom}`,
              semaine: a.semaine,
              annee: a.annee,
              role: a.role,
            }))}
            poseurs={poseurs.map((p) => ({
              id: p.id,
              nom: `${p.prenom} ${p.nom}`,
            }))}
            semaineDefaut={projet.semainePose}
            anneeDefaut={projet.anneePose}
          />
        </TabsContent>

        {/* ─── SAV ─── */}
        <TabsContent value="sav">
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <Link
                href={`/sav/nouveau?projet=${projet.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
              >
                + Nouveau ticket
              </Link>
            </div>
          {projet.sav.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun ticket SAV.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {projet.sav.map((s) => (
                <li
                  key={s.id}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sav/${s.id}`}
                      className="font-semibold hover:underline"
                    >
                      {s.typeProbleme}
                    </Link>
                    {s.bloquant && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">
                        bloquant
                      </span>
                    )}
                    <span className="ml-auto text-xs text-slate-500">
                      {s.statut}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Ouvert le {new Date(s.dateOuverture).toLocaleDateString("fr-FR")}
                    {s.fournisseur && ` · ${s.fournisseur.nom}`}
                  </div>
                  {s.commentaire && (
                    <div className="mt-2 text-sm text-slate-700">{s.commentaire}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
          </div>
        </TabsContent>

        {/* ─── Alertes ─── */}
        <TabsContent value="alertes">
          {alertes.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune alerte — bon chantier.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {alertes.map((a) => (
                <li
                  key={a.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3 text-sm",
                    a.niveau === "rouge" && "border-red-200 bg-red-50",
                    a.niveau === "orange" && "border-orange-200 bg-orange-50",
                    a.niveau === "jaune" && "border-yellow-200 bg-yellow-50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 inline-block h-2 w-2 shrink-0 rounded-full",
                      a.niveau === "rouge" && "bg-red-600",
                      a.niveau === "orange" && "bg-orange-500",
                      a.niveau === "jaune" && "bg-yellow-500",
                    )}
                  />
                  <div>
                    <div className="font-mono text-xs text-slate-500">{a.id}</div>
                    <div className="text-slate-900">{a.message}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Bloc({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
        {titre}
      </header>
      <div className="flex flex-col gap-1 p-3">{children}</div>
    </section>
  );
}

function Ligne({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1 text-sm">
      <span className="w-28 shrink-0 text-[11px] uppercase tracking-wide text-slate-500">
        {k}
      </span>
      <span className="text-slate-900">{children}</span>
    </div>
  );
}
