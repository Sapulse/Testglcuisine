/**
 * Calcul des 7 règles d'alerte du tableau de bord.
 * Alertes calculées à la volée, jamais stockées.
 */
import type {
  CategorieCommande,
  StatutCommande,
  StatutEtape,
  StatutLivraison,
  StatutSAV,
} from "@prisma/client";
import { joursAvantSemaine, semaineActuelle, anneeActuelle } from "@/lib/metier/semaines";

export type NiveauAlerte = "rouge" | "orange" | "jaune";

export type IdAlerte = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";

export interface Alerte {
  id: IdAlerte;
  niveau: NiveauAlerte;
  message: string;
}

interface CommandeAlerte {
  categorie: CategorieCommande;
  statutCommande: StatutCommande;
  statutLivraison: StatutLivraison;
  semaineLivraisonPrevue: string | null;
  essentielle: boolean;
}

interface EtapeAlerte {
  numero: number; // 1..9
  statut: StatutEtape;
}

interface SavAlerte {
  statut: StatutSAV;
  bloquant: boolean;
  dateOuverture: Date;
}

export interface ProjetAlerteInput {
  semainePose: string;
  anneePose: number;
  estRenovation: boolean;
  etapes: EtapeAlerte[];
  commandes: CommandeAlerte[];
  sav: SavAlerte[];
}

const NUMERO_PLANS_TECHNIQUES = 2;
const NUMERO_PREPA_ELEC = 7;

const MS_PAR_JOUR = 86_400_000;

/**
 * Détermine toutes les alertes actives pour un projet à une date donnée.
 * L'ordre du tableau reflète la priorité visuelle (rouge > orange > jaune).
 */
export function calculerAlertes(
  projet: ProjetAlerteInput,
  maintenant: Date = new Date(),
): Alerte[] {
  const alertes: Alerte[] = [];
  const jours = joursAvantSemaine(projet.semainePose, projet.anneePose, maintenant);
  const semaineCourante = semaineActuelle(maintenant);
  const anneeCourante = anneeActuelle(maintenant);

  // A1 — Pose < 7j ET commande essentielle non_envoye.
  if (jours >= 0 && jours < 7) {
    const cmd = projet.commandes.find(
      (c) => c.essentielle && c.statutCommande === "non_envoye",
    );
    if (cmd) {
      alertes.push({
        id: "A1",
        niveau: "rouge",
        message: `Pose dans ${jours}j et commande essentielle (${cmd.categorie}) non envoyée`,
      });
    }
  }

  // A2 — Pose < 14j ET livraison essentielle manquante.
  if (jours >= 0 && jours < 14) {
    const manquante = projet.commandes.find(
      (c) => c.essentielle && c.statutLivraison !== "livre",
    );
    if (manquante) {
      alertes.push({
        id: "A2",
        niveau: "rouge",
        message: `Pose dans ${jours}j et livraison essentielle (${manquante.categorie}) manquante`,
      });
    }
  }

  // A3 — Livraison prévue cette semaine ET statut retard.
  const livraisonRetardSemaine = projet.commandes.find(
    (c) =>
      c.statutLivraison === "retard" &&
      c.semaineLivraisonPrevue === semaineCourante,
  );
  if (livraisonRetardSemaine) {
    alertes.push({
      id: "A3",
      niveau: "rouge",
      message: `Livraison ${livraisonRetardSemaine.categorie} prévue cette semaine (${semaineCourante}) en retard`,
    });
    void anneeCourante; // année courante disponible pour évolutions futures
  }

  // A4 — Reliquat sur catégorie essentielle.
  const reliquat = projet.commandes.find(
    (c) => c.essentielle && c.statutCommande === "reliquat",
  );
  if (reliquat) {
    alertes.push({
      id: "A4",
      niveau: "orange",
      message: `Reliquat sur catégorie essentielle : ${reliquat.categorie}`,
    });
  }

  // A5 — SAV ouvert bloquant depuis > 15 jours.
  const savVieux = projet.sav.find((s) => {
    if (!s.bloquant) return false;
    if (s.statut === "resolu" || s.statut === "clos") return false;
    const age = (maintenant.getTime() - s.dateOuverture.getTime()) / MS_PAR_JOUR;
    return age > 15;
  });
  if (savVieux) {
    const age = Math.floor(
      (maintenant.getTime() - savVieux.dateOuverture.getTime()) / MS_PAR_JOUR,
    );
    alertes.push({
      id: "A5",
      niveau: "orange",
      message: `SAV bloquant ouvert depuis ${age}j`,
    });
  }

  // A6 — Pose < 30j ET plans techniques non_commence.
  if (jours >= 0 && jours < 30) {
    const plans = projet.etapes.find((e) => e.numero === NUMERO_PLANS_TECHNIQUES);
    if (plans?.statut === "non_commence") {
      alertes.push({
        id: "A6",
        niveau: "orange",
        message: `Pose dans ${jours}j et plans techniques pas démarrés`,
      });
    }
  }

  // A7 — Pose < 7j ET prépa élec non_commence (rénovation).
  if (projet.estRenovation && jours >= 0 && jours < 7) {
    const prepa = projet.etapes.find((e) => e.numero === NUMERO_PREPA_ELEC);
    if (prepa?.statut === "non_commence") {
      alertes.push({
        id: "A7",
        niveau: "jaune",
        message: `Rénovation : pose dans ${jours}j et prépa élec pas démarrée`,
      });
    }
  }

  return alertes;
}

/** Priorité de tri (utilisable pour un sort). */
export const PRIORITE_NIVEAU: Record<NiveauAlerte, number> = {
  rouge: 0,
  orange: 1,
  jaune: 2,
};
