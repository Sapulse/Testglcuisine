import "server-only";
import { prisma } from "@/lib/prisma";
import * as S from "@/lib/data/snapshot";
import { calculerStatutGlobal, type StatutGlobalProjet, LIBELLES_STATUT_GLOBAL } from "@/lib/metier/statuts";

export interface StatsVendeur {
  vendeurId: string;
  nom: string;
  nbProjets: number;
  caHT: number;
  caTTC: number;
}

export interface StatsFournisseur {
  fournisseurId: string;
  nom: string;
  nbCommandes: number;
  nbRetards: number;
  nbReliquats: number;
  txRetard: number; // 0..1
}

export interface StatsCategorie {
  categorie: string;
  nbCommandes: number;
  nbRetards: number;
  nbReliquats: number;
}

export interface Stats {
  nbProjets: number;
  caTotalHT: number;
  caTotalTTC: number;
  repartitionStatuts: Array<{ statut: StatutGlobalProjet; label: string; nb: number }>;
  vendeurs: StatsVendeur[];
  fournisseurs: StatsFournisseur[];
  categories: StatsCategorie[];
}

async function sourceProjets() {
  if (S.estModeStatique()) {
    return S.PROJETS.map((p) => ({
      ...p,
      etapes: S.ETAPES.filter((e) => e.projetId === p.id),
      commandes: S.COMMANDES.filter((c) => c.projetId === p.id),
      vendeur: p.vendeurId ? S.VENDEURS.find((v) => v.id === p.vendeurId) ?? null : null,
    }));
  }
  return prisma.projet.findMany({
    include: { etapes: true, commandes: true, vendeur: true },
  });
}

async function sourceCommandes() {
  if (S.estModeStatique()) {
    return S.COMMANDES.map((c) => ({
      ...c,
      fournisseur: S.FOURNISSEURS.find((f) => f.id === c.fournisseurId)!,
    }));
  }
  return prisma.commande.findMany({ include: { fournisseur: true } });
}

/** Agrège les statistiques business pour la page Analytics. */
export async function chargerStats(): Promise<Stats> {
  const [projets, commandes] = await Promise.all([sourceProjets(), sourceCommandes()]);

  const repartition: Record<StatutGlobalProjet, number> = {
    termine: 0,
    a_facturer: 0,
    bloque: 0,
    a_risque: 0,
    vigilance: 0,
    pret: 0,
    en_cours: 0,
  };

  const vendeursMap = new Map<string, StatsVendeur>();
  let caTotalHT = 0;
  let caTotalTTC = 0;

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
    repartition[statut]++;
    caTotalHT += p.montantHT ?? 0;
    caTotalTTC += p.montantTTC ?? 0;

    if (p.vendeur) {
      const key = p.vendeur.id;
      const cur = vendeursMap.get(key) ?? {
        vendeurId: key,
        nom: `${p.vendeur.prenom} ${p.vendeur.nom}`,
        nbProjets: 0,
        caHT: 0,
        caTTC: 0,
      };
      cur.nbProjets++;
      cur.caHT += p.montantHT ?? 0;
      cur.caTTC += p.montantTTC ?? 0;
      vendeursMap.set(key, cur);
    }
  }

  const fournisseursMap = new Map<string, StatsFournisseur>();
  const categoriesMap = new Map<string, StatsCategorie>();

  for (const c of commandes) {
    const fourn = fournisseursMap.get(c.fournisseurId) ?? {
      fournisseurId: c.fournisseurId,
      nom: c.fournisseur.nom,
      nbCommandes: 0,
      nbRetards: 0,
      nbReliquats: 0,
      txRetard: 0,
    };
    fourn.nbCommandes++;
    if (c.statutLivraison === "retard") fourn.nbRetards++;
    if (c.statutCommande === "reliquat") fourn.nbReliquats++;
    fournisseursMap.set(c.fournisseurId, fourn);

    const cat = categoriesMap.get(c.categorie) ?? {
      categorie: c.categorie,
      nbCommandes: 0,
      nbRetards: 0,
      nbReliquats: 0,
    };
    cat.nbCommandes++;
    if (c.statutLivraison === "retard") cat.nbRetards++;
    if (c.statutCommande === "reliquat") cat.nbReliquats++;
    categoriesMap.set(c.categorie, cat);
  }

  const fournisseurs = [...fournisseursMap.values()]
    .map((f) => ({ ...f, txRetard: f.nbCommandes > 0 ? f.nbRetards / f.nbCommandes : 0 }))
    .sort((a, b) => b.txRetard - a.txRetard);

  return {
    nbProjets: projets.length,
    caTotalHT,
    caTotalTTC,
    repartitionStatuts: (Object.keys(repartition) as StatutGlobalProjet[]).map((s) => ({
      statut: s,
      label: LIBELLES_STATUT_GLOBAL[s],
      nb: repartition[s],
    })),
    vendeurs: [...vendeursMap.values()].sort((a, b) => b.caTTC - a.caTTC),
    fournisseurs,
    categories: [...categoriesMap.values()].sort((a, b) => b.nbCommandes - a.nbCommandes),
  };
}
