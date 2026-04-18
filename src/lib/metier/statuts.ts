/**
 * Calcul du statut global d'un chantier à partir de ses étapes et commandes.
 * Règle du "premier match gagne" — ordre de l'énoncé métier.
 */
import type {
  CategorieCommande,
  StatutCommande,
  StatutEtape,
  StatutLivraison,
} from "@prisma/client";
import { joursAvantSemaine } from "@/lib/metier/semaines";

export type StatutGlobalProjet =
  | "termine"
  | "a_facturer"
  | "bloque"
  | "a_risque"
  | "vigilance"
  | "pret"
  | "en_cours";

/** Couleurs des statuts globaux — cohérentes avec `tailwind.config.ts`. */
export const COULEURS_STATUT_GLOBAL: Record<StatutGlobalProjet, string> = {
  termine: "#6b7280",
  a_facturer: "#9333ea",
  bloque: "#991b1b",
  a_risque: "#dc2626",
  vigilance: "#ea580c",
  pret: "#16a34a",
  en_cours: "#2563eb",
};

/** Libellés UI. */
export const LIBELLES_STATUT_GLOBAL: Record<StatutGlobalProjet, string> = {
  termine: "Terminé",
  a_facturer: "À facturer",
  bloque: "Bloqué",
  a_risque: "À risque",
  vigilance: "Vigilance",
  pret: "Prêt",
  en_cours: "En cours",
};

export interface EtapeInput {
  numero: number;
  statut: StatutEtape;
}

export interface CommandeInput {
  categorie: CategorieCommande;
  statutCommande: StatutCommande;
  statutLivraison: StatutLivraison;
  essentielle: boolean;
}

export interface ProjetInput {
  semainePose: string;
  anneePose: number;
  etapes: EtapeInput[];
  commandes: CommandeInput[];
}

const NUMERO_ETAPE_POSE = 8;
const NUMERO_ETAPE_FACTURATION = 9;

function etape(etapes: EtapeInput[], numero: number): EtapeInput | undefined {
  return etapes.find((e) => e.numero === numero);
}

/** Toutes les étapes sont-elles terminées ? */
function toutesTerminees(etapes: EtapeInput[]): boolean {
  return etapes.length > 0 && etapes.every((e) => e.statut === "termine");
}

/** Au moins une commande essentielle dans un état "non_envoye" ou "retard" (livraison). */
function commandesEssentiellesARisque(commandes: CommandeInput[]): boolean {
  return commandes.some(
    (c) =>
      c.essentielle &&
      (c.statutCommande === "non_envoye" || c.statutLivraison === "retard"),
  );
}

/** Au moins une commande essentielle en reliquat. */
function commandesEssentiellesEnReliquat(commandes: CommandeInput[]): boolean {
  return commandes.some((c) => c.essentielle && c.statutCommande === "reliquat");
}

/** Toutes les commandes essentielles sont livrées ? (Renvoie false s'il n'y en a aucune). */
function toutesEssentiellesLivrees(commandes: CommandeInput[]): boolean {
  const essentielles = commandes.filter((c) => c.essentielle);
  if (essentielles.length === 0) return false;
  return essentielles.every((c) => c.statutLivraison === "livre");
}

/**
 * Calcule le statut global d'un chantier.
 * Premier match gagne, ordre métier strict.
 */
export function calculerStatutGlobal(
  projet: ProjetInput,
  maintenant: Date = new Date(),
): StatutGlobalProjet {
  const { etapes, commandes, semainePose, anneePose } = projet;
  const etapePose = etape(etapes, NUMERO_ETAPE_POSE);
  const etapeFacturation = etape(etapes, NUMERO_ETAPE_FACTURATION);
  const jours = joursAvantSemaine(semainePose, anneePose, maintenant);

  // 1. Toutes les étapes terminées → Terminé.
  if (toutesTerminees(etapes)) return "termine";

  // 2. Pose terminée + facturation pas terminée → À facturer.
  if (
    etapePose?.statut === "termine" &&
    etapeFacturation?.statut !== "termine"
  ) {
    return "a_facturer";
  }

  // 3. Au moins une étape bloquée → Bloqué.
  if (etapes.some((e) => e.statut === "bloque")) return "bloque";

  // 4. Pose < 14 jours ET commande essentielle non envoyée ou en retard → À risque.
  if (jours < 14 && jours >= 0 && commandesEssentiellesARisque(commandes)) {
    return "a_risque";
  }

  // 5. Pose < 30 jours ET catégorie essentielle en reliquat → Vigilance.
  if (jours < 30 && jours >= 0 && commandesEssentiellesEnReliquat(commandes)) {
    return "vigilance";
  }

  // 6. Toutes essentielles livrées ET pose pas faite → Prêt.
  if (
    toutesEssentiellesLivrees(commandes) &&
    etapePose?.statut !== "termine"
  ) {
    return "pret";
  }

  // 7. Sinon → En cours.
  return "en_cours";
}
