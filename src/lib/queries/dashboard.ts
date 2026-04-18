import "server-only";
import { prisma } from "@/lib/prisma";
import { calculerAlertes, type Alerte } from "@/lib/metier/alertes";
import { calculerStatutGlobal, type StatutGlobalProjet } from "@/lib/metier/statuts";
import { semaineActuelle, anneeActuelle } from "@/lib/metier/semaines";
import * as S from "@/lib/data/snapshot";

export interface AlerteAffichee extends Alerte {
  projetId: string;
  reference: string;
  client: string;
}

export interface ChantierResumeDashboard {
  id: string;
  reference: string;
  client: string;
  ville: string;
  semainePose: string;
  poseurs: string;
  statut: StatutGlobalProjet;
}

export interface CommandeResumeDashboard {
  id: string;
  projetId: string;
  reference: string;
  client: string;
  fournisseur: string;
  categorie: string;
  semaine: string | null;
}

export interface LivraisonResumeDashboard extends CommandeResumeDashboard {
  etat: "retard" | "cette_semaine";
}

export interface SavResumeDashboard {
  id: string;
  projetId: string;
  reference: string;
  client: string;
  probleme: string;
  ageJours: number;
  bloquant: boolean;
}

const JOUR_MS = 86_400_000;

/** Date de référence : mode statique → fixée à avril 2026 (cohérence démo). */
function maintenantDemo(): Date {
  return S.estModeStatique()
    ? new Date("2026-04-18T12:00:00Z")
    : new Date();
}

async function projetsAvecDetails() {
  if (S.estModeStatique()) {
    return S.PROJETS.map((p) => {
      const client = S.CLIENTS.find((c) => c.id === p.clientId)!;
      return {
        ...p,
        client,
        etapes: S.ETAPES.filter((e) => e.projetId === p.id).sort(
          (a, b) => a.numero - b.numero,
        ),
        commandes: S.COMMANDES.filter((c) => c.projetId === p.id).map((c) => ({
          ...c,
          fournisseur: S.FOURNISSEURS.find((f) => f.id === c.fournisseurId)!,
        })),
        sav: S.SAVS.filter((s) => s.projetId === p.id),
        assignations: S.ASSIGNATIONS.filter((a) => a.projetId === p.id).map((a) => ({
          ...a,
          poseur: S.POSEURS.find((po) => po.id === a.poseurId)!,
        })),
      };
    });
  }
  return prisma.projet.findMany({
    include: {
      client: true,
      etapes: { orderBy: { numero: "asc" } },
      commandes: { include: { fournisseur: true } },
      sav: true,
      assignations: { include: { poseur: true } },
    },
    orderBy: [{ anneePose: "asc" }, { semainePose: "asc" }],
  });
}

async function savsOuverts() {
  if (S.estModeStatique()) {
    return S.SAVS.filter((s) => s.statut !== "resolu" && s.statut !== "clos")
      .map((s) => {
        const projet = S.PROJETS.find((p) => p.id === s.projetId)!;
        const client = S.CLIENTS.find((c) => c.id === projet.clientId)!;
        return { ...s, projet: { ...projet, client } };
      })
      .sort((a, b) => a.dateOuverture.getTime() - b.dateOuverture.getTime());
  }
  return prisma.sAV.findMany({
    where: { statut: { notIn: ["resolu", "clos"] } },
    include: { projet: { include: { client: true } } },
    orderBy: { dateOuverture: "asc" },
  });
}

export async function chargerDashboard(maintenant: Date = maintenantDemo()) {
  const semaine = semaineActuelle(maintenant);
  const annee = anneeActuelle(maintenant);
  const projets = await projetsAvecDetails();

  const alertes: AlerteAffichee[] = [];
  const cetteSemaine: ChantierResumeDashboard[] = [];
  const aRisque: ChantierResumeDashboard[] = [];
  const commandesNonEnvoyees: CommandeResumeDashboard[] = [];
  const livraisonsCritiques: LivraisonResumeDashboard[] = [];

  for (const p of projets) {
    const etapesInput = p.etapes.map((e) => ({ numero: e.numero, statut: e.statut }));
    const commandesInput = p.commandes.map((c) => ({
      categorie: c.categorie,
      statutCommande: c.statutCommande,
      statutLivraison: c.statutLivraison,
      essentielle: c.essentielle,
    }));

    const statut = calculerStatutGlobal(
      {
        semainePose: p.semainePose,
        anneePose: p.anneePose,
        etapes: etapesInput,
        commandes: commandesInput,
      },
      maintenant,
    );

    const resume: ChantierResumeDashboard = {
      id: p.id,
      reference: p.reference,
      client: `${p.client.prenom} ${p.client.nom}`,
      ville: p.villeChantier,
      semainePose: p.semainePose,
      poseurs: p.assignations.map((a) => a.poseur.prenom).join(" / ") || "—",
      statut,
    };

    if (p.semainePose === semaine && p.anneePose === annee) cetteSemaine.push(resume);
    if (statut === "a_risque" || statut === "vigilance" || statut === "bloque")
      aRisque.push(resume);

    const alertesProjet = calculerAlertes(
      {
        semainePose: p.semainePose,
        anneePose: p.anneePose,
        estRenovation: p.estRenovation,
        etapes: etapesInput,
        commandes: p.commandes.map((c) => ({
          categorie: c.categorie,
          statutCommande: c.statutCommande,
          statutLivraison: c.statutLivraison,
          semaineLivraisonPrevue: c.semaineLivraisonPrevue,
          essentielle: c.essentielle,
        })),
        sav: p.sav.map((s) => ({
          statut: s.statut,
          bloquant: s.bloquant,
          dateOuverture: s.dateOuverture,
        })),
      },
      maintenant,
    );
    for (const a of alertesProjet) {
      alertes.push({
        ...a,
        projetId: p.id,
        reference: p.reference,
        client: `${p.client.prenom} ${p.client.nom}`,
      });
    }

    for (const c of p.commandes) {
      if (c.statutCommande === "non_envoye") {
        commandesNonEnvoyees.push({
          id: c.id,
          projetId: p.id,
          reference: p.reference,
          client: `${p.client.prenom} ${p.client.nom}`,
          fournisseur: c.fournisseur.nom,
          categorie: c.categorie,
          semaine: c.semaineLivraisonPrevue,
        });
      }
      const enRetard = c.statutLivraison === "retard";
      const attendueSemaine = c.semaineLivraisonPrevue === semaine;
      if (c.essentielle && (enRetard || attendueSemaine)) {
        livraisonsCritiques.push({
          id: c.id,
          projetId: p.id,
          reference: p.reference,
          client: `${p.client.prenom} ${p.client.nom}`,
          fournisseur: c.fournisseur.nom,
          categorie: c.categorie,
          semaine: c.semaineLivraisonPrevue,
          etat: enRetard ? "retard" : "cette_semaine",
        });
      }
    }
  }

  const savDb = await savsOuverts();
  const savOuverts: SavResumeDashboard[] = savDb.map((s) => ({
    id: s.id,
    projetId: s.projetId,
    reference: s.projet.reference,
    client: `${s.projet.client.prenom} ${s.projet.client.nom}`,
    probleme: s.typeProbleme,
    ageJours: Math.floor((maintenant.getTime() - s.dateOuverture.getTime()) / JOUR_MS),
    bloquant: s.bloquant,
  }));

  alertes.sort((a, b) => {
    const ordre: Record<string, number> = { rouge: 0, orange: 1, jaune: 2 };
    return ordre[a.niveau] - ordre[b.niveau];
  });

  return {
    semaine,
    alertes,
    cetteSemaine,
    aRisque,
    commandesNonEnvoyees,
    livraisonsCritiques,
    savOuverts,
  };
}
