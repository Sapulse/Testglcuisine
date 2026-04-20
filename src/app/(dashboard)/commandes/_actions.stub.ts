import type { StatutCommande, StatutLivraison } from "@prisma/client";
import type { CommandeInput, CommandeUpdateInput } from "@/lib/validations/commande";
import {
  ajouterCommande,
  modifierCommandeStore,
  supprimerCommandeStore,
} from "@/lib/data/local-store";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

function safe<T>(fn: () => T): ActionResult<T> {
  try {
    return { ok: true, data: fn() };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function creerCommande(
  input: CommandeInput,
): Promise<ActionResult<{ id: string }>> {
  return safe(() => {
    const c = ajouterCommande({
      projetId: input.projetId,
      fournisseurId: input.fournisseurId,
      categorie: input.categorie,
      statutCommande: input.statutCommande,
      semaineLivraisonPrevue: input.semaineLivraisonPrevue ?? null,
      statutLivraison: input.statutLivraison,
      essentielle: input.essentielle,
      remarque: input.remarque ?? null,
    });
    return { id: c.id };
  });
}

export async function modifierCommande(
  _projetId: string,
  input: CommandeUpdateInput,
): Promise<ActionResult> {
  return safe(() => {
    modifierCommandeStore(input.id, {
      fournisseurId: input.fournisseurId,
      categorie: input.categorie,
      statutCommande: input.statutCommande,
      semaineLivraisonPrevue: input.semaineLivraisonPrevue ?? null,
      statutLivraison: input.statutLivraison,
      essentielle: input.essentielle,
      remarque: input.remarque ?? null,
    });
    return undefined;
  });
}

export async function supprimerCommande(
  _projetId: string,
  id: string,
): Promise<ActionResult> {
  return safe(() => {
    supprimerCommandeStore(id);
    return undefined;
  });
}

export async function modifierStatutsCommande(
  _projetId: string,
  id: string,
  patch: { statutCommande?: StatutCommande; statutLivraison?: StatutLivraison },
): Promise<ActionResult> {
  return safe(() => {
    modifierCommandeStore(id, patch);
    return undefined;
  });
}
