import "server-only";
import { prisma } from "@/lib/prisma";
import * as S from "@/lib/data/snapshot";

export interface ItemRecherche {
  id: string;
  type: "projet" | "sav" | "client" | "commande" | "navigation";
  label: string;
  description?: string;
  href: string;
}

const NAVIGATION: ItemRecherche[] = [
  { id: "nav-home", type: "navigation", label: "Dashboard", href: "/" },
  { id: "nav-projets", type: "navigation", label: "Projets", href: "/projets" },
  { id: "nav-planning", type: "navigation", label: "Planning", href: "/planning" },
  { id: "nav-commandes", type: "navigation", label: "Commandes", href: "/commandes" },
  { id: "nav-sav", type: "navigation", label: "SAV", href: "/sav" },
  { id: "nav-ref", type: "navigation", label: "Référentiels", href: "/referentiels" },
  { id: "nav-analytics", type: "navigation", label: "Analytics", href: "/analytics" },
];

/** Construit l'index de recherche global (fait au chargement du layout). */
export async function chargerIndexRecherche(): Promise<ItemRecherche[]> {
  if (S.estModeStatique()) {
    return [
      ...NAVIGATION,
      ...S.PROJETS.map((p) => {
        const c = S.CLIENTS.find((x) => x.id === p.clientId)!;
        return {
          id: `p-${p.id}`,
          type: "projet" as const,
          label: p.reference,
          description: `${c.prenom} ${c.nom} — ${p.villeChantier}`,
          href: `/projets/${p.id}`,
        };
      }),
      ...S.CLIENTS.map((c) => ({
        id: `c-${c.id}`,
        type: "client" as const,
        label: `${c.prenom} ${c.nom}`,
        description: `${c.ville}`,
        href: `/projets?q=${encodeURIComponent(c.nom)}`,
      })),
      ...S.SAVS.map((s) => {
        const p = S.PROJETS.find((x) => x.id === s.projetId)!;
        return {
          id: `s-${s.id}`,
          type: "sav" as const,
          label: s.typeProbleme,
          description: p.reference,
          href: `/sav/${s.id}`,
        };
      }),
    ];
  }

  const [projets, clients, savs] = await Promise.all([
    prisma.projet.findMany({ include: { client: true } }),
    prisma.client.findMany(),
    prisma.sAV.findMany({ include: { projet: true } }),
  ]);

  return [
    ...NAVIGATION,
    ...projets.map((p) => ({
      id: `p-${p.id}`,
      type: "projet" as const,
      label: p.reference,
      description: `${p.client.prenom} ${p.client.nom} — ${p.villeChantier}`,
      href: `/projets/${p.id}`,
    })),
    ...clients.map((c) => ({
      id: `c-${c.id}`,
      type: "client" as const,
      label: `${c.prenom} ${c.nom}`,
      description: c.ville,
      href: `/projets?q=${encodeURIComponent(c.nom)}`,
    })),
    ...savs.map((s) => ({
      id: `s-${s.id}`,
      type: "sav" as const,
      label: s.typeProbleme,
      description: s.projet.reference,
      href: `/sav/${s.id}`,
    })),
  ];
}
