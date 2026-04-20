import "server-only";
import { listerProjets, type ProjetAvecRelations } from "@/lib/queries/projets";
import * as S from "@/lib/data/snapshot";
import type {
  CategorieCommande,
  StatutCommande,
  StatutEtape,
  StatutLivraison,
} from "@prisma/client";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";
import { CATEGORIES_COMMANDE } from "@/lib/validations/commande";

export interface CelluleEtape {
  id: string;
  numero: number;
  statut: StatutEtape;
}

export interface CelluleCommande {
  id: string;
  fournisseurNom: string;
  semaineLivraisonPrevue: string | null;
  statutCommande: StatutCommande;
  statutLivraison: StatutLivraison;
  essentielle: boolean;
}

export interface LigneGrille {
  id: string;
  reference: string;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  clientEmail: string | null;
  anneePose: number;
  estRenovation: boolean;
  typeProjet: string;
  adresseChantier: string;
  villeChantier: string;
  vendeurNom: string | null;
  poseursNoms: string;
  semainePose: string;
  statutGlobal: StatutGlobalProjet;
  etapes: Record<number, CelluleEtape>;
  // Une seule commande affichée par catégorie (la plus pertinente — première par défaut).
  commandes: Partial<Record<CategorieCommande, CelluleCommande>>;
}

/** Données pour la grille type Excel. */
export async function chargerGrilleProjets(): Promise<{
  lignes: LigneGrille[];
  fournisseursParCategorie: Partial<Record<CategorieCommande, Array<{ id: string; nom: string }>>>;
}> {
  const projets = await listerProjets({});

  const lignes: LigneGrille[] = projets.map((p) => mapperLigne(p));

  // Fournisseurs disponibles par catégorie (pour les selects de la grille).
  const fournisseursParCategorie = await chargerFournisseursParCategorie();

  return { lignes, fournisseursParCategorie };
}

function mapperLigne(p: ProjetAvecRelations & { statutGlobal: StatutGlobalProjet }): LigneGrille {
  const etapes: Record<number, CelluleEtape> = {};
  for (const e of p.etapes) {
    etapes[e.numero] = { id: e.id, numero: e.numero, statut: e.statut };
  }

  // Commandes : si plusieurs par catégorie, on prend la première pour l'affichage compact.
  // (Vue grille = compacte. Pour multi-commandes, l'utilisateur ouvre la fiche.)
  const commandes: Partial<Record<CategorieCommande, CelluleCommande>> = {};
  // Need to access the fournisseur, but ProjetAvecRelations from listerProjets may not include it.
  // The base INCLUDE_BASE in projets queries doesn't include fournisseur on commandes.
  // We'll just show categorie + statut without fournisseur name for now.
  // To get fournisseur, we'd need a separate query.
  void p; // placeholder
  return {
    id: p.id,
    reference: p.reference,
    clientNom: p.client.nom,
    clientPrenom: p.client.prenom,
    clientTelephone: p.client.telephone,
    clientEmail: p.client.email,
    anneePose: p.anneePose,
    estRenovation: p.estRenovation,
    typeProjet: p.typeProjet,
    adresseChantier: p.adresseChantier,
    villeChantier: p.villeChantier,
    vendeurNom: p.vendeur ? `${p.vendeur.prenom} ${p.vendeur.nom}` : null,
    poseursNoms: p.assignations.map((a) => a.poseur.prenom).join(" / ") || "—",
    semainePose: p.semainePose,
    statutGlobal: p.statutGlobal,
    etapes,
    commandes,
  };
}

async function chargerFournisseursParCategorie() {
  if (S.estModeStatique()) {
    const map: Partial<Record<CategorieCommande, Array<{ id: string; nom: string }>>> = {};
    for (const cat of CATEGORIES_COMMANDE) {
      map[cat] = S.FOURNISSEURS.filter((f) => f.categories.includes(cat)).map((f) => ({
        id: f.id,
        nom: f.nom,
      }));
    }
    return map;
  }
  const { prisma } = await import("@/lib/prisma");
  const fournisseurs = await prisma.fournisseur.findMany({
    orderBy: [{ nom: "asc" }],
  });
  const map: Partial<Record<CategorieCommande, Array<{ id: string; nom: string }>>> = {};
  for (const cat of CATEGORIES_COMMANDE) {
    map[cat] = fournisseurs
      .filter((f) => f.categories.includes(cat))
      .map((f) => ({ id: f.id, nom: f.nom }));
  }
  return map;
}

/** Comme `chargerGrilleProjets` mais avec le nom du fournisseur de chaque commande. */
export async function chargerGrilleProjetsAvecFournisseurs(): Promise<{
  lignes: LigneGrille[];
  fournisseursParCategorie: Partial<Record<CategorieCommande, Array<{ id: string; nom: string }>>>;
}> {
  if (S.estModeStatique()) {
    const lignes: LigneGrille[] = S.PROJETS.map((p) => {
      const client = S.CLIENTS.find((c) => c.id === p.clientId)!;
      const vendeur = p.vendeurId ? S.VENDEURS.find((v) => v.id === p.vendeurId) ?? null : null;
      const etapes: Record<number, CelluleEtape> = {};
      for (const e of S.ETAPES.filter((x) => x.projetId === p.id)) {
        etapes[e.numero] = { id: e.id, numero: e.numero, statut: e.statut };
      }
      const commandes: Partial<Record<CategorieCommande, CelluleCommande>> = {};
      for (const c of S.COMMANDES.filter((x) => x.projetId === p.id)) {
        if (commandes[c.categorie]) continue;
        const f = S.FOURNISSEURS.find((x) => x.id === c.fournisseurId);
        commandes[c.categorie] = {
          id: c.id,
          fournisseurNom: f?.nom ?? "—",
          semaineLivraisonPrevue: c.semaineLivraisonPrevue,
          statutCommande: c.statutCommande,
          statutLivraison: c.statutLivraison,
          essentielle: c.essentielle,
        };
      }
      const assigns = S.ASSIGNATIONS.filter((a) => a.projetId === p.id).map((a) => {
        const po = S.POSEURS.find((x) => x.id === a.poseurId)!;
        return po.prenom;
      });
      const statutGlobal = calculerStatutGlobal({
        semainePose: p.semainePose,
        anneePose: p.anneePose,
        etapes: Object.values(etapes).map((e) => ({ numero: e.numero, statut: e.statut })),
        commandes: S.COMMANDES.filter((c) => c.projetId === p.id).map((c) => ({
          categorie: c.categorie,
          statutCommande: c.statutCommande,
          statutLivraison: c.statutLivraison,
          essentielle: c.essentielle,
        })),
      });
      return {
        id: p.id,
        reference: p.reference,
        clientNom: client.nom,
        clientPrenom: client.prenom,
        clientTelephone: client.telephone,
        clientEmail: client.email,
        anneePose: p.anneePose,
        estRenovation: p.estRenovation,
        typeProjet: p.typeProjet,
        adresseChantier: p.adresseChantier,
        villeChantier: p.villeChantier,
        vendeurNom: vendeur ? `${vendeur.prenom} ${vendeur.nom}` : null,
        poseursNoms: assigns.join(" / ") || "—",
        semainePose: p.semainePose,
        statutGlobal,
        etapes,
        commandes,
      };
    });
    const fournisseursParCategorie = await chargerFournisseursParCategorie();
    return { lignes, fournisseursParCategorie };
  }

  // Mode dynamique : on refait la requête avec inclusion du fournisseur.
  const { prisma } = await import("@/lib/prisma");
  const projets = await prisma.projet.findMany({
    include: {
      client: true,
      vendeur: true,
      etapes: { orderBy: { numero: "asc" } },
      commandes: { include: { fournisseur: true } },
      assignations: { include: { poseur: true } },
    },
    orderBy: [{ anneePose: "asc" }, { semainePose: "asc" }, { reference: "asc" }],
  });

  const lignes: LigneGrille[] = projets.map((p) => {
    const etapes: Record<number, CelluleEtape> = {};
    for (const e of p.etapes) {
      etapes[e.numero] = { id: e.id, numero: e.numero, statut: e.statut };
    }
    const commandes: Partial<Record<CategorieCommande, CelluleCommande>> = {};
    for (const c of p.commandes) {
      if (commandes[c.categorie]) continue;
      commandes[c.categorie] = {
        id: c.id,
        fournisseurNom: c.fournisseur.nom,
        semaineLivraisonPrevue: c.semaineLivraisonPrevue,
        statutCommande: c.statutCommande,
        statutLivraison: c.statutLivraison,
        essentielle: c.essentielle,
      };
    }
    const statutGlobal = calculerStatutGlobal({
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
    return {
      id: p.id,
      reference: p.reference,
      clientNom: p.client.nom,
      clientPrenom: p.client.prenom,
      clientTelephone: p.client.telephone,
      clientEmail: p.client.email,
      anneePose: p.anneePose,
      estRenovation: p.estRenovation,
      typeProjet: p.typeProjet,
      adresseChantier: p.adresseChantier,
      villeChantier: p.villeChantier,
      vendeurNom: p.vendeur ? `${p.vendeur.prenom} ${p.vendeur.nom}` : null,
      poseursNoms: p.assignations.map((a) => a.poseur.prenom).join(" / ") || "—",
      semainePose: p.semainePose,
      statutGlobal,
      etapes,
      commandes,
    };
  });

  const fournisseursParCategorie = await chargerFournisseursParCategorie();
  return { lignes, fournisseursParCategorie };
}
