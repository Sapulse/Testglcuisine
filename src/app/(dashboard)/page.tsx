import { BadgeStatut } from "@/components/metier/BadgeStatut";
import { BlocDashboard, LigneBloc } from "@/components/metier/BlocDashboard";
import { chargerDashboard } from "@/lib/queries/dashboard";
import { LIBELLES_CATEGORIE } from "@/lib/validations/commande";
import { cn } from "@/lib/utils";


export default async function DashboardPage() {
  const data = await chargerDashboard();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Dashboard dirigeant
          </h1>
          <p className="text-xs text-slate-500">
            Vue synthèse · semaine courante {data.semaine}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* 1. Alertes prioritaires */}
        <BlocDashboard
          titre="Alertes prioritaires"
          compteur={data.alertes.length}
          accent="rouge"
        >
          {data.alertes.length === 0 ? (
            <LigneBloc>
              <span className="text-xs text-slate-500">Aucune alerte active.</span>
            </LigneBloc>
          ) : (
            data.alertes.map((a, i) => (
              <LigneBloc key={`${a.id}-${a.projetId}-${i}`} href={`/projets/${a.projetId}`}>
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
            ))
          )}
        </BlocDashboard>

        {/* 2. Chantiers cette semaine */}
        <BlocDashboard
          titre="Chantiers cette semaine"
          compteur={data.cetteSemaine.length}
          accent="bleu"
        >
          {data.cetteSemaine.length === 0 ? (
            <LigneBloc>
              <span className="text-xs text-slate-500">Pas de pose cette semaine.</span>
            </LigneBloc>
          ) : (
            data.cetteSemaine.map((c) => (
              <LigneBloc key={c.id} href={`/projets/${c.id}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-semibold text-slate-900">{c.reference}</span>
                  <span className="text-slate-500">·</span>
                  <span className="truncate">{c.client}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{c.ville}</span>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-600">{c.poseurs}</span>
                  <BadgeStatut statut={c.statut} />
                </div>
              </LigneBloc>
            ))
          )}
        </BlocDashboard>

        {/* 3. Chantiers à risque */}
        <BlocDashboard
          titre="Chantiers à risque"
          compteur={data.aRisque.length}
          accent="orange"
        >
          {data.aRisque.length === 0 ? (
            <LigneBloc>
              <span className="text-xs text-slate-500">Tous les chantiers sont sous contrôle.</span>
            </LigneBloc>
          ) : (
            data.aRisque.map((c) => (
              <LigneBloc key={c.id} href={`/projets/${c.id}`}>
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
            ))
          )}
        </BlocDashboard>

        {/* 4. Commandes non envoyées */}
        <BlocDashboard
          titre="Commandes non envoyées"
          compteur={data.commandesNonEnvoyees.length}
          accent="rouge"
        >
          {data.commandesNonEnvoyees.length === 0 ? (
            <LigneBloc>
              <span className="text-xs text-slate-500">Toutes les commandes sont envoyées.</span>
            </LigneBloc>
          ) : (
            data.commandesNonEnvoyees.map((c) => (
              <LigneBloc key={c.id} href={`/projets/${c.projetId}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-semibold text-slate-900">{c.reference}</span>
                  <span className="text-slate-500">·</span>
                  <span className="truncate">{c.client}</span>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-xs text-slate-600">
                  <span>{c.fournisseur}</span>
                  <span className="text-slate-400">·</span>
                  <span>
                    {LIBELLES_CATEGORIE[c.categorie as keyof typeof LIBELLES_CATEGORIE] ?? c.categorie}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span>{c.semaine ?? "?"}</span>
                </div>
              </LigneBloc>
            ))
          )}
        </BlocDashboard>

        {/* 5. Livraisons critiques */}
        <BlocDashboard
          titre="Livraisons critiques"
          compteur={data.livraisonsCritiques.length}
          accent="rouge"
        >
          {data.livraisonsCritiques.length === 0 ? (
            <LigneBloc>
              <span className="text-xs text-slate-500">Aucune livraison critique.</span>
            </LigneBloc>
          ) : (
            data.livraisonsCritiques.map((l) => (
              <LigneBloc key={l.id} href={`/projets/${l.projetId}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-semibold text-slate-900">{l.reference}</span>
                  <span className="text-slate-500">·</span>
                  <span className="truncate">{l.client}</span>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-xs">
                  <span className="text-slate-600">
                    {l.fournisseur} ·{" "}
                    {LIBELLES_CATEGORIE[l.categorie as keyof typeof LIBELLES_CATEGORIE] ?? l.categorie}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide text-white",
                      l.etat === "retard" ? "bg-red-600" : "bg-blue-600",
                    )}
                  >
                    {l.etat === "retard" ? "retard" : (l.semaine ?? "S?")}
                  </span>
                </div>
              </LigneBloc>
            ))
          )}
        </BlocDashboard>

        {/* 6. SAV ouverts */}
        <BlocDashboard
          titre="SAV ouverts"
          compteur={data.savOuverts.length}
          accent="orange"
        >
          {data.savOuverts.length === 0 ? (
            <LigneBloc>
              <span className="text-xs text-slate-500">Aucun ticket SAV ouvert.</span>
            </LigneBloc>
          ) : (
            data.savOuverts.map((s) => (
              <LigneBloc key={s.id} href={`/sav/${s.id}`}>
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
                  <span
                    className={cn(
                      "text-slate-500",
                      s.ageJours > 15 && "font-semibold text-orange-700",
                      s.ageJours > 30 && "font-bold text-red-700",
                    )}
                  >
                    {s.ageJours}j
                  </span>
                </div>
              </LigneBloc>
            ))
          )}
        </BlocDashboard>
      </div>
    </div>
  );
}
