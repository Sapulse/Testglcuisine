import { describe, it, expect } from "vitest";
import { calculerAlertes, type ProjetAlerteInput } from "./alertes";

const MAINTENANT = new Date("2026-04-18T12:00:00Z"); // samedi S16

function etapes(
  overrides: Record<number, "non_commence" | "en_cours" | "termine" | "bloque"> = {},
) {
  return Array.from({ length: 9 }, (_, i) => ({
    numero: i + 1,
    statut: overrides[i + 1] ?? ("non_commence" as const),
  }));
}

function projet(partial: Partial<ProjetAlerteInput>): ProjetAlerteInput {
  return {
    semainePose: "S30",
    anneePose: 2026,
    estRenovation: false,
    etapes: etapes(),
    commandes: [],
    sav: [],
    ...partial,
  };
}

describe("alertes A1 — pose < 7j et commande essentielle non_envoye", () => {
  it("déclenche quand pose dans 5j et commande essentielle non envoyée", () => {
    const p = projet({
      semainePose: "S17", // lundi = 20 avril → 2 jours depuis le 18 avril
      commandes: [{
        categorie: "meubles",
        statutCommande: "non_envoye",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: null,
        essentielle: true,
      }],
    });
    const res = calculerAlertes(p, MAINTENANT);
    expect(res.some((a) => a.id === "A1")).toBe(true);
  });
  it("ne déclenche pas si pose > 7j", () => {
    const p = projet({
      semainePose: "S20",
      commandes: [{
        categorie: "meubles",
        statutCommande: "non_envoye",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: null,
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A1")).toBe(false);
  });
  it("ne déclenche pas si la commande non_envoye n'est pas essentielle", () => {
    const p = projet({
      semainePose: "S17",
      commandes: [{
        categorie: "accessoires",
        statutCommande: "non_envoye",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: null,
        essentielle: false,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A1")).toBe(false);
  });
});

describe("alertes A2 — pose < 14j et livraison essentielle manquante", () => {
  it("déclenche quand pose dans 9j et livraison pas faite", () => {
    const p = projet({
      semainePose: "S18",
      commandes: [{
        categorie: "plan_travail",
        statutCommande: "envoye",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: "S18",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A2")).toBe(true);
  });
  it("ne déclenche pas si livraison déjà faite", () => {
    const p = projet({
      semainePose: "S18",
      commandes: [{
        categorie: "plan_travail",
        statutCommande: "livre",
        statutLivraison: "livre",
        semaineLivraisonPrevue: "S17",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A2")).toBe(false);
  });
  it("ne déclenche pas si pose > 14j", () => {
    const p = projet({
      semainePose: "S25",
      commandes: [{
        categorie: "plan_travail",
        statutCommande: "envoye",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: "S25",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A2")).toBe(false);
  });
});

describe("alertes A3 — livraison cette semaine en retard", () => {
  it("déclenche si une livraison prévue S16 est en retard", () => {
    const p = projet({
      commandes: [{
        categorie: "plan_travail",
        statutCommande: "expedie",
        statutLivraison: "retard",
        semaineLivraisonPrevue: "S16",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A3")).toBe(true);
  });
  it("ne déclenche pas si la livraison est prévue une autre semaine", () => {
    const p = projet({
      commandes: [{
        categorie: "plan_travail",
        statutCommande: "expedie",
        statutLivraison: "retard",
        semaineLivraisonPrevue: "S17",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A3")).toBe(false);
  });
  it("ne déclenche pas si le statut n'est pas retard", () => {
    const p = projet({
      commandes: [{
        categorie: "plan_travail",
        statutCommande: "expedie",
        statutLivraison: "en_attente",
        semaineLivraisonPrevue: "S16",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A3")).toBe(false);
  });
});

describe("alertes A4 — reliquat sur essentielle", () => {
  it("déclenche si reliquat sur essentielle", () => {
    const p = projet({
      commandes: [{
        categorie: "meubles",
        statutCommande: "reliquat",
        statutLivraison: "partiel",
        semaineLivraisonPrevue: "S20",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A4")).toBe(true);
  });
  it("ne déclenche pas si reliquat sur non-essentielle", () => {
    const p = projet({
      commandes: [{
        categorie: "accessoires",
        statutCommande: "reliquat",
        statutLivraison: "partiel",
        semaineLivraisonPrevue: "S20",
        essentielle: false,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A4")).toBe(false);
  });
  it("ne déclenche pas sans reliquat", () => {
    const p = projet({
      commandes: [{
        categorie: "meubles",
        statutCommande: "livre",
        statutLivraison: "livre",
        semaineLivraisonPrevue: "S14",
        essentielle: true,
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A4")).toBe(false);
  });
});

describe("alertes A5 — SAV bloquant > 15j", () => {
  it("déclenche pour SAV bloquant ouvert depuis 20j", () => {
    const p = projet({
      sav: [{
        statut: "ouvert",
        bloquant: true,
        dateOuverture: new Date("2026-03-28T00:00:00Z"),
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A5")).toBe(true);
  });
  it("ne déclenche pas si SAV non bloquant", () => {
    const p = projet({
      sav: [{
        statut: "ouvert",
        bloquant: false,
        dateOuverture: new Date("2026-03-01T00:00:00Z"),
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A5")).toBe(false);
  });
  it("ne déclenche pas si SAV résolu", () => {
    const p = projet({
      sav: [{
        statut: "resolu",
        bloquant: true,
        dateOuverture: new Date("2026-03-01T00:00:00Z"),
      }],
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A5")).toBe(false);
  });
});

describe("alertes A6 — pose < 30j et plans techniques non_commence", () => {
  it("déclenche quand pose dans 20j et plans techniques pas démarrés", () => {
    const p = projet({
      semainePose: "S20",
      etapes: etapes({ 2: "non_commence" }),
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A6")).toBe(true);
  });
  it("ne déclenche pas si plans techniques démarrés", () => {
    const p = projet({
      semainePose: "S20",
      etapes: etapes({ 2: "en_cours" }),
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A6")).toBe(false);
  });
  it("ne déclenche pas si pose > 30j", () => {
    const p = projet({
      semainePose: "S30",
      etapes: etapes({ 2: "non_commence" }),
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A6")).toBe(false);
  });
});

describe("alertes A7 — rénovation : pose < 7j et prépa élec non_commence", () => {
  it("déclenche pour rénovation avec pose proche et prépa élec vierge", () => {
    const p = projet({
      semainePose: "S17",
      estRenovation: true,
      etapes: etapes({ 7: "non_commence" }),
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A7")).toBe(true);
  });
  it("ne déclenche pas pour un projet neuf", () => {
    const p = projet({
      semainePose: "S17",
      estRenovation: false,
      etapes: etapes({ 7: "non_commence" }),
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A7")).toBe(false);
  });
  it("ne déclenche pas si prépa élec démarrée", () => {
    const p = projet({
      semainePose: "S17",
      estRenovation: true,
      etapes: etapes({ 7: "en_cours" }),
    });
    expect(calculerAlertes(p, MAINTENANT).some((a) => a.id === "A7")).toBe(false);
  });
});
