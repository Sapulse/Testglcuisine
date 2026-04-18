import { Suspense } from "react";
import Link from "next/link";
import { listerProjets, listerPoseurs } from "@/lib/queries/projets";
import { semaineActuelle, anneeActuelle } from "@/lib/metier/semaines";
import { ChoixPoseur } from "./_ChoixPoseur";
import { EtapeToggle } from "./_EtapeToggle";
import { BadgeStatut } from "@/components/metier/BadgeStatut";
export const dynamic = "force-dynamic";


interface Props {
  searchParams?: Promise<{ p?: string }>;
}

/** Vue mobile dédiée poseurs — gros boutons, zéro navigation inutile. */
export default async function PoseurPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const poseurs = await listerPoseurs();
  const poseurSelectionne = sp.p
    ? poseurs.find((p) => p.id === sp.p) ?? null
    : null;

  // Tous les chantiers du poseur (toutes semaines) si sélectionné.
  const tous = poseurSelectionne
    ? await listerProjets({ poseurId: poseurSelectionne.id })
    : [];
  const semaine = semaineActuelle();
  const annee = anneeActuelle();

  // On met en avant ceux de la semaine courante, puis les prochaines, puis le reste.
  const cetteSemaine = tous.filter((p) => p.semainePose === semaine && p.anneePose === annee);
  const autres = tous.filter((p) => p.semainePose !== semaine || p.anneePose !== annee);

  return (
    <div className="mx-auto max-w-xl p-4">
      <header className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
          GL Cuisines · Terrain
        </div>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {poseurSelectionne
            ? `Bonjour ${poseurSelectionne.prenom}`
            : "Vue poseur"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Semaine courante&nbsp;<span className="font-mono font-semibold">{semaine}</span>
        </p>
      </header>

      <section className="mb-6">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
          Poseur
        </label>
        <Suspense>
          <ChoixPoseur poseurs={poseurs.map((p) => ({ id: p.id, label: `${p.prenom} ${p.nom}` }))} />
        </Suspense>
      </section>

      {!poseurSelectionne ? (
        <p className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-600">
          Sélectionne ton nom pour voir tes chantiers.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <Section titre={`Cette semaine (${cetteSemaine.length})`} vide="Rien prévu cette semaine.">
            {cetteSemaine.map((p) => (
              <Chantier key={p.id} projet={p} />
            ))}
          </Section>

          <Section titre={`Autres chantiers (${autres.length})`} vide="—">
            {autres.map((p) => (
              <div
                key={p.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-2">
                  <Link href={`/poseur/${p.id}?p=${poseurSelectionne.id}`} className="flex-1">
                    <div className="font-mono text-xs text-slate-500">
                      {p.reference} · {p.semainePose}
                    </div>
                    <div className="font-semibold">
                      {p.client.prenom} {p.client.nom}
                    </div>
                    <div className="text-xs text-slate-600">{p.villeChantier}</div>
                  </Link>
                  <BadgeStatut statut={p.statutGlobal} />
                </div>
              </div>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  titre,
  vide,
  children,
}: {
  titre: string;
  vide: string;
  children: React.ReactNode;
}) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {titre}
      </h2>
      {arr.length === 0 ? (
        <p className="rounded-md bg-slate-50 p-3 text-center text-sm text-slate-500">
          {vide}
        </p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </section>
  );
}

type ProjetEnrichi = Awaited<ReturnType<typeof listerProjets>>[number];

function Chantier({ projet }: { projet: ProjetEnrichi }) {
  const etapesTerrain = projet.etapes.filter((e) => [6, 7, 8].includes(e.numero));
  return (
    <article className="rounded-md border border-slate-200 bg-white p-3">
      <header className="mb-3 flex items-start gap-2">
        <div className="flex-1">
          <div className="font-mono text-xs text-slate-500">{projet.reference}</div>
          <div className="text-lg font-semibold text-slate-900">
            {projet.client.prenom} {projet.client.nom}
          </div>
          <div className="text-xs text-slate-600">
            {projet.adresseChantier}, {projet.villeChantier}
          </div>
        </div>
        <BadgeStatut statut={projet.statutGlobal} />
      </header>
      <div className="flex flex-col gap-2">
        {etapesTerrain.map((e) => (
          <EtapeToggle
            key={e.id}
            etapeId={e.id}
            projetId={projet.id}
            numero={e.numero}
            nom={e.nom}
            statut={e.statut}
          />
        ))}
      </div>
    </article>
  );
}
