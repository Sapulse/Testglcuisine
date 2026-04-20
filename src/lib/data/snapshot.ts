/**
 * Snapshot de données pour la démo GitHub Pages (mode STATIC).
 * Reflète exactement ce que le seed met en base.
 */
import type {
  CategorieCommande,
  RoleAssignation,
  StatutCommande,
  StatutEtape,
  StatutLivraison,
  StatutSAV,
  TypeJournalSAV,
  TypeProjet,
} from "@prisma/client";

export interface SnapshotClient {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string;
  codePostal: string;
  ville: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotFournisseur {
  id: string;
  nom: string;
  contact: string | null;
  telephone: string | null;
  email: string | null;
  categories: CategorieCommande[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotPoseur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  interne: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotVendeur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotEtape {
  id: string;
  projetId: string;
  numero: number;
  nom: string;
  statut: StatutEtape;
  dateFin: Date | null;
  commentaire: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotCommande {
  id: string;
  projetId: string;
  fournisseurId: string;
  categorie: CategorieCommande;
  statutCommande: StatutCommande;
  semaineLivraisonPrevue: string | null;
  statutLivraison: StatutLivraison;
  essentielle: boolean;
  remarque: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotAssignation {
  id: string;
  projetId: string;
  poseurId: string;
  semaine: string;
  annee: number;
  role: RoleAssignation;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotSAVJournal {
  id: string;
  savId: string;
  type: TypeJournalSAV;
  auteur: string | null;
  commentaire: string;
  horodatage: Date;
  createdAt: Date;
}

export interface SnapshotSAV {
  id: string;
  projetId: string;
  fournisseurId: string | null;
  categorie: CategorieCommande | null;
  typeProbleme: string;
  statut: StatutSAV;
  bloquant: boolean;
  dateOuverture: Date;
  dateIntervention: Date | null;
  dateCloture: Date | null;
  commentaire: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotProjet {
  id: string;
  reference: string;
  clientId: string;
  vendeurId: string | null;
  typeProjet: TypeProjet;
  adresseChantier: string;
  codePostalChantier: string;
  villeChantier: string;
  montantHT: number | null;
  montantTTC: number | null;
  semainePose: string;
  anneePose: number;
  estRenovation: boolean;
  dateCreation: Date;
  dateSignature: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const NOW = new Date("2026-04-18T12:00:00Z");

// ─── Fournisseurs ───
export const FOURNISSEURS: SnapshotFournisseur[] = [
  {
    id: "f-snaidero",
    nom: "Snaidero",
    contact: "Julien Martin",
    telephone: "02 98 00 11 22",
    email: "contact@snaidero.fr",
    categories: ["meubles", "accessoires"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "f-bosch",
    nom: "Bosch",
    contact: "Service pro",
    telephone: "0 800 05 50 50",
    email: "pro@bosch.fr",
    categories: ["electromenagers"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "f-silestone",
    nom: "Silestone",
    contact: "Agence Ouest",
    telephone: "02 40 00 00 00",
    email: "ouest@silestone.fr",
    categories: ["plan_travail", "credence"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "f-quick",
    nom: "Quick Fix",
    contact: "Patricia",
    telephone: "02 98 33 44 55",
    email: "contact@quickfix.fr",
    categories: ["accessoires", "fond_hotte"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "f-leroy",
    nom: "Leroy Sanitaires",
    contact: "Showroom Brest",
    telephone: "02 98 77 66 55",
    email: "brest@leroy-sanitaires.fr",
    categories: ["sanitaires"],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ─── Poseurs ───
export const POSEURS: SnapshotPoseur[] = [
  {
    id: "p-malo",
    nom: "Le Gall",
    prenom: "Malo",
    telephone: "06 11 22 33 44",
    interne: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "p-yann",
    nom: "Riou",
    prenom: "Yann",
    telephone: "06 55 66 77 88",
    interne: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ─── Vendeurs ───
export const VENDEURS: SnapshotVendeur[] = [
  {
    id: "v-gildas",
    nom: "Gourmelen",
    prenom: "Gildas",
    telephone: "06 12 34 56 78",
    email: "gildas@glcuisines.fr",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ─── Clients ───
export const CLIENTS: SnapshotClient[] = [
  {
    id: "c-durand",
    nom: "Durand",
    prenom: "Catherine",
    telephone: "06 01 02 03 04",
    email: "c.durand@example.fr",
    adresse: "12 rue de Siam",
    codePostal: "29200",
    ville: "Brest",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "c-tanguy",
    nom: "Tanguy",
    prenom: "Erwan",
    telephone: "06 10 20 30 40",
    email: "e.tanguy@example.fr",
    adresse: "4 place Guérin",
    codePostal: "29200",
    ville: "Brest",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "c-kerleau",
    nom: "Kerleau",
    prenom: "Soizic",
    telephone: "06 98 76 54 32",
    email: "s.kerleau@example.fr",
    adresse: "18 rue de la Porte",
    codePostal: "29280",
    ville: "Plouzané",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const NOMS_ETAPES = [
  "Bon de commande",
  "Plans techniques",
  "Plans de pose",
  "Commandes passées",
  "Livraisons reçues",
  "Dépose",
  "Prépa électrique",
  "Pose",
  "Facturation",
];

function mkEtapes(
  projetId: string,
  statuts: StatutEtape[],
): SnapshotEtape[] {
  return NOMS_ETAPES.map((nom, i) => ({
    id: `e-${projetId}-${i + 1}`,
    projetId,
    numero: i + 1,
    nom,
    statut: statuts[i],
    dateFin: null,
    commentaire: null,
    createdAt: NOW,
    updatedAt: NOW,
  }));
}

// ─── Projets ───
export const PROJETS: SnapshotProjet[] = [
  {
    id: "pr-durand",
    reference: "2026-011",
    clientId: "c-durand",
    vendeurId: "v-gildas",
    typeProjet: "cuisine",
    adresseChantier: "12 rue de Siam",
    codePostalChantier: "29200",
    villeChantier: "Brest",
    montantHT: 24500,
    montantTTC: 29400,
    semainePose: "S18",
    anneePose: 2026,
    estRenovation: true,
    dateCreation: NOW,
    dateSignature: new Date("2026-02-14"),
    notes: "Cliente très exigeante sur les finitions — vérifier 2× les coloris.",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "pr-tanguy",
    reference: "2026-018",
    clientId: "c-tanguy",
    vendeurId: "v-gildas",
    typeProjet: "cuisine",
    adresseChantier: "4 place Guérin",
    codePostalChantier: "29200",
    villeChantier: "Brest",
    montantHT: 32000,
    montantTTC: 38400,
    semainePose: "S23",
    anneePose: 2026,
    estRenovation: false,
    dateCreation: NOW,
    dateSignature: new Date("2026-03-02"),
    notes: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "pr-kerleau",
    reference: "2026-005",
    clientId: "c-kerleau",
    vendeurId: "v-gildas",
    typeProjet: "cuisine",
    adresseChantier: "18 rue de la Porte",
    codePostalChantier: "29280",
    villeChantier: "Plouzané",
    montantHT: 18500,
    montantTTC: 22200,
    semainePose: "S16",
    anneePose: 2026,
    estRenovation: true,
    dateCreation: NOW,
    dateSignature: new Date("2026-01-18"),
    notes: "Rénovation complète — coupure eau prévue le matin de la dépose.",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ─── Étapes ───
export const ETAPES: SnapshotEtape[] = [
  ...mkEtapes("pr-durand", [
    "termine",
    "en_cours",
    "non_commence",
    "non_commence",
    "non_commence",
    "non_commence",
    "non_commence",
    "non_commence",
    "non_commence",
  ]),
  ...mkEtapes("pr-tanguy", [
    "termine",
    "termine",
    "termine",
    "termine",
    "en_cours",
    "non_commence",
    "en_cours",
    "non_commence",
    "non_commence",
  ]),
  ...mkEtapes("pr-kerleau", [
    "termine",
    "termine",
    "termine",
    "termine",
    "en_cours",
    "termine",
    "en_cours",
    "non_commence",
    "non_commence",
  ]),
];

// ─── Commandes ───
export const COMMANDES: SnapshotCommande[] = [
  {
    id: "cmd-du-1",
    projetId: "pr-durand",
    fournisseurId: "f-snaidero",
    categorie: "meubles",
    statutCommande: "non_envoye",
    semaineLivraisonPrevue: "S17",
    statutLivraison: "en_attente",
    essentielle: true,
    remarque: "Attente finition coloris",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-du-2",
    projetId: "pr-durand",
    fournisseurId: "f-bosch",
    categorie: "electromenagers",
    statutCommande: "confirme",
    semaineLivraisonPrevue: "S17",
    statutLivraison: "en_attente",
    essentielle: true,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-du-3",
    projetId: "pr-durand",
    fournisseurId: "f-silestone",
    categorie: "plan_travail",
    statutCommande: "envoye",
    semaineLivraisonPrevue: "S18",
    statutLivraison: "en_attente",
    essentielle: true,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ta-1",
    projetId: "pr-tanguy",
    fournisseurId: "f-snaidero",
    categorie: "meubles",
    statutCommande: "reliquat",
    semaineLivraisonPrevue: "S20",
    statutLivraison: "partiel",
    essentielle: true,
    remarque: "Manque 2 caissons hauts",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ta-2",
    projetId: "pr-tanguy",
    fournisseurId: "f-bosch",
    categorie: "electromenagers",
    statutCommande: "livre",
    semaineLivraisonPrevue: "S18",
    statutLivraison: "livre",
    essentielle: true,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ta-3",
    projetId: "pr-tanguy",
    fournisseurId: "f-quick",
    categorie: "accessoires",
    statutCommande: "confirme",
    semaineLivraisonPrevue: "S21",
    statutLivraison: "en_attente",
    essentielle: false,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ke-1",
    projetId: "pr-kerleau",
    fournisseurId: "f-snaidero",
    categorie: "meubles",
    statutCommande: "livre",
    semaineLivraisonPrevue: "S14",
    statutLivraison: "livre",
    essentielle: true,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ke-2",
    projetId: "pr-kerleau",
    fournisseurId: "f-bosch",
    categorie: "electromenagers",
    statutCommande: "livre",
    semaineLivraisonPrevue: "S15",
    statutLivraison: "livre",
    essentielle: true,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ke-3",
    projetId: "pr-kerleau",
    fournisseurId: "f-silestone",
    categorie: "plan_travail",
    statutCommande: "expedie",
    semaineLivraisonPrevue: "S16",
    statutLivraison: "retard",
    essentielle: true,
    remarque: "Camion bloqué – livraison décalée de 2j",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "cmd-ke-4",
    projetId: "pr-kerleau",
    fournisseurId: "f-leroy",
    categorie: "sanitaires",
    statutCommande: "livre",
    semaineLivraisonPrevue: "S15",
    statutLivraison: "livre",
    essentielle: false,
    remarque: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ─── Assignations ───
export const ASSIGNATIONS: SnapshotAssignation[] = [
  {
    id: "as-du",
    projetId: "pr-durand",
    poseurId: "p-malo",
    semaine: "S18",
    annee: 2026,
    role: "principal",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "as-ta",
    projetId: "pr-tanguy",
    poseurId: "p-yann",
    semaine: "S23",
    annee: 2026,
    role: "principal",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "as-ke-1",
    projetId: "pr-kerleau",
    poseurId: "p-malo",
    semaine: "S16",
    annee: 2026,
    role: "principal",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "as-ke-2",
    projetId: "pr-kerleau",
    poseurId: "p-yann",
    semaine: "S16",
    annee: 2026,
    role: "secondaire",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ─── SAV ───
export const SAVS: SnapshotSAV[] = [
  {
    id: "sav-tanguy",
    projetId: "pr-tanguy",
    fournisseurId: "f-snaidero",
    categorie: "meubles",
    typeProbleme: "Caissons hauts manquants sur livraison partielle",
    statut: "en_attente_fournisseur",
    bloquant: true,
    dateOuverture: new Date("2026-04-02"),
    dateIntervention: null,
    dateCloture: null,
    commentaire: "Snaidero s'engage à livrer les caissons manquants S20.",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SAV_JOURNAUX: SnapshotSAVJournal[] = [
  {
    id: "jrn-1",
    savId: "sav-tanguy",
    type: "creation",
    auteur: "Gildas",
    commentaire: "Ticket ouvert suite livraison partielle.",
    horodatage: new Date("2026-04-02T09:30:00"),
    createdAt: new Date("2026-04-02T09:30:00"),
  },
  {
    id: "jrn-2",
    savId: "sav-tanguy",
    type: "note",
    auteur: "Gildas",
    commentaire: "Relance téléphonique — engagement livraison S20.",
    horodatage: new Date("2026-04-08T14:15:00"),
    createdAt: new Date("2026-04-08T14:15:00"),
  },
];

/** Le mode statique est-il actif ? (GitHub Pages build) */
export function estModeStatique(): boolean {
  return process.env.NEXT_STATIC === "1";
}
