import type { AssignationInput } from "@/lib/validations/assignation";
import {
  ajouterAssignation,
  supprimerAssignationStore,
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

export async function assignerPoseur(input: AssignationInput): Promise<ActionResult> {
  return safe(() => {
    ajouterAssignation({
      projetId: input.projetId,
      poseurId: input.poseurId,
      semaine: input.semaine,
      annee: input.annee,
      role: input.role,
    });
    return undefined;
  });
}

export async function retirerAssignation(
  _projetId: string,
  assignationId: string,
): Promise<ActionResult> {
  return safe(() => {
    supprimerAssignationStore(assignationId);
    return undefined;
  });
}
