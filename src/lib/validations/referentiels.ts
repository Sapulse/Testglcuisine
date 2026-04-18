import { z } from "zod";
import { CATEGORIES_COMMANDE } from "./commande";

const emailOpt = z
  .string()
  .trim()
  .email("Email invalide")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const fournisseurSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis"),
  contact: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  telephone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: emailOpt,
  categories: z.array(z.enum(CATEGORIES_COMMANDE)).default([]),
});

export type FournisseurInput = z.infer<typeof fournisseurSchema>;

export const poseurSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis"),
  prenom: z.string().trim().min(1, "Prénom requis"),
  telephone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  interne: z.coerce.boolean().default(true),
});

export type PoseurInput = z.infer<typeof poseurSchema>;

export const vendeurSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis"),
  prenom: z.string().trim().min(1, "Prénom requis"),
  telephone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: emailOpt,
});

export type VendeurInput = z.infer<typeof vendeurSchema>;
