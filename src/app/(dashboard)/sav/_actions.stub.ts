import type {
  SavInput,
  SavUpdateInput,
  JournalAjoutInput,
} from "@/lib/validations/sav";
import {
  ajouterSav,
  modifierSavStore,
  supprimerSavStore,
  ajouterJournalSav,
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

export async function creerSav(
  input: SavInput,
): Promise<ActionResult<{ id: string }>> {
  return safe(() => {
    const sav = ajouterSav(
      {
        projetId: input.projetId,
        fournisseurId: input.fournisseurId ?? null,
        categorie: input.categorie ?? null,
        typeProbleme: input.typeProbleme,
        statut: input.statut,
        bloquant: input.bloquant,
        dateOuverture: new Date(),
        dateIntervention: input.dateIntervention ? new Date(input.dateIntervention) : null,
        dateCloture: input.dateCloture ? new Date(input.dateCloture) : null,
        commentaire: input.commentaire ?? null,
      },
      `Ticket ouvert : ${input.typeProbleme}`,
    );
    return { id: sav.id };
  });
}

export async function creerSavEtRediriger(input: SavInput) {
  return creerSav(input);
}

export async function modifierSav(input: SavUpdateInput): Promise<ActionResult> {
  return safe(() => {
    modifierSavStore(input.id, {
      fournisseurId: input.fournisseurId ?? null,
      categorie: input.categorie ?? null,
      ...(input.typeProbleme && { typeProbleme: input.typeProbleme }),
      ...(input.statut && { statut: input.statut }),
      ...(input.bloquant !== undefined && { bloquant: input.bloquant }),
      commentaire: input.commentaire ?? null,
      dateIntervention: input.dateIntervention ? new Date(input.dateIntervention) : null,
      dateCloture: input.dateCloture ? new Date(input.dateCloture) : null,
    });
    return undefined;
  });
}

export async function supprimerSav(id: string): Promise<ActionResult> {
  return safe(() => {
    supprimerSavStore(id);
    return undefined;
  });
}

export async function ajouterAuJournal(
  input: JournalAjoutInput,
): Promise<ActionResult> {
  return safe(() => {
    ajouterJournalSav(input.savId, input.type, input.commentaire, input.auteur ?? null);
    return undefined;
  });
}
