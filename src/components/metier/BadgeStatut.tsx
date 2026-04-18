import {
  COULEURS_STATUT_GLOBAL,
  LIBELLES_STATUT_GLOBAL,
  type StatutGlobalProjet,
} from "@/lib/metier/statuts";

/** Pastille colorée du statut global chantier. */
export function BadgeStatut({ statut }: { statut: StatutGlobalProjet }) {
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: COULEURS_STATUT_GLOBAL[statut] }}
    >
      {LIBELLES_STATUT_GLOBAL[statut]}
    </span>
  );
}
