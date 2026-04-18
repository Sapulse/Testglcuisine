"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  commandeSchema,
  commandeUpdateSchema,
  type CommandeInput,
  type CommandeUpdateInput,
} from "@/lib/validations/commande";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

/** Révalide les routes qui affichent des commandes. */
function revalider(projetId: string) {
  revalidatePath(`/projets/${projetId}`);
  revalidatePath("/commandes");
  revalidatePath("/projets");
  revalidatePath("/");
}

export async function creerCommande(input: CommandeInput): Promise<ActionResult<{ id: string }>> {
  const parsed = commandeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    const cmd = await prisma.commande.create({
      data: {
        projetId: d.projetId,
        fournisseurId: d.fournisseurId,
        categorie: d.categorie,
        statutCommande: d.statutCommande,
        semaineLivraisonPrevue: d.semaineLivraisonPrevue ?? null,
        statutLivraison: d.statutLivraison,
        essentielle: d.essentielle,
        remarque: d.remarque ?? null,
      },
    });
    revalider(d.projetId);
    return { ok: true, data: { id: cmd.id } };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function modifierCommande(
  projetId: string,
  input: CommandeUpdateInput,
): Promise<ActionResult> {
  const parsed = commandeUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    await prisma.commande.update({
      where: { id: d.id },
      data: {
        fournisseurId: d.fournisseurId,
        categorie: d.categorie,
        statutCommande: d.statutCommande,
        semaineLivraisonPrevue: d.semaineLivraisonPrevue ?? null,
        statutLivraison: d.statutLivraison,
        essentielle: d.essentielle,
        remarque: d.remarque ?? null,
      },
    });
    revalider(projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function supprimerCommande(
  projetId: string,
  id: string,
): Promise<ActionResult> {
  try {
    await prisma.commande.delete({ where: { id } });
    revalider(projetId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
