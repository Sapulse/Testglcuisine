"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  savSchema,
  savUpdateSchema,
  journalAjoutSchema,
  type SavInput,
  type SavUpdateInput,
  type JournalAjoutInput,
} from "@/lib/validations/sav";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

function revaliderSav(projetId?: string) {
  revalidatePath("/sav");
  revalidatePath("/");
  if (projetId) revalidatePath(`/projets/${projetId}`);
}

/** Création d'un SAV + première entrée de journal ("creation"). */
export async function creerSav(input: SavInput): Promise<ActionResult<{ id: string }>> {
  const parsed = savSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    const sav = await prisma.$transaction(async (tx) => {
      const nouveau = await tx.sAV.create({
        data: {
          projetId: d.projetId,
          fournisseurId: d.fournisseurId ?? null,
          categorie: d.categorie ?? null,
          typeProbleme: d.typeProbleme,
          statut: d.statut,
          bloquant: d.bloquant,
          commentaire: d.commentaire ?? null,
          dateIntervention: d.dateIntervention ? new Date(d.dateIntervention) : null,
          dateCloture: d.dateCloture ? new Date(d.dateCloture) : null,
        },
      });
      await tx.sAVJournal.create({
        data: {
          savId: nouveau.id,
          type: "creation",
          commentaire: `Ticket ouvert : ${d.typeProbleme}`,
        },
      });
      return nouveau;
    });
    revaliderSav(d.projetId);
    return { ok: true, data: { id: sav.id } };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/** Création + redirection vers fiche SAV (formulaire). */
export async function creerSavEtRediriger(input: SavInput) {
  const res = await creerSav(input);
  if (!res.ok || !res.data) return res;
  redirect(`/sav/${res.data.id}`);
}

/** Modification d'un SAV ; un changement de statut ajoute une entrée journal. */
export async function modifierSav(input: SavUpdateInput): Promise<ActionResult> {
  const parsed = savUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    const avant = await prisma.sAV.findUnique({ where: { id: d.id } });
    if (!avant) return { ok: false, message: "SAV introuvable" };

    await prisma.$transaction(async (tx) => {
      await tx.sAV.update({
        where: { id: d.id },
        data: {
          fournisseurId: d.fournisseurId ?? null,
          categorie: d.categorie ?? null,
          typeProbleme: d.typeProbleme ?? avant.typeProbleme,
          statut: d.statut ?? avant.statut,
          bloquant: d.bloquant ?? avant.bloquant,
          commentaire: d.commentaire ?? null,
          dateIntervention: d.dateIntervention ? new Date(d.dateIntervention) : null,
          dateCloture: d.dateCloture ? new Date(d.dateCloture) : null,
        },
      });

      if (d.statut && d.statut !== avant.statut) {
        await tx.sAVJournal.create({
          data: {
            savId: d.id,
            type: d.statut === "clos" ? "cloture" : "changement_statut",
            commentaire: `Statut : ${avant.statut} → ${d.statut}`,
          },
        });
      }
    });

    revaliderSav(avant.projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function supprimerSav(id: string): Promise<ActionResult> {
  try {
    const sav = await prisma.sAV.findUnique({ where: { id } });
    if (!sav) return { ok: false, message: "SAV introuvable" };
    await prisma.sAV.delete({ where: { id } });
    revaliderSav(sav.projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/** Ajoute une note/intervention dans le journal. */
export async function ajouterAuJournal(input: JournalAjoutInput): Promise<ActionResult> {
  const parsed = journalAjoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  try {
    const sav = await prisma.sAV.findUnique({ where: { id: parsed.data.savId } });
    if (!sav) return { ok: false, message: "SAV introuvable" };

    await prisma.sAVJournal.create({
      data: {
        savId: parsed.data.savId,
        type: parsed.data.type,
        auteur: parsed.data.auteur ?? null,
        commentaire: parsed.data.commentaire,
      },
    });
    revaliderSav(sav.projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
