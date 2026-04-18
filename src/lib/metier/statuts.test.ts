import { describe, it, expect } from "vitest";
import { calculerStatutGlobal, type ProjetInput } from "./statuts";

const MAINTENANT = new Date("2026-04-18T12:00:00Z");

/** Helper — génère les 9 étapes avec un statut par défaut. */
function etapes(
  overrides: Record<number, "non_commence" | "en_cours" | "termine" | "bloque"> = {},
) {
  return Array.from({ length: 9 }, (_, i) => ({
    numero: i + 1,
    statut: overrides[i + 1] ?? ("non_commence" as const),
  }));
}

function projet(partial: Partial<ProjetInput>): ProjetInput {
  return {
    semainePose: "S30",
    anneePose: 2026,
    etapes: etapes(),
    commandes: [],
    ...partial,
  };
}

describe("calculerStatutGlobal", () => {
  // ─── Terminé ───
  it("retourne termine quand toutes les étapes sont terminées", () => {
    const p = projet({
      etapes: etapes({ 1: "termine", 2: "termine", 3: "termine", 4: "termine", 5: "termine", 6: "termine", 7: "termine", 8: "termine", 9: "termine" }),
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("termine");
  });

  // ─── À facturer ───
  it("retourne a_facturer quand pose terminée et facturation non faite", () => {
    const p = projet({
      etapes: etapes({ 8: "termine", 9: "non_commence" }),
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("a_facturer");
  });

  // ─── Bloqué ───
  it("retourne bloque dès qu'une étape est bloquée", () => {
    const p = projet({ etapes: etapes({ 3: "bloque" }) });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("bloque");
  });

  // ─── À risque ───
  it("retourne a_risque si pose < 14j et commande essentielle non envoyée", () => {
    const p = projet({
      semainePose: "S18",
      anneePose: 2026,
      commandes: [
        {
          categorie: "meubles",
          statutCommande: "non_envoye",
          statutLivraison: "en_attente",
          essentielle: true,
        },
      ],
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("a_risque");
  });

  // ─── Vigilance ───
  it("retourne vigilance si pose < 30j et catégorie essentielle en reliquat", () => {
    const p = projet({
      semainePose: "S20",
      anneePose: 2026,
      commandes: [
        {
          categorie: "meubles",
          statutCommande: "reliquat",
          statutLivraison: "partiel",
          essentielle: true,
        },
      ],
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("vigilance");
  });

  // ─── Prêt ───
  it("retourne pret quand toutes les essentielles sont livrées et pose pas faite", () => {
    const p = projet({
      commandes: [
        {
          categorie: "meubles",
          statutCommande: "livre",
          statutLivraison: "livre",
          essentielle: true,
        },
        {
          categorie: "electromenagers",
          statutCommande: "livre",
          statutLivraison: "livre",
          essentielle: true,
        },
      ],
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("pret");
  });

  // ─── En cours ───
  it("retourne en_cours par défaut", () => {
    const p = projet({
      etapes: etapes({ 1: "termine", 2: "en_cours" }),
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("en_cours");
  });

  // ─── Priorité bloqué > à risque ───
  it("bloque prime sur a_risque", () => {
    const p = projet({
      semainePose: "S18",
      etapes: etapes({ 3: "bloque" }),
      commandes: [
        {
          categorie: "meubles",
          statutCommande: "non_envoye",
          statutLivraison: "en_attente",
          essentielle: true,
        },
      ],
    });
    expect(calculerStatutGlobal(p, MAINTENANT)).toBe("bloque");
  });
});
