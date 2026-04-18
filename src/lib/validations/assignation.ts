import { z } from "zod";

const SEMAINE_REGEX = /^S(0[1-9]|[1-4][0-9]|5[0-3])$/;

export const assignationSchema = z.object({
  projetId: z.string().min(1),
  poseurId: z.string().min(1, "Poseur requis"),
  semaine: z.string().trim().regex(SEMAINE_REGEX, "Format S01–S53"),
  annee: z.coerce.number().int().min(2024).max(2099),
  role: z.enum(["principal", "secondaire"]).default("principal"),
});

export type AssignationInput = z.infer<typeof assignationSchema>;
