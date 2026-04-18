import { Suspense } from "react";
import { listerSav } from "@/lib/queries/sav";
import { SavListeClient } from "./_SavListeClient";
export const dynamic = "force-dynamic";


export default async function SAVPage() {
  const savs = await listerSav({});

  return (
    <Suspense>
    <SavListeClient
      savs={savs.map((s) => ({
        id: s.id,
        projetId: s.projetId,
        reference: s.projet.reference,
        clientPrenom: s.projet.client.prenom,
        clientNom: s.projet.client.nom,
        typeProbleme: s.typeProbleme,
        fournisseurNom: s.fournisseur?.nom ?? null,
        statut: s.statut,
        dateOuverture: s.dateOuverture.toISOString(),
        bloquant: s.bloquant,
      }))}
    />
    </Suspense>
  );
}
