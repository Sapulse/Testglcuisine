import { Suspense } from "react";
import {
  listerProjets,
  listerPoseurs,
  listerVendeurs,
} from "@/lib/queries/projets";
import { ProjetsListeClient } from "./_ProjetsListeClient";
export const dynamic = "force-dynamic";

export default async function ProjetsPage() {
  const [projets, poseurs, vendeurs] = await Promise.all([
    listerProjets({}),
    listerPoseurs(),
    listerVendeurs(),
  ]);

  return (
    <Suspense>
    <ProjetsListeClient
      projets={projets.map((p) => ({
        id: p.id,
        reference: p.reference,
        clientPrenom: p.client.prenom,
        clientNom: p.client.nom,
        typeProjet: p.typeProjet,
        villeChantier: p.villeChantier,
        semainePose: p.semainePose,
        anneePose: p.anneePose,
        vendeurId: p.vendeurId,
        poseurIds: p.assignations.map((a) => a.poseurId),
        poseursNoms:
          p.assignations.map((a) => a.poseur.prenom).join(" / ") || "—",
        statutGlobal: p.statutGlobal,
      }))}
      poseurs={poseurs.map((p) => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))}
      vendeurs={vendeurs.map((v) => ({ value: v.id, label: `${v.prenom} ${v.nom}` }))}
    />
    </Suspense>
  );
}
