import type { StatutCommande, StatutLivraison } from "@prisma/client";
import type { CommandeInput, CommandeUpdateInput } from "@/lib/validations/commande";

const DEMO_ERREUR = "Mode démo en lecture seule — cette action est désactivée.";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

export async function creerCommande(
  _input: CommandeInput,
): Promise<ActionResult<{ id: string }>> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function modifierCommande(
  _projetId: string,
  _input: CommandeUpdateInput,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerCommande(
  _projetId: string,
  _id: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function modifierStatutsCommande(
  _projetId: string,
  _id: string,
  _patch: { statutCommande?: StatutCommande; statutLivraison?: StatutLivraison },
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}
