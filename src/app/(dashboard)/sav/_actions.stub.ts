import type {
  SavInput,
  SavUpdateInput,
  JournalAjoutInput,
} from "@/lib/validations/sav";

const DEMO_ERREUR = "Mode démo en lecture seule — cette action est désactivée.";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

export async function creerSav(
  _input: SavInput,
): Promise<ActionResult<{ id: string }>> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function creerSavEtRediriger(_input: SavInput) {
  return { ok: false as const, message: DEMO_ERREUR };
}

export async function modifierSav(_input: SavUpdateInput): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerSav(_id: string): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function ajouterAuJournal(
  _input: JournalAjoutInput,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}
