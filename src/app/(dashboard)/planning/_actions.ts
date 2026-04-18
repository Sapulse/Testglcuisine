"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assignationSchema, type AssignationInput } from "@/lib/validations/assignation";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

function revalider(projetId: string) {
  revalidatePath("/planning");
  revalidatePath(`/projets/${projetId}`);
  revalidatePath("/projets");
}

export async function assignerPoseur(input: AssignationInput): Promise<ActionResult> {
  const parsed = assignationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    await prisma.assignationPoseur.create({
      data: {
        projetId: d.projetId,
        poseurId: d.poseurId,
        semaine: d.semaine,
        annee: d.annee,
        role: d.role,
      },
    });
    revalider(d.projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function retirerAssignation(
  projetId: string,
  assignationId: string,
): Promise<ActionResult> {
  try {
    await prisma.assignationPoseur.delete({ where: { id: assignationId } });
    revalider(projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
