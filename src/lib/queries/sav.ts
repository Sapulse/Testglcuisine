import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import * as S from "@/lib/data/snapshot";

export interface FiltresSav {
  statut?: string;
  bloquant?: string;
  projetId?: string;
  recherche?: string;
}

const INCLUDE = {
  projet: { include: { client: true } },
  fournisseur: true,
} satisfies Prisma.SAVInclude;

export type SavAvecRelations = Prisma.SAVGetPayload<{ include: typeof INCLUDE }>;

function snapshotSavAvec(): SavAvecRelations[] {
  return S.SAVS.map((s) => {
    const projet = S.PROJETS.find((p) => p.id === s.projetId)!;
    const client = S.CLIENTS.find((c) => c.id === projet.clientId)!;
    const fournisseur = s.fournisseurId
      ? S.FOURNISSEURS.find((f) => f.id === s.fournisseurId) ?? null
      : null;
    return { ...s, projet: { ...projet, client }, fournisseur } as unknown as SavAvecRelations;
  });
}

export async function listerSav(filtres: FiltresSav = {}): Promise<SavAvecRelations[]> {
  if (S.estModeStatique()) {
    let items = snapshotSavAvec();
    if (filtres.statut) items = items.filter((s) => s.statut === filtres.statut);
    if (filtres.bloquant === "1") items = items.filter((s) => s.bloquant);
    if (filtres.projetId) items = items.filter((s) => s.projetId === filtres.projetId);
    if (filtres.recherche) {
      const r = filtres.recherche.toLowerCase();
      items = items.filter(
        (s) =>
          s.typeProbleme.toLowerCase().includes(r) ||
          s.projet.reference.toLowerCase().includes(r) ||
          s.projet.client.nom.toLowerCase().includes(r),
      );
    }
    return items;
  }

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
  if (S.estModeStatique()) {
    const base = snapshotSavAvec().find((s) => s.id === id);
    if (!base) return null;
    const journal = S.SAV_JOURNAUX.filter((j) => j.savId === id).sort(
      (a, b) => b.horodatage.getTime() - a.horodatage.getTime(),
    );
    return { ...base, journal } as SavAvecRelations & { journal: typeof journal };
  }
  return prisma.sAV.findUnique({
    where: { id },
    include: {
      ...INCLUDE,
      journal: { orderBy: { horodatage: "desc" } },
    },
  });
}
