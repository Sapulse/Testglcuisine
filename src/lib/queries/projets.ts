import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";
import * as S from "@/lib/data/snapshot";

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

function snapshotListerProjets(): ProjetAvecRelations[] {
  return S.PROJETS.map((p) => {
    const client = S.CLIENTS.find((c) => c.id === p.clientId)!;
    const vendeur = S.VENDEURS.find((v) => v.id === p.vendeurId) ?? null;
    const etapes = S.ETAPES.filter((e) => e.projetId === p.id).sort(
      (a, b) => a.numero - b.numero,
    );
    const commandes = S.COMMANDES.filter((c) => c.projetId === p.id);
    const assignations = S.ASSIGNATIONS.filter((a) => a.projetId === p.id).map(
      (a) => ({
        ...a,
        poseur: S.POSEURS.find((po) => po.id === a.poseurId)!,
      }),
    );
    const sav = S.SAVS.filter((s) => s.projetId === p.id);
    return {
      ...p,
      client,
      vendeur,
      etapes,
      commandes,
      assignations,
      sav,
    } as unknown as ProjetAvecRelations;
  });
}

/** Liste tous les projets avec relations nécessaires au calcul du statut global. */
export async function listerProjets(
  filtres: FiltresProjets = {},
): Promise<Array<ProjetAvecRelations & { statutGlobal: StatutGlobalProjet }>> {
  let projets: ProjetAvecRelations[];

  if (S.estModeStatique()) {
    projets = snapshotListerProjets();
    // Filtres appliqués en mémoire.
    if (filtres.semainePose)
      projets = projets.filter((p) => p.semainePose === filtres.semainePose);
    if (filtres.vendeurId)
      projets = projets.filter((p) => p.vendeurId === filtres.vendeurId);
    if (filtres.poseurId)
      projets = projets.filter((p) =>
        p.assignations.some((a) => a.poseurId === filtres.poseurId),
      );
    if (filtres.recherche) {
      const r = filtres.recherche.toLowerCase();
      projets = projets.filter(
        (p) =>
          p.reference.toLowerCase().includes(r) ||
          p.client.nom.toLowerCase().includes(r) ||
          p.client.prenom.toLowerCase().includes(r) ||
          p.villeChantier.toLowerCase().includes(r),
      );
    }
  } else {
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
    projets = await prisma.projet.findMany({
      where,
      include: INCLUDE_BASE,
      orderBy: [{ anneePose: "asc" }, { semainePose: "asc" }, { reference: "asc" }],
    });
  }

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
  if (S.estModeStatique()) {
    const p = S.PROJETS.find((x) => x.id === id);
    if (!p) return null;
    const projets = snapshotListerProjets();
    const projet = projets.find((x) => x.id === id);
    if (!projet) return null;

    const commandesAvecFourn = projet.commandes.map((c) => ({
      ...c,
      fournisseur: S.FOURNISSEURS.find((f) => f.id === c.fournisseurId)!,
    }));
    const savAvec = projet.sav.map((s) => ({
      ...s,
      fournisseur: s.fournisseurId
        ? S.FOURNISSEURS.find((f) => f.id === s.fournisseurId) ?? null
        : null,
      journal: S.SAV_JOURNAUX.filter((j) => j.savId === s.id).sort(
        (a, b) => b.horodatage.getTime() - a.horodatage.getTime(),
      ),
    }));
    const enrichi = {
      ...projet,
      commandes: commandesAvecFourn,
      sav: savAvec,
    };
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
    return { ...enrichi, statutGlobal };
  }

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
  if (S.estModeStatique()) {
    return [...S.CLIENTS].sort(
      (a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom),
    );
  }
  return prisma.client.findMany({ orderBy: [{ nom: "asc" }, { prenom: "asc" }] });
}

export async function listerVendeurs() {
  if (S.estModeStatique()) {
    return [...S.VENDEURS].sort((a, b) => a.nom.localeCompare(b.nom));
  }
  return prisma.vendeur.findMany({ orderBy: [{ nom: "asc" }] });
}

export async function listerPoseurs() {
  if (S.estModeStatique()) {
    return [...S.POSEURS].sort((a, b) => a.nom.localeCompare(b.nom));
  }
  return prisma.poseur.findMany({ orderBy: [{ nom: "asc" }] });
}
