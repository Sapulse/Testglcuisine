import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";

export interface FiltresProjets {
  statut?: StatutGlobalProjet | "tous";
  semainePose?: string;
  poseurId?: string;
  vendeurId?: string;
  recherche?: string;
}

const INCLUDE_BASE = {
  client: true,
  vendeur: true,
  etapes: { orderBy: { numero: "asc" } },
  commandes: true,
  assignations: { include: { poseur: true } },
  sav: true,
} satisfies Prisma.ProjetInclude;

export type ProjetAvecRelations = Prisma.ProjetGetPayload<{
  include: typeof INCLUDE_BASE;
}>;

/** Liste tous les projets avec relations nécessaires au calcul du statut global. */
export async function listerProjets(
  filtres: FiltresProjets = {},
): Promise<Array<ProjetAvecRelations & { statutGlobal: StatutGlobalProjet }>> {
  const where: Prisma.ProjetWhereInput = {};

  if (filtres.semainePose) where.semainePose = filtres.semainePose;
  if (filtres.vendeurId) where.vendeurId = filtres.vendeurId;
  if (filtres.poseurId) {
    where.assignations = { some: { poseurId: filtres.poseurId } };
  }
  if (filtres.recherche) {
    where.OR = [
      { reference: { contains: filtres.recherche, mode: "insensitive" } },
      { client: { nom: { contains: filtres.recherche, mode: "insensitive" } } },
      { client: { prenom: { contains: filtres.recherche, mode: "insensitive" } } },
      { villeChantier: { contains: filtres.recherche, mode: "insensitive" } },
    ];
  }

  const projets = await prisma.projet.findMany({
    where,
    include: INCLUDE_BASE,
    orderBy: [{ anneePose: "asc" }, { semainePose: "asc" }, { reference: "asc" }],
  });

  const enrichis = projets.map((p) => ({
    ...p,
    statutGlobal: calculerStatutGlobal({
      semainePose: p.semainePose,
      anneePose: p.anneePose,
      etapes: p.etapes.map((e) => ({ numero: e.numero, statut: e.statut })),
      commandes: p.commandes.map((c) => ({
        categorie: c.categorie,
        statutCommande: c.statutCommande,
        statutLivraison: c.statutLivraison,
        essentielle: c.essentielle,
      })),
    }),
  }));

  if (filtres.statut && filtres.statut !== "tous") {
    return enrichis.filter((p) => p.statutGlobal === filtres.statut);
  }
  return enrichis;
}

/** Renvoie un projet par son id avec toutes ses relations. */
export async function getProjetById(id: string) {
  const projet = await prisma.projet.findUnique({
    where: { id },
    include: {
      ...INCLUDE_BASE,
      commandes: { include: { fournisseur: true } },
      sav: { include: { fournisseur: true, journal: { orderBy: { horodatage: "desc" } } } },
    },
  });
  if (!projet) return null;
  const statutGlobal = calculerStatutGlobal({
    semainePose: projet.semainePose,
    anneePose: projet.anneePose,
    etapes: projet.etapes.map((e) => ({ numero: e.numero, statut: e.statut })),
    commandes: projet.commandes.map((c) => ({
      categorie: c.categorie,
      statutCommande: c.statutCommande,
      statutLivraison: c.statutLivraison,
      essentielle: c.essentielle,
    })),
  });
  return { ...projet, statutGlobal };
}

export async function listerClients() {
  return prisma.client.findMany({ orderBy: [{ nom: "asc" }, { prenom: "asc" }] });
}

export async function listerVendeurs() {
  return prisma.vendeur.findMany({ orderBy: [{ nom: "asc" }] });
}

export async function listerPoseurs() {
  return prisma.poseur.findMany({ orderBy: [{ nom: "asc" }] });
}
