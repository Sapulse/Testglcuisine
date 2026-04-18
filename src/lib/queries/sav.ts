import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface FiltresSav {
  statut?: string;
  bloquant?: string; // "1" pour filtrer les bloquants
  projetId?: string;
  recherche?: string;
}

const INCLUDE = {
  projet: { include: { client: true } },
  fournisseur: true,
} satisfies Prisma.SAVInclude;

export type SavAvecRelations = Prisma.SAVGetPayload<{ include: typeof INCLUDE }>;

export async function listerSav(filtres: FiltresSav = {}): Promise<SavAvecRelations[]> {
  const where: Prisma.SAVWhereInput = {};
  if (filtres.statut) where.statut = filtres.statut as Prisma.SAVWhereInput["statut"];
  if (filtres.bloquant === "1") where.bloquant = true;
  if (filtres.projetId) where.projetId = filtres.projetId;
  if (filtres.recherche) {
    where.OR = [
      { typeProbleme: { contains: filtres.recherche, mode: "insensitive" } },
      { projet: { reference: { contains: filtres.recherche, mode: "insensitive" } } },
      { projet: { client: { nom: { contains: filtres.recherche, mode: "insensitive" } } } },
    ];
  }
  return prisma.sAV.findMany({
    where,
    include: INCLUDE,
    orderBy: [{ statut: "asc" }, { dateOuverture: "asc" }],
  });
}

export async function getSavById(id: string) {
  return prisma.sAV.findUnique({
    where: { id },
    include: {
      ...INCLUDE,
      journal: { orderBy: { horodatage: "desc" } },
    },
  });
}
