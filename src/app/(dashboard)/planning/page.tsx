import Link from "next/link";
import { chantiersParSemaine } from "@/lib/queries/planning";
import { listerPoseurs } from "@/lib/queries/projets";
import {
  COULEURS_STATUT_GLOBAL,
  LIBELLES_STATUT_GLOBAL,
  type StatutGlobalProjet,
} from "@/lib/metier/statuts";
import {
  anneeActuelle,
  semaineActuelle,
  parserSemaine,
} from "@/lib/metier/semaines";
import { LIBELLES_TYPE_PROJET, TYPES_PROJET } from "@/lib/validations/projet";
import { cn } from "@/lib/utils";
import { FiltresPlanning } from "./_FiltresPlanning";

export const dynamic = "force-dynamic";

const NB_SEMAINES = 52;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function PlanningPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const annee = sp.annee ? Number(sp.annee) : anneeActuelle();
  const semaineNumActuelle = parserSemaine(semaineActuelle());
  const anneeActuellee = anneeActuelle();

  const [parSemaine, poseurs] = await Promise.all([
    chantiersParSemaine({
      annee,
      poseurId: sp.poseur,
      typeProjet: sp.type,
      statut: sp.statut as StatutGlobalProjet | undefined,
    }),
    listerPoseurs(),
  ]);

  const total = Object.values(parSemaine).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Planning {annee}</h1>
          <p className="text-xs text-slate-500">
            {total} chantier{total > 1 ? "s" : ""} sur 52 semaines · semaine
            courante S{String(semaineNumActuelle).padStart(2, "0")}
          </p>
        </div>
        <Legende />
      </header>

      <FiltresPlanning
        poseurs={poseurs.map((p) => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))}
        types={TYPES_PROJET.map((t) => ({ value: t, label: LIBELLES_TYPE_PROJET[t] }))}
        statuts={(Object.keys(LIBELLES_STATUT_GLOBAL) as StatutGlobalProjet[]).map((s) => ({
          value: s,
          label: LIBELLES_STATUT_GLOBAL[s],
        }))}
      />

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <div className="flex min-w-max">
          {Array.from({ length: NB_SEMAINES }, (_, i) => i + 1).map((num) => {
            const label = `S${String(num).padStart(2, "0")}`;
            const chantiers = parSemaine[num] ?? [];
            const estCourante = num === semaineNumActuelle && annee === anneeActuellee;
            return (
              <div
                key={num}
                className={cn(
                  "flex w-32 shrink-0 flex-col border-r border-slate-200",
                  estCourante && "bg-amber-50",
                )}
              >
                <div
                  className={cn(
                    "border-b border-slate-200 px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide",
                    estCourante ? "bg-amber-100 text-amber-900" : "bg-slate-50 text-slate-600",
                  )}
                >
                  {label}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-1">
                  {chantiers.length === 0 ? (
                    <div className="py-2 text-center text-[10px] text-slate-300">—</div>
                  ) : (
                    chantiers.map((c) => (
                      <Link
                        key={c.id}
                        href={`/projets/${c.id}`}
                        className="rounded px-1.5 py-1 text-[11px] text-white shadow-sm hover:opacity-90"
                        style={{ backgroundColor: COULEURS_STATUT_GLOBAL[c.statut] }}
                      >
                        <div className="truncate font-semibold">{c.reference}</div>
                        <div className="truncate opacity-90">{c.clientNom}</div>
                        {c.poseurs.length > 0 && (
                          <div className="truncate text-[10px] opacity-80">
                            {c.poseurs.join(" / ")}
                          </div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legende() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-slate-500">
      {(Object.keys(LIBELLES_STATUT_GLOBAL) as StatutGlobalProjet[]).map((s) => (
        <span key={s} className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: COULEURS_STATUT_GLOBAL[s] }}
          />
          {LIBELLES_STATUT_GLOBAL[s]}
        </span>
      ))}
    </div>
  );
}
