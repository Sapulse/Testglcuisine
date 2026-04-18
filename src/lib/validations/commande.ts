import { z } from "zod";

const SEMAINE_REGEX = /^S(0[1-9]|[1-4][0-9]|5[0-3])$/;

export const CATEGORIES_COMMANDE = [
  "electromenagers",
  "meubles",
  "accessoires",
  "plan_travail",
  "credence",
  "fond_hotte",
  "sanitaires",
] as const;

export const LIBELLES_CATEGORIE: Record<(typeof CATEGORIES_COMMANDE)[number], string> = {
  electromenagers: "Électroménagers",
  meubles: "Meubles",
  accessoires: "Accessoires",
  plan_travail: "Plan de travail",
  credence: "Crédence",
  fond_hotte: "Fond de hotte",
  sanitaires: "Sanitaires",
};

export const STATUTS_COMMANDE = [
  "non_envoye",
  "envoye",
  "confirme",
  "expedie",
  "livre",
  "reliquat",
] as const;

export const LIBELLES_STATUT_COMMANDE: Record<(typeof STATUTS_COMMANDE)[number], string> = {
  non_envoye: "Non envoyée",
  envoye: "Envoyée",
  confirme: "Confirmée",
  expedie: "Expédiée",
  livre: "Livrée",
  reliquat: "Reliquat",
};

export const STATUTS_LIVRAISON = [
  "en_attente",
  "livre",
  "partiel",
  "retard",
] as const;

export const LIBELLES_STATUT_LIVRAISON: Record<(typeof STATUTS_LIVRAISON)[number], string> = {
  en_attente: "En attente",
  livre: "Livrée",
  partiel: "Partielle",
  retard: "Retard",
};

export const commandeSchema = z.object({
  projetId: z.string().min(1),
  fournisseurId: z.string().min(1, "Fournisseur requis"),
  categorie: z.enum(CATEGORIES_COMMANDE),
  statutCommande: z.enum(STATUTS_COMMANDE).default("non_envoye"),
  semaineLivraisonPrevue: z
    .string()
    .trim()
    .regex(SEMAINE_REGEX, "Format attendu : S01 à S53")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  statutLivraison: z.enum(STATUTS_LIVRAISON).default("en_attente"),
  essentielle: z.coerce.boolean().default(true),
  remarque: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export type CommandeInput = z.infer<typeof commandeSchema>;

export const commandeUpdateSchema = commandeSchema.omit({ projetId: true }).extend({
  id: z.string().min(1),
});

export type CommandeUpdateInput = z.infer<typeof commandeUpdateSchema>;
