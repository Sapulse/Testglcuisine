import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import * as S from "@/lib/data/snapshot";

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

export async function listerCommandesTransverse(
  filtres: FiltresCommandes = {},
): Promise<CommandeAvecRelations[]> {
  if (S.estModeStatique()) {
    let cmds = S.COMMANDES.map((c) => {
      const projet = S.PROJETS.find((p) => p.id === c.projetId)!;
      const client = S.CLIENTS.find((cl) => cl.id === projet.clientId)!;
      const fournisseur = S.FOURNISSEURS.find((f) => f.id === c.fournisseurId)!;
      return { ...c, fournisseur, projet: { ...projet, client } } as unknown as CommandeAvecRelations;
    });
    if (filtres.fournisseurId)
      cmds = cmds.filter((c) => c.fournisseurId === filtres.fournisseurId);
    if (filtres.categorie)
      cmds = cmds.filter((c) => c.categorie === filtres.categorie);
    if (filtres.statutCommande)
      cmds = cmds.filter((c) => c.statutCommande === filtres.statutCommande);
    if (filtres.statutLivraison)
      cmds = cmds.filter((c) => c.statutLivraison === filtres.statutLivraison);
    if (filtres.semaine)
      cmds = cmds.filter((c) => c.semaineLivraisonPrevue === filtres.semaine);
    if (filtres.recherche) {
      const r = filtres.recherche.toLowerCase();
      cmds = cmds.filter(
        (c) =>
          c.projet.reference.toLowerCase().includes(r) ||
          c.projet.client.nom.toLowerCase().includes(r) ||
          c.fournisseur.nom.toLowerCase().includes(r),
      );
    }
    return cmds;
  }

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
  if (S.estModeStatique()) {
    return [...S.FOURNISSEURS].sort((a, b) => a.nom.localeCompare(b.nom));
  }
  return prisma.fournisseur.findMany({ orderBy: [{ nom: "asc" }] });
}
