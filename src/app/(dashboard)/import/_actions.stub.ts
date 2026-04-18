import type { TypeProjet } from "@prisma/client";

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

export async function importerProjetsEnMasse(
  _lignes: LigneImport[],
): Promise<ResultatImport> {
  return { ok: false, message: "Mode démo en lecture seule — import désactivé." };
}
