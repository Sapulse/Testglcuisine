import { Suspense } from "react";
import { listerCommandesTransverse, listerFournisseurs } from "@/lib/queries/commandes";
import { CommandesListeClient } from "./_CommandesListeClient";

export default async function CommandesPage() {
  const [commandes, fournisseurs] = await Promise.all([
    listerCommandesTransverse({}),
    listerFournisseurs(),
  ]);

  return (
    <Suspense>
    <CommandesListeClient
      commandes={commandes.map((c) => ({
        id: c.id,
        projetId: c.projetId,
        reference: c.projet.reference,
        clientPrenom: c.projet.client.prenom,
        clientNom: c.projet.client.nom,
        categorie: c.categorie,
        fournisseurId: c.fournisseurId,
        fournisseurNom: c.fournisseur.nom,
        statutCommande: c.statutCommande,
        statutLivraison: c.statutLivraison,
        semaineLivraisonPrevue: c.semaineLivraisonPrevue,
        essentielle: c.essentielle,
        remarque: c.remarque,
      }))}
      fournisseurs={fournisseurs.map((f) => ({ value: f.id, label: f.nom }))}
    />
    </Suspense>
  );
}
