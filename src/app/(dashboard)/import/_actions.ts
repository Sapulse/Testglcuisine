"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TypeProjet } from "@prisma/client";

const SEMAINE_REGEX = /^S(0[1-9]|[1-4][0-9]|5[0-3])$/;

export interface LigneImport {
  reference: string;
  clientNom: string;
  clientPrenom: string;
  clientTelephone?: string;
  clientEmail?: string;
  clientAdresse: string;
  clientCP: string;
  clientVille: string;
  typeProjet: TypeProjet;
  adresseChantier: string;
  cpChantier: string;
  villeChantier: string;
  semainePose: string;
  anneePose: number;
  estRenovation: boolean;
  montantHT?: number;
  montantTTC?: number;
}

export type ResultatImport =
  | { ok: true; crees: number; ignores: Array<{ reference: string; raison: string }> }
  | { ok: false; message: string };

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

/** Valide la ligne sans toucher à la base. Renvoie null si OK, message sinon. */
function valider(l: LigneImport): string | null {
  if (!l.reference) return "Référence manquante";
  if (!l.clientNom || !l.clientPrenom) return "Nom/prénom client manquant";
  if (!l.villeChantier) return "Ville chantier manquante";
  if (!SEMAINE_REGEX.test(l.semainePose)) return "Semaine pose invalide (S01–S53)";
  if (!l.anneePose || l.anneePose < 2024 || l.anneePose > 2099)
    return "Année pose invalide";
  return null;
}

/**
 * Importe N lignes depuis un upload Excel déjà parsé côté client.
 * Crée/récupère le client (par nom+prenom+CP+ville), crée le projet + 9 étapes.
 * Ignore les projets dont la référence existe déjà.
 */
export async function importerProjetsEnMasse(
  lignes: LigneImport[],
): Promise<ResultatImport> {
  if (!Array.isArray(lignes) || lignes.length === 0) {
    return { ok: false, message: "Aucune ligne à importer" };
  }

  const ignores: Array<{ reference: string; raison: string }> = [];
  let crees = 0;

  try {
    for (const l of lignes) {
      const err = valider(l);
      if (err) {
        ignores.push({ reference: l.reference || "—", raison: err });
        continue;
      }

      const existant = await prisma.projet.findUnique({ where: { reference: l.reference } });
      if (existant) {
        ignores.push({ reference: l.reference, raison: "Référence déjà existante" });
        continue;
      }

      // Trouve ou crée le client (match sur nom+prenom+CP+ville).
      let client = await prisma.client.findFirst({
        where: {
          nom: l.clientNom,
          prenom: l.clientPrenom,
          codePostal: l.clientCP,
          ville: l.clientVille,
        },
      });
      if (!client) {
        client = await prisma.client.create({
          data: {
            nom: l.clientNom,
            prenom: l.clientPrenom,
            telephone: l.clientTelephone || "—",
            email: l.clientEmail || null,
            adresse: l.clientAdresse || "—",
            codePostal: l.clientCP,
            ville: l.clientVille,
          },
        });
      }

      await prisma.projet.create({
        data: {
          reference: l.reference,
          clientId: client.id,
          typeProjet: l.typeProjet,
          adresseChantier: l.adresseChantier || "—",
          codePostalChantier: l.cpChantier || l.clientCP,
          villeChantier: l.villeChantier,
          montantHT: l.montantHT ?? null,
          montantTTC: l.montantTTC ?? null,
          semainePose: l.semainePose,
          anneePose: l.anneePose,
          estRenovation: l.estRenovation,
          etapes: {
            create: NOMS_ETAPES.map((nom, i) => ({
              numero: i + 1,
              nom,
              statut: "non_commence" as const,
            })),
          },
        },
      });
      crees++;
    }

    revalidatePath("/projets");
    revalidatePath("/");
    return { ok: true, crees, ignores };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
