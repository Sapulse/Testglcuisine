import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";

export interface FiltresPlanning {
  poseurId?: string;
  typeProjet?: string;
  statut?: StatutGlobalProjet | "tous";
  annee: number;
}

export interface ChantierPlanning {
  id: string;
  reference: string;
  clientNom: string;
  ville: string;
  typeProjet: string;
  semainePose: string;
  anneePose: number;
  statut: StatutGlobalProjet;
  poseurs: string[];
}

/** Renvoie les chantiers groupés par numéro de semaine (1..53) pour l'année. */
export async function chantiersParSemaine(
  filtres: FiltresPlanning,
): Promise<Record<number, ChantierPlanning[]>> {
  const where: Prisma.ProjetWhereInput = { anneePose: filtres.annee };
  if (filtres.poseurId) {
    where.assignations = { some: { poseurId: filtres.poseurId } };
  }
  if (filtres.typeProjet) {
    where.typeProjet = filtres.typeProjet as Prisma.ProjetWhereInput["typeProjet"];
  }

  const projets = await prisma.projet.findMany({
    where,
    include: {
      client: true,
      etapes: { orderBy: { numero: "asc" } },
      commandes: true,
      assignations: { include: { poseur: true } },
    },
    orderBy: [{ semainePose: "asc" }],
  });

  const resultats: Record<number, ChantierPlanning[]> = {};
  for (const p of projets) {
    const statut = calculerStatutGlobal({
      semainePose: p.semainePose,
      anneePose: p.anneePose,
      etapes: p.etapes.map((e) => ({ numero: e.numero, statut: e.statut })),
      commandes: p.commandes.map((c) => ({
        categorie: c.categorie,
        statutCommande: c.statutCommande,
        statutLivraison: c.statutLivraison,
        essentielle: c.essentielle,
      })),
    });
    if (filtres.statut && filtres.statut !== "tous" && statut !== filtres.statut) {
      continue;
    }
    const numero = Number(p.semainePose.slice(1));
    if (!resultats[numero]) resultats[numero] = [];
    resultats[numero].push({
      id: p.id,
      reference: p.reference,
      clientNom: `${p.client.prenom} ${p.client.nom}`,
      ville: p.villeChantier,
      typeProjet: p.typeProjet,
      semainePose: p.semainePose,
      anneePose: p.anneePose,
      statut,
      poseurs: p.assignations.map((a) => a.poseur.prenom),
    });
  }
  return resultats;
}
