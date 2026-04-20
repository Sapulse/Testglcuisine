// Stubs en mode démo statique : les actions écrivent dans le LocalStore
// (localStorage du navigateur) — chaque visiteur a sa propre copie.

import type { ProjetInput, ProjetEditInput } from "@/lib/validations/projet";
import type { TypeProjet } from "@prisma/client";
import {
  ajouterProjet,
  ajouterClient,
  modifierProjetStore,
  supprimerProjetStore,
  modifierEtapeStore,
  dupliquerProjetStore,
  enregistrerNotesStore,
} from "@/lib/data/local-store";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

function safe<T>(fn: () => T): ActionResult<T> {
  try {
    const data = fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function creerProjet(input: ProjetInput): Promise<ActionResult<{ id: string }>> {
  return safe(() => {
    let clientId: string;
    if (input.client.mode === "existant") {
      clientId = input.client.clientId;
    } else {
      const c = ajouterClient({
        nom: input.client.nom,
        prenom: input.client.prenom,
        telephone: input.client.telephone,
        email: input.client.email || null,
        adresse: input.client.adresse,
        codePostal: input.client.codePostal,
        ville: input.client.ville,
      });
      clientId = c.id;
    }
    const projet = ajouterProjet({
      reference: input.reference,
      clientId,
      vendeurId: input.vendeurId || null,
      typeProjet: input.typeProjet as TypeProjet,
      adresseChantier: input.adresseChantier,
      codePostalChantier: input.codePostalChantier,
      villeChantier: input.villeChantier,
      montantHT: input.montantHT ?? null,
      montantTTC: input.montantTTC ?? null,
      semainePose: input.semainePose,
      anneePose: input.anneePose,
      estRenovation: input.estRenovation,
      dateSignature: input.dateSignature ? new Date(input.dateSignature) : null,
      notes: null,
    });
    return { id: projet.id };
  });
}

export async function creerProjetEtRediriger(input: ProjetInput) {
  return creerProjet(input);
}

export async function modifierProjet(
  id: string,
  input: ProjetEditInput,
): Promise<ActionResult> {
  return safe(() => {
    modifierProjetStore(id, {
      reference: input.reference,
      typeProjet: input.typeProjet as TypeProjet,
      adresseChantier: input.adresseChantier,
      codePostalChantier: input.codePostalChantier,
      villeChantier: input.villeChantier,
      montantHT: input.montantHT ?? null,
      montantTTC: input.montantTTC ?? null,
      semainePose: input.semainePose,
      anneePose: input.anneePose,
      estRenovation: input.estRenovation,
      vendeurId: input.vendeurId || null,
      dateSignature: input.dateSignature ? new Date(input.dateSignature) : null,
    });
    return undefined;
  });
}

export async function supprimerProjet(id: string): Promise<ActionResult> {
  return safe(() => {
    supprimerProjetStore(id);
    return undefined;
  });
}

export async function dupliquerProjet(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  return safe(() => {
    const n = dupliquerProjetStore(id);
    if (!n) throw new Error("Projet introuvable");
    return { id: n.id };
  });
}

export async function modifierEtape(input: {
  etapeId: string;
  statut: "non_commence" | "en_cours" | "termine" | "bloque";
  commentaire?: string;
  projetId: string;
}): Promise<ActionResult> {
  return safe(() => {
    modifierEtapeStore(input.etapeId, {
      statut: input.statut,
      commentaire: input.commentaire ?? null,
    });
    return undefined;
  });
}

export async function enregistrerNotes(
  projetId: string,
  notes: string,
): Promise<ActionResult> {
  return safe(() => {
    enregistrerNotesStore(projetId, notes);
    return undefined;
  });
}
