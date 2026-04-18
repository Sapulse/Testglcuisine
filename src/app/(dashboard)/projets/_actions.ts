"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  projetSchema,
  projetEditSchema,
  etapeUpdateSchema,
  type ProjetInput,
  type ProjetEditInput,
} from "@/lib/validations/projet";

const NOMS_ETAPES = [
  "Bon de commande",
  "Plans techniques",
  "Plans de pose",
  "Commandes passées",
  "Livraisons reçues",
  "Dépose",
  "Prépa électrique",
  "Pose",
  "Facturation",
];

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

/** Création d'un projet (+ client inline éventuel) + 9 étapes. */
export async function creerProjet(input: ProjetInput): Promise<ActionResult<{ id: string }>> {
  const parsed = projetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const projet = await prisma.$transaction(async (tx) => {
      const clientId =
        data.client.mode === "existant"
          ? data.client.clientId
          : (
              await tx.client.create({
                data: {
                  nom: data.client.nom,
                  prenom: data.client.prenom,
                  telephone: data.client.telephone,
                  email: data.client.email || null,
                  adresse: data.client.adresse,
                  codePostal: data.client.codePostal,
                  ville: data.client.ville,
                },
              })
            ).id;

      const nouveau = await tx.projet.create({
        data: {
          reference: data.reference,
          clientId,
          vendeurId: data.vendeurId || null,
          typeProjet: data.typeProjet,
          adresseChantier: data.adresseChantier,
          codePostalChantier: data.codePostalChantier,
          villeChantier: data.villeChantier,
          montantHT: data.montantHT ?? null,
          montantTTC: data.montantTTC ?? null,
          semainePose: data.semainePose,
          anneePose: data.anneePose,
          estRenovation: data.estRenovation,
          dateSignature: data.dateSignature ? new Date(data.dateSignature) : null,
          etapes: {
            create: NOMS_ETAPES.map((nom, i) => ({
              numero: i + 1,
              nom,
              statut: "non_commence" as const,
            })),
          },
        },
      });
      return nouveau;
    });

    revalidatePath("/projets");
    revalidatePath("/");
    return { ok: true, data: { id: projet.id } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return { ok: false, message };
  }
}

/** Crée un projet et redirige vers sa fiche (action de formulaire). */
export async function creerProjetEtRediriger(input: ProjetInput) {
  const res = await creerProjet(input);
  if (!res.ok || !res.data) return res;
  redirect(`/projets/${res.data.id}`);
}

export async function modifierProjet(
  id: string,
  input: ProjetEditInput,
): Promise<ActionResult> {
  const parsed = projetEditSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    await prisma.projet.update({
      where: { id },
      data: {
        reference: d.reference,
        typeProjet: d.typeProjet,
        adresseChantier: d.adresseChantier,
        codePostalChantier: d.codePostalChantier,
        villeChantier: d.villeChantier,
        montantHT: d.montantHT ?? null,
        montantTTC: d.montantTTC ?? null,
        semainePose: d.semainePose,
        anneePose: d.anneePose,
        estRenovation: d.estRenovation,
        vendeurId: d.vendeurId || null,
        dateSignature: d.dateSignature ? new Date(d.dateSignature) : null,
      },
    });
    revalidatePath(`/projets/${id}`);
    revalidatePath("/projets");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function supprimerProjet(id: string): Promise<ActionResult> {
  try {
    await prisma.projet.delete({ where: { id } });
    revalidatePath("/projets");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/** Mise à jour inline du statut d'une étape (workflow). */
export async function modifierEtape(input: {
  etapeId: string;
  statut: "non_commence" | "en_cours" | "termine" | "bloque";
  commentaire?: string;
  projetId: string;
}): Promise<ActionResult> {
  const parsed = etapeUpdateSchema.safeParse({
    etapeId: input.etapeId,
    statut: input.statut,
    commentaire: input.commentaire,
  });
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.etapeProjet.update({
      where: { id: parsed.data.etapeId },
      data: {
        statut: parsed.data.statut,
        commentaire: parsed.data.commentaire,
        dateFin: parsed.data.statut === "termine" ? new Date() : null,
      },
    });
    revalidatePath(`/projets/${input.projetId}`);
    revalidatePath("/projets");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
