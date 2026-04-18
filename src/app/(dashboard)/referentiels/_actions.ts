"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  fournisseurSchema,
  poseurSchema,
  vendeurSchema,
  type FournisseurInput,
  type PoseurInput,
  type VendeurInput,
} from "@/lib/validations/referentiels";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; erreurs?: Record<string, string[]> };

// ─────────── Fournisseurs ───────────

export async function upsertFournisseur(
  input: FournisseurInput,
  id?: string,
): Promise<ActionResult> {
  const parsed = fournisseurSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    if (id) {
      await prisma.fournisseur.update({
        where: { id },
        data: {
          nom: d.nom,
          contact: d.contact ?? null,
          telephone: d.telephone ?? null,
          email: d.email ?? null,
          categories: d.categories,
        },
      });
    } else {
      await prisma.fournisseur.create({
        data: {
          nom: d.nom,
          contact: d.contact ?? null,
          telephone: d.telephone ?? null,
          email: d.email ?? null,
          categories: d.categories,
        },
      });
    }
    revalidatePath("/referentiels/fournisseurs");
    revalidatePath("/commandes");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function supprimerFournisseur(id: string): Promise<ActionResult> {
  try {
    await prisma.fournisseur.delete({ where: { id } });
    revalidatePath("/referentiels/fournisseurs");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error
          ? e.message.includes("constraint")
            ? "Impossible : commandes ou SAV liés."
            : e.message
          : "Erreur inconnue",
    };
  }
}

// ─────────── Poseurs ───────────

export async function upsertPoseur(
  input: PoseurInput,
  id?: string,
): Promise<ActionResult> {
  const parsed = poseurSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    if (id) {
      await prisma.poseur.update({
        where: { id },
        data: {
          nom: d.nom,
          prenom: d.prenom,
          telephone: d.telephone ?? null,
          interne: d.interne,
        },
      });
    } else {
      await prisma.poseur.create({
        data: {
          nom: d.nom,
          prenom: d.prenom,
          telephone: d.telephone ?? null,
          interne: d.interne,
        },
      });
    }
    revalidatePath("/referentiels/poseurs");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function supprimerPoseur(id: string): Promise<ActionResult> {
  try {
    await prisma.poseur.delete({ where: { id } });
    revalidatePath("/referentiels/poseurs");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error && e.message.includes("constraint")
          ? "Impossible : assignations liées."
          : e instanceof Error
            ? e.message
            : "Erreur inconnue",
    };
  }
}

// ─────────── Vendeurs ───────────

export async function upsertVendeur(
  input: VendeurInput,
  id?: string,
): Promise<ActionResult> {
  const parsed = vendeurSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation échouée", erreurs: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    if (id) {
      await prisma.vendeur.update({
        where: { id },
        data: {
          nom: d.nom,
          prenom: d.prenom,
          telephone: d.telephone ?? null,
          email: d.email ?? null,
        },
      });
    } else {
      await prisma.vendeur.create({
        data: {
          nom: d.nom,
          prenom: d.prenom,
          telephone: d.telephone ?? null,
          email: d.email ?? null,
        },
      });
    }
    revalidatePath("/referentiels/vendeurs");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function supprimerVendeur(id: string): Promise<ActionResult> {
  try {
    await prisma.vendeur.delete({ where: { id } });
    revalidatePath("/referentiels/vendeurs");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
