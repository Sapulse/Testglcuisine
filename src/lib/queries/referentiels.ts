import "server-only";
import { prisma } from "@/lib/prisma";
import * as S from "@/lib/data/snapshot";

export async function listerFournisseursRef() {
  if (S.estModeStatique()) {
    return [...S.FOURNISSEURS].sort((a, b) => a.nom.localeCompare(b.nom));
  }
  return prisma.fournisseur.findMany({ orderBy: [{ nom: "asc" }] });
}

export async function listerPoseursRef() {
  if (S.estModeStatique()) {
    return [...S.POSEURS].sort(
      (a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom),
    );
  }
  return prisma.poseur.findMany({ orderBy: [{ nom: "asc" }, { prenom: "asc" }] });
}

export async function listerVendeursRef() {
  if (S.estModeStatique()) {
    return [...S.VENDEURS].sort(
      (a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom),
    );
  }
  return prisma.vendeur.findMany({ orderBy: [{ nom: "asc" }, { prenom: "asc" }] });
}

export async function comptesReferentiels() {
  if (S.estModeStatique()) {
    return {
      fournisseurs: S.FOURNISSEURS.length,
      poseurs: S.POSEURS.length,
      vendeurs: S.VENDEURS.length,
      clients: S.CLIENTS.length,
    };
  }
  const [fournisseurs, poseurs, vendeurs, clients] = await Promise.all([
    prisma.fournisseur.count(),
    prisma.poseur.count(),
    prisma.vendeur.count(),
    prisma.client.count(),
  ]);
  return { fournisseurs, poseurs, vendeurs, clients };
}

export async function listerClientsRef() {
  if (S.estModeStatique()) {
    return [...S.CLIENTS]
      .sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom))
      .map((c) => ({
        ...c,
        nbProjets: S.PROJETS.filter((p) => p.clientId === c.id).length,
      }));
  }
  const clients = await prisma.client.findMany({
    include: { _count: { select: { projets: true } } },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
  return clients.map((c) => ({
    ...c,
    nbProjets: c._count.projets,
  }));
}

export async function projetsAvecClient() {
  if (S.estModeStatique()) {
    return S.PROJETS.map((p) => {
      const client = S.CLIENTS.find((c) => c.id === p.clientId)!;
      return { ...p, client };
    }).sort(
      (a, b) => b.anneePose - a.anneePose || a.reference.localeCompare(b.reference),
    );
  }
  return prisma.projet.findMany({
    include: { client: true },
    orderBy: [{ anneePose: "desc" }, { reference: "asc" }],
  });
}
