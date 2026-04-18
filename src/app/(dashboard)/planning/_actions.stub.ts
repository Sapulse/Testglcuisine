import type { AssignationInput } from "@/lib/validations/assignation";

const DEMO_ERREUR = "Mode démo en lecture seule — cette action est désactivée.";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

export async function assignerPoseur(_input: AssignationInput): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function retirerAssignation(
  _projetId: string,
  _assignationId: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}
