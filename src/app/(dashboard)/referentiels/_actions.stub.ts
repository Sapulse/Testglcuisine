import type {
  ClientRefInput,
  FournisseurInput,
  PoseurInput,
  VendeurInput,
} from "@/lib/validations/referentiels";
import {
  ajouterClient,
  ajouterFournisseur,
  ajouterPoseur,
  ajouterVendeur,
  modifierClient,
  modifierFournisseurStore,
  modifierPoseurStore,
  modifierVendeurStore,
  supprimerClientStore,
  supprimerFournisseurStore,
  supprimerPoseurStore,
  supprimerVendeurStore,
} from "@/lib/data/local-store";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

function safe(fn: () => void): ActionResult {
  try {
    fn();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

// ─── Fournisseurs ───
export async function upsertFournisseur(
  input: FournisseurInput,
  id?: string,
): Promise<ActionResult> {
  return safe(() => {
    if (id) {
      modifierFournisseurStore(id, {
        nom: input.nom,
        contact: input.contact ?? null,
        telephone: input.telephone ?? null,
        email: input.email ?? null,
        categories: input.categories,
      });
    } else {
      ajouterFournisseur({
        nom: input.nom,
        contact: input.contact ?? null,
        telephone: input.telephone ?? null,
        email: input.email ?? null,
        categories: input.categories,
      });
    }
  });
}

export async function supprimerFournisseur(id: string): Promise<ActionResult> {
  return safe(() => supprimerFournisseurStore(id));
}

// ─── Poseurs ───
export async function upsertPoseur(input: PoseurInput, id?: string): Promise<ActionResult> {
  return safe(() => {
    if (id) {
      modifierPoseurStore(id, {
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone ?? null,
        interne: input.interne,
      });
    } else {
      ajouterPoseur({
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone ?? null,
        interne: input.interne,
      });
    }
  });
}

export async function supprimerPoseur(id: string): Promise<ActionResult> {
  return safe(() => supprimerPoseurStore(id));
}

// ─── Vendeurs ───
export async function upsertVendeur(input: VendeurInput, id?: string): Promise<ActionResult> {
  return safe(() => {
    if (id) {
      modifierVendeurStore(id, {
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone ?? null,
        email: input.email ?? null,
      });
    } else {
      ajouterVendeur({
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone ?? null,
        email: input.email ?? null,
      });
    }
  });
}

export async function supprimerVendeur(id: string): Promise<ActionResult> {
  return safe(() => supprimerVendeurStore(id));
}

// ─── Clients ───
export async function upsertClient(input: ClientRefInput, id?: string): Promise<ActionResult> {
  return safe(() => {
    if (id) {
      modifierClient(id, {
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone,
        email: input.email ?? null,
        adresse: input.adresse,
        codePostal: input.codePostal,
        ville: input.ville,
      });
    } else {
      ajouterClient({
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone,
        email: input.email ?? null,
        adresse: input.adresse,
        codePostal: input.codePostal,
        ville: input.ville,
      });
    }
  });
}

export async function supprimerClient(id: string): Promise<ActionResult> {
  return safe(() => supprimerClientStore(id));
}
