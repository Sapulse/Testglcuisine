import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface FiltresCommandes {
  fournisseurId?: string;
  categorie?: string;
  statutCommande?: string;
  statutLivraison?: string;
  semaine?: string;
  recherche?: string;
}

const INCLUDE = {
  fournisseur: true,
  projet: { include: { client: true } },
} satisfies Prisma.CommandeInclude;

export type CommandeAvecRelations = Prisma.CommandeGetPayload<{ include: typeof INCLUDE }>;

/** Liste transverse des commandes avec filtres. */
export async function listerCommandesTransverse(
  filtres: FiltresCommandes = {},
): Promise<CommandeAvecRelations[]> {
  const where: Prisma.CommandeWhereInput = {};
  if (filtres.fournisseurId) where.fournisseurId = filtres.fournisseurId;
  if (filtres.categorie) where.categorie = filtres.categorie as Prisma.CommandeWhereInput["categorie"];
  if (filtres.statutCommande)
    where.statutCommande = filtres.statutCommande as Prisma.CommandeWhereInput["statutCommande"];
  if (filtres.statutLivraison)
    where.statutLivraison = filtres.statutLivraison as Prisma.CommandeWhereInput["statutLivraison"];
  if (filtres.semaine) where.semaineLivraisonPrevue = filtres.semaine;
  if (filtres.recherche) {
    where.OR = [
      { projet: { reference: { contains: filtres.recherche, mode: "insensitive" } } },
      { projet: { client: { nom: { contains: filtres.recherche, mode: "insensitive" } } } },
      { fournisseur: { nom: { contains: filtres.recherche, mode: "insensitive" } } },
    ];
  }

  return prisma.commande.findMany({
    where,
    include: INCLUDE,
    orderBy: [
      { statutLivraison: "asc" },
      { semaineLivraisonPrevue: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function listerFournisseurs() {
  return prisma.fournisseur.findMany({ orderBy: [{ nom: "asc" }] });
}
