import type {
  ClientRefInput,
  FournisseurInput,
  PoseurInput,
  VendeurInput,
} from "@/lib/validations/referentiels";

const DEMO_ERREUR = "Mode démo en lecture seule — cette action est désactivée.";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

export async function upsertFournisseur(
  _input: FournisseurInput,
  _id?: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerFournisseur(_id: string): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function upsertPoseur(
  _input: PoseurInput,
  _id?: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerPoseur(_id: string): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function upsertVendeur(
  _input: VendeurInput,
  _id?: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerVendeur(_id: string): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function upsertClient(
  _input: ClientRefInput,
  _id?: string,
): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}

export async function supprimerClient(_id: string): Promise<ActionResult> {
  return { ok: false, message: DEMO_ERREUR };
}
