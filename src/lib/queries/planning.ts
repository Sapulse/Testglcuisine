import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";
import * as S from "@/lib/data/snapshot";

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
  poseurIds: string[];
}

/** Renvoie tous les chantiers d'une année, avec statut global + poseurs. */
export async function listerChantiersAnnee(annee: number): Promise<ChantierPlanning[]> {
  if (S.estModeStatique()) {
    return S.PROJETS.filter((p) => p.anneePose === annee).map((p) => {
      const client = S.CLIENTS.find((c) => c.id === p.clientId)!;
      const etapes = S.ETAPES.filter((e) => e.projetId === p.id);
      const commandes = S.COMMANDES.filter((c) => c.projetId === p.id);
      const assignations = S.ASSIGNATIONS.filter((a) => a.projetId === p.id).map(
        (a) => ({ poseurId: a.poseurId, prenom: S.POSEURS.find((po) => po.id === a.poseurId)!.prenom }),
      );
      const statut = calculerStatutGlobal({
        semainePose: p.semainePose,
        anneePose: p.anneePose,
        etapes: etapes.map((e) => ({ numero: e.numero, statut: e.statut })),
        commandes: commandes.map((c) => ({
          categorie: c.categorie,
          statutCommande: c.statutCommande,
          statutLivraison: c.statutLivraison,
          essentielle: c.essentielle,
        })),
      });
      return {
        id: p.id,
        reference: p.reference,
        clientNom: `${client.prenom} ${client.nom}`,
        ville: p.villeChantier,
        typeProjet: p.typeProjet,
        semainePose: p.semainePose,
        anneePose: p.anneePose,
        statut,
        poseurs: assignations.map((a) => a.prenom),
        poseurIds: assignations.map((a) => a.poseurId),
      };
    });
  }

  const rows = await prisma.projet.findMany({
    where: { anneePose: annee },
    include: {
      client: true,
      etapes: { orderBy: { numero: "asc" } },
      commandes: true,
      assignations: { include: { poseur: true } },
    },
    orderBy: [{ semainePose: "asc" }],
  });
  void ({} as Prisma.ProjetWhereInput);

  return rows.map((p) => ({
    id: p.id,
    reference: p.reference,
    clientNom: `${p.client.prenom} ${p.client.nom}`,
    ville: p.villeChantier,
    typeProjet: p.typeProjet,
    semainePose: p.semainePose,
    anneePose: p.anneePose,
    statut: calculerStatutGlobal({
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
    poseurs: p.assignations.map((a) => a.poseur.prenom),
    poseurIds: p.assignations.map((a) => a.poseurId),
  }));
}
