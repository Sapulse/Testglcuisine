import { describe, it, expect } from "vitest";
import {
  formaterSemaine,
  parserSemaine,
  dateVersSemaine,
  semaineVersDates,
  semaineActuelle,
  joursAvantSemaine,
} from "./semaines";

describe("formaterSemaine", () => {
  it("formate un numéro simple", () => {
    expect(formaterSemaine(1)).toBe("S01");
  });
  it("formate un numéro à deux chiffres", () => {
    expect(formaterSemaine(16)).toBe("S16");
  });
  it("rejette les numéros hors plage", () => {
    expect(() => formaterSemaine(0)).toThrow();
    expect(() => formaterSemaine(54)).toThrow();
  });
});

describe("parserSemaine", () => {
  it("parse un label valide", () => {
    expect(parserSemaine("S16")).toBe(16);
  });
  it("rejette un format invalide", () => {
    expect(() => parserSemaine("16")).toThrow();
    expect(() => parserSemaine("S1")).toThrow();
  });
  it("rejette un numéro hors plage", () => {
    expect(() => parserSemaine("S00")).toThrow();
    expect(() => parserSemaine("S54")).toThrow();
  });
});

describe("dateVersSemaine", () => {
  it("4 janvier est toujours en semaine 1", () => {
    expect(dateVersSemaine(new Date("2026-01-04T12:00:00Z"))).toBe("S01");
  });
  it("18 avril 2026 est en S16 (samedi de la semaine 16)", () => {
    expect(dateVersSemaine(new Date("2026-04-18T12:00:00Z"))).toBe("S16");
  });
  it("1er janvier d'une année peut être en S52 de l'année précédente", () => {
    // 1er janvier 2023 est un dimanche → S52 de 2022.
    expect(dateVersSemaine(new Date("2023-01-01T12:00:00Z"))).toBe("S52");
  });
});

describe("semaineVersDates", () => {
  it("S16 2026 commence le lundi 13 avril", () => {
    const { debut } = semaineVersDates("S16", 2026);
    expect(debut.toISOString().slice(0, 10)).toBe("2026-04-13");
  });
  it("semaine couvre lundi → dimanche (fin 6 jours + 23h59 après debut)", () => {
    const { debut, fin } = semaineVersDates("S01", 2026);
    const diffJours = Math.floor(
      (fin.getTime() - debut.getTime()) / 86_400_000,
    );
    expect(diffJours).toBe(6);
    expect(debut.getUTCDay()).toBe(1); // lundi
    expect(fin.getUTCDay()).toBe(0);   // dimanche
  });
  it("S01 2026 commence le 29 décembre 2025 (règle ISO)", () => {
    const { debut } = semaineVersDates("S01", 2026);
    expect(debut.toISOString().slice(0, 10)).toBe("2025-12-29");
  });
});

describe("semaineActuelle", () => {
  it("renvoie S16 pour le 18 avril 2026", () => {
    expect(semaineActuelle(new Date("2026-04-18T12:00:00Z"))).toBe("S16");
  });
  it("renvoie S01 pour le 4 janvier 2027", () => {
    expect(semaineActuelle(new Date("2027-01-04T12:00:00Z"))).toBe("S01");
  });
  it("sans argument, utilise la date courante (format valide)", () => {
    expect(semaineActuelle()).toMatch(/^S\d{2}$/);
  });
});

describe("joursAvantSemaine", () => {
  const ref = new Date("2026-04-18T12:00:00Z"); // samedi de S16

  it("valeur positive pour une semaine future", () => {
    // Lundi S18 = 27 avril 2026 → 9 jours.
    expect(joursAvantSemaine("S18", 2026, ref)).toBe(9);
  });
  it("valeur négative pour une semaine passée", () => {
    // Lundi S14 = 30 mars 2026 → -19 jours.
    expect(joursAvantSemaine("S14", 2026, ref)).toBe(-19);
  });
  it("valeur faible pour la semaine courante (négative car lundi déjà passé)", () => {
    expect(joursAvantSemaine("S16", 2026, ref)).toBe(-5);
  });
});
