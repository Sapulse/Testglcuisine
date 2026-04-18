import { z } from "zod";
import { CATEGORIES_COMMANDE } from "./commande";

export const STATUTS_SAV = [
  "ouvert",
  "en_attente_fournisseur",
  "planifie",
  "resolu",
  "clos",
] as const;

export const LIBELLES_STATUT_SAV: Record<(typeof STATUTS_SAV)[number], string> = {
  ouvert: "Ouvert",
  en_attente_fournisseur: "Attente fournisseur",
  planifie: "Planifié",
  resolu: "Résolu",
  clos: "Clos",
};

export const TYPES_JOURNAL_SAV = [
  "creation",
  "changement_statut",
  "intervention",
  "note",
  "cloture",
] as const;

export const LIBELLES_TYPE_JOURNAL: Record<(typeof TYPES_JOURNAL_SAV)[number], string> = {
  creation: "Création",
  changement_statut: "Changement de statut",
  intervention: "Intervention",
  note: "Note",
  cloture: "Clôture",
};

export const savSchema = z.object({
  projetId: z.string().min(1, "Projet requis"),
  fournisseurId: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  categorie: z
    .enum(CATEGORIES_COMMANDE)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  typeProbleme: z.string().trim().min(1, "Type de problème requis"),
  statut: z.enum(STATUTS_SAV).default("ouvert"),
  bloquant: z.coerce.boolean().default(false),
  commentaire: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  dateIntervention: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  dateCloture: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type SavInput = z.infer<typeof savSchema>;

export const savUpdateSchema = savSchema.partial().extend({
  id: z.string().min(1),
});

export type SavUpdateInput = z.infer<typeof savUpdateSchema>;

export const journalAjoutSchema = z.object({
  savId: z.string().min(1),
  type: z.enum(TYPES_JOURNAL_SAV).default("note"),
  auteur: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  commentaire: z.string().trim().min(1, "Commentaire requis"),
});

export type JournalAjoutInput = z.infer<typeof journalAjoutSchema>;
