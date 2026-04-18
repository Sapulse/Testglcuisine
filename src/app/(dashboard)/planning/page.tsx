import { Suspense } from "react";
import { listerChantiersAnnee } from "@/lib/queries/planning";
import { listerPoseurs } from "@/lib/queries/projets";
import { anneeActuelle, parserSemaine, semaineActuelle } from "@/lib/metier/semaines";
import { PlanningClient } from "./_PlanningClient";
export const dynamic = "force-dynamic";


export default async function PlanningPage() {
  // Mode statique : semaine/année fixes pour cohérence démo. Sinon dynamique.
  const semaineNumActuelle = parserSemaine(semaineActuelle());
  const anneeCourante = anneeActuelle();
  const annee = anneeCourante;

  const [chantiers, poseurs] = await Promise.all([
    listerChantiersAnnee(annee),
    listerPoseurs(),
  ]);

  return (
    <Suspense>
    <PlanningClient
      chantiers={chantiers}
      poseurs={poseurs.map((p) => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))}
      annee={annee}
      semaineCourante={semaineNumActuelle}
      anneeCourante={anneeCourante}
    />
    </Suspense>
  );
}
