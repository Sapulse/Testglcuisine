/**
 * Données mockées pour le dashboard du Sprint 1.
 * Seront remplacées par des lectures Prisma au Sprint 5.
 */
import type { StatutGlobalProjet } from "@/lib/metier/statuts";
import type { Alerte } from "@/lib/metier/alertes";

export interface ChantierResume {
  reference: string;
  client: string;
  ville: string;
  semainePose: string;
  poseur: string;
  statut: StatutGlobalProjet;
}

export interface CommandeResume {
  reference: string;
  client: string;
  fournisseur: string;
  categorie: string;
  semaine: string;
}

export interface LivraisonResume {
  reference: string;
  client: string;
  fournisseur: string;
  categorie: string;
  semaine: string;
  etat: "retard" | "cette_semaine";
}

export interface SAVResume {
  reference: string;
  client: string;
  probleme: string;
  ageJours: number;
  bloquant: boolean;
}

export const MOCK_ALERTES: Array<Alerte & { reference: string; client: string }> = [
  {
    id: "A1",
    niveau: "rouge",
    message: "Pose dans 2j et commande essentielle (meubles) non envoyée",
    reference: "2026-011",
    client: "Durand",
  },
  {
    id: "A3",
    niveau: "rouge",
    message: "Livraison plan_travail prévue cette semaine (S16) en retard",
    reference: "2026-005",
    client: "Kerleau",
  },
  {
    id: "A4",
    niveau: "orange",
    message: "Reliquat sur catégorie essentielle : meubles",
    reference: "2026-018",
    client: "Tanguy",
  },
  {
    id: "A5",
    niveau: "orange",
    message: "SAV bloquant ouvert depuis 16j",
    reference: "2026-018",
    client: "Tanguy",
  },
];

export const MOCK_CETTE_SEMAINE: ChantierResume[] = [
  {
    reference: "2026-005",
    client: "Kerleau",
    ville: "Plouzané",
    semainePose: "S16",
    poseur: "Malo / Yann",
    statut: "pret",
  },
];

export const MOCK_A_RISQUE: ChantierResume[] = [
  {
    reference: "2026-011",
    client: "Durand",
    ville: "Brest",
    semainePose: "S18",
    poseur: "Malo",
    statut: "a_risque",
  },
  {
    reference: "2026-018",
    client: "Tanguy",
    ville: "Brest",
    semainePose: "S23",
    poseur: "Yann",
    statut: "vigilance",
  },
];

export const MOCK_COMMANDES_NON_ENVOYEES: CommandeResume[] = [
  {
    reference: "2026-011",
    client: "Durand",
    fournisseur: "Snaidero",
    categorie: "meubles",
    semaine: "S17",
  },
];

export const MOCK_LIVRAISONS_CRITIQUES: LivraisonResume[] = [
  {
    reference: "2026-005",
    client: "Kerleau",
    fournisseur: "Silestone",
    categorie: "plan_travail",
    semaine: "S16",
    etat: "retard",
  },
];

export const MOCK_SAV_OUVERTS: SAVResume[] = [
  {
    reference: "2026-018",
    client: "Tanguy",
    probleme: "Caissons hauts manquants",
    ageJours: 16,
    bloquant: true,
  },
];
