import { z } from "zod";

const SEMAINE_REGEX = /^S(0[1-9]|[1-4][0-9]|5[0-3])$/;

export const TYPES_PROJET = [
  "cuisine",
  "dressing",
  "salle_de_bain",
  "meuble_tv",
  "bibliotheque",
  "agencement_divers",
] as const;

export const LIBELLES_TYPE_PROJET: Record<(typeof TYPES_PROJET)[number], string> = {
  cuisine: "Cuisine",
  dressing: "Dressing",
  salle_de_bain: "Salle de bain",
  meuble_tv: "Meuble TV",
  bibliotheque: "Bibliothèque",
  agencement_divers: "Agencement divers",
};

/** Client existant OU nouveau (dans le même formulaire projet). */
export const clientInlineSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("existant"),
    clientId: z.string().min(1, "Sélectionne un client"),
  }),
  z.object({
    mode: z.literal("nouveau"),
    nom: z.string().trim().min(1, "Nom requis"),
    prenom: z.string().trim().min(1, "Prénom requis"),
    telephone: z.string().trim().min(6, "Téléphone requis"),
    email: z.string().trim().email("Email invalide").or(z.literal("")).optional(),
    adresse: z.string().trim().min(1, "Adresse requise"),
    codePostal: z.string().trim().regex(/^\d{5}$/, "Code postal sur 5 chiffres"),
    ville: z.string().trim().min(1, "Ville requise"),
  }),
]);

export const projetSchema = z.object({
  reference: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{3}$/, "Format attendu : AAAA-NNN (ex. 2026-042)"),
  typeProjet: z.enum(TYPES_PROJET),
  adresseChantier: z.string().trim().min(1, "Adresse requise"),
  codePostalChantier: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal sur 5 chiffres"),
  villeChantier: z.string().trim().min(1, "Ville requise"),
  montantHT: z.coerce
    .number()
    .nonnegative("Montant positif")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  montantTTC: z.coerce
    .number()
    .nonnegative("Montant positif")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  semainePose: z
    .string()
    .trim()
    .regex(SEMAINE_REGEX, "Format attendu : S01 à S53"),
  anneePose: z.coerce
    .number()
    .int()
    .min(2024, "Année >= 2024")
    .max(2099, "Année <= 2099"),
  estRenovation: z.coerce.boolean().default(false),
  vendeurId: z.string().optional().or(z.literal("").transform(() => undefined)),
  dateSignature: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  client: clientInlineSchema,
});

export type ProjetInput = z.infer<typeof projetSchema>;

/** Édition : mêmes champs que création, sans le bloc client (changer de client = rare). */
export const projetEditSchema = projetSchema.omit({ client: true });

export type ProjetEditInput = z.infer<typeof projetEditSchema>;

/** Mise à jour d'une étape (édition inline du workflow). */
export const etapeUpdateSchema = z.object({
  etapeId: z.string().min(1),
  statut: z.enum(["non_commence", "en_cours", "termine", "bloque"]),
  commentaire: z.string().optional(),
});

export type EtapeUpdateInput = z.infer<typeof etapeUpdateSchema>;
