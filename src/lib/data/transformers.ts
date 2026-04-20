/**
 * Transforme les données brutes du LocalStore en formes attendues par les
 * composants client (équivalent client-side des queries Prisma server).
 */
import type { SnapshotData } from "./local-store";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";

export interface ProjetPourListe {
  id: string;
  reference: string;
  clientPrenom: string;
  clientNom: string;
  typeProjet: string;
  villeChantier: string;
  semainePose: string;
  anneePose: number;
  vendeurId: string | null;
  poseurIds: string[];
  poseursNoms: string;
  statutGlobal: StatutGlobalProjet;
}

export function projetsPourListe(s: SnapshotData): ProjetPourListe[] {
  return s.projets.map((p) => {
    const client = s.clients.find((c) => c.id === p.clientId);
    const etapes = s.etapes.filter((e) => e.projetId === p.id);
    const commandes = s.commandes.filter((c) => c.projetId === p.id);
    const assignations = s.assignations.filter((a) => a.projetId === p.id);
    const poseurs = assignations.map((a) => s.poseurs.find((po) => po.id === a.poseurId)?.prenom ?? "?");
    const statutGlobal = calculerStatutGlobal({
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
      clientPrenom: client?.prenom ?? "?",
      clientNom: client?.nom ?? "?",
      typeProjet: p.typeProjet,
      villeChantier: p.villeChantier,
      semainePose: p.semainePose,
      anneePose: p.anneePose,
      vendeurId: p.vendeurId,
      poseurIds: assignations.map((a) => a.poseurId),
      poseursNoms: poseurs.join(" / ") || "—",
      statutGlobal,
    };
  });
}

export interface ClientPourListe {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string;
  codePostal: string;
  ville: string;
  nbProjets: number;
}

export function clientsPourListe(s: SnapshotData): ClientPourListe[] {
  return [...s.clients]
    .sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom))
    .map((c) => ({
      ...c,
      nbProjets: s.projets.filter((p) => p.clientId === c.id).length,
    }));
}

export function fournisseursPourListe(s: SnapshotData) {
  return [...s.fournisseurs].sort((a, b) => a.nom.localeCompare(b.nom));
}

export function poseursPourListe(s: SnapshotData) {
  return [...s.poseurs].sort(
    (a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom),
  );
}

export function vendeursPourListe(s: SnapshotData) {
  return [...s.vendeurs].sort(
    (a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom),
  );
}
