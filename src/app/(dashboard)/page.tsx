import { BadgeStatut } from "@/components/metier/BadgeStatut";
import { BlocDashboard, LigneBloc } from "@/components/metier/BlocDashboard";
import { semaineActuelle } from "@/lib/metier/semaines";
import {
  MOCK_ALERTES,
  MOCK_A_RISQUE,
  MOCK_CETTE_SEMAINE,
  MOCK_COMMANDES_NON_ENVOYEES,
  MOCK_LIVRAISONS_CRITIQUES,
  MOCK_SAV_OUVERTS,
} from "./_mocks";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const semaine = semaineActuelle();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Dashboard dirigeant
          </h1>
          <p className="text-xs text-slate-500">
            Vue synthèse · semaine courante {semaine} · avril 2026
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-400">
          Données de démonstration
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* 1. Alertes prioritaires */}
        <BlocDashboard
          titre="Alertes prioritaires"
          compteur={MOCK_ALERTES.length}
          accent="rouge"
        >
          {MOCK_ALERTES.map((a, i) => (
            <LigneBloc key={`${a.id}-${i}`}>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-block h-2 w-2 shrink-0 rounded-full",
                    a.niveau === "rouge" && "bg-red-600",
                    a.niveau === "orange" && "bg-orange-500",
                    a.niveau === "jaune" && "bg-yellow-500",
                  )}
                />
                <span className="truncate">
                  <span className="font-semibold text-slate-900">{a.reference}</span>
                  <span className="text-slate-500"> · {a.client}</span>
                  <span className="text-slate-600"> — {a.message}</span>
                </span>
              </div>
              <span className="ml-3 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                {a.id}
              </span>
            </LigneBloc>
          ))}
        </BlocDashboard>

        {/* 2. Chantiers cette semaine */}
        <BlocDashboard
          titre="Chantiers cette semaine"
          compteur={MOCK_CETTE_SEMAINE.length}
          accent="bleu"
        >
          {MOCK_CETTE_SEMAINE.map((c) => (
            <LigneBloc key={c.reference} href={`/projets/${c.reference}`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-slate-900">{c.reference}</span>
                <span className="text-slate-500">·</span>
                <span className="truncate">{c.client}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{c.ville}</span>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                <span className="text-xs text-slate-600">{c.poseur}</span>
                <BadgeStatut statut={c.statut} />
              </div>
            </LigneBloc>
          ))}
        </BlocDashboard>

        {/* 3. Chantiers à risque */}
        <BlocDashboard
          titre="Chantiers à risque"
          compteur={MOCK_A_RISQUE.length}
          accent="orange"
        >
          {MOCK_A_RISQUE.map((c) => (
            <LigneBloc key={c.reference} href={`/projets/${c.reference}`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-slate-900">{c.reference}</span>
                <span className="text-slate-500">·</span>
                <span className="truncate">{c.client}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">pose {c.semainePose}</span>
              </div>
              <div className="ml-3 shrink-0">
                <BadgeStatut statut={c.statut} />
              </div>
            </LigneBloc>
          ))}
        </BlocDashboard>

        {/* 4. Commandes non envoyées */}
        <BlocDashboard
          titre="Commandes non envoyées"
          compteur={MOCK_COMMANDES_NON_ENVOYEES.length}
          accent="rouge"
        >
          {MOCK_COMMANDES_NON_ENVOYEES.map((c, i) => (
            <LigneBloc key={`${c.reference}-${i}`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-slate-900">{c.reference}</span>
                <span className="text-slate-500">·</span>
                <span className="truncate">{c.client}</span>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2 text-xs text-slate-600">
                <span>{c.fournisseur}</span>
                <span className="text-slate-400">·</span>
                <span>{c.categorie}</span>
                <span className="text-slate-400">·</span>
                <span>{c.semaine}</span>
              </div>
            </LigneBloc>
          ))}
        </BlocDashboard>

        {/* 5. Livraisons critiques */}
        <BlocDashboard
          titre="Livraisons critiques"
          compteur={MOCK_LIVRAISONS_CRITIQUES.length}
          accent="rouge"
        >
          {MOCK_LIVRAISONS_CRITIQUES.map((l, i) => (
            <LigneBloc key={`${l.reference}-${i}`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-slate-900">{l.reference}</span>
                <span className="text-slate-500">·</span>
                <span className="truncate">{l.client}</span>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2 text-xs">
                <span className="text-slate-600">
                  {l.fournisseur} · {l.categorie}
                </span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide text-white",
                    l.etat === "retard" ? "bg-red-600" : "bg-blue-600",
                  )}
                >
                  {l.etat === "retard" ? "retard" : l.semaine}
                </span>
              </div>
            </LigneBloc>
          ))}
        </BlocDashboard>

        {/* 6. SAV ouverts */}
        <BlocDashboard
          titre="SAV ouverts"
          compteur={MOCK_SAV_OUVERTS.length}
          accent="orange"
        >
          {MOCK_SAV_OUVERTS.map((s) => (
            <LigneBloc key={s.reference} href={`/sav`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-slate-900">{s.reference}</span>
                <span className="text-slate-500">·</span>
                <span className="truncate">{s.client}</span>
                <span className="text-slate-400">·</span>
                <span className="truncate text-slate-600">{s.probleme}</span>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2 text-xs">
                {s.bloquant && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
                    bloquant
                  </span>
                )}
                <span className="text-slate-500">{s.ageJours}j</span>
              </div>
            </LigneBloc>
          ))}
        </BlocDashboard>
      </div>
    </div>
  );
}
