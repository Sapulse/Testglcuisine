// Stub pour le build statique : aucune mutation n'est possible côté démo.
import type { ProjetInput, ProjetEditInput } from "@/lib/validations/projet";

const DEMO_ERREUR = "Mode démo en lecture seule — cette action est désactivée.";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

export async function creerProjet(
  _input: ProjetInput,
): Promise<ActionResult<{ id: string }>> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function creerProjetEtRediriger(_input: ProjetInput) {
  return { ok: false as const, message: DEMO_ERREUR };
}

export async function modifierProjet(
  _id: string,
  _input: ProjetEditInput,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerProjet(_id: string): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function dupliquerProjet(
  _id: string,
): Promise<ActionResult<{ id: string }>> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function modifierEtape(_input: {
  etapeId: string;
  statut: "non_commence" | "en_cours" | "termine" | "bloque";
  commentaire?: string;
  projetId: string;
}): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function enregistrerNotes(
  _projetId: string,
  _notes: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}
