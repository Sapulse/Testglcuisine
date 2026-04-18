import { chargerStats } from "@/lib/queries/analytics";
import { COULEURS_STATUT_GLOBAL } from "@/lib/metier/statuts";
import { LIBELLES_CATEGORIE } from "@/lib/validations/commande";
import { cn } from "@/lib/utils";
export const dynamic = "force-dynamic";


export default async function AnalyticsPage() {
  const stats = await chargerStats();
  const maxStatut = Math.max(...stats.repartitionStatuts.map((s) => s.nb), 1);

  return (
    <div className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-xs text-slate-500">
          Vue agrégée · {stats.nbProjets} chantier(s) au total
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Kpi titre="Projets" valeur={stats.nbProjets.toString()} />
        <Kpi
          titre="CA total HT"
          valeur={`${stats.caTotalHT.toLocaleString("fr-FR")} €`}
        />
        <Kpi
          titre="CA total TTC"
          valeur={`${stats.caTotalTTC.toLocaleString("fr-FR")} €`}
        />
      </div>

      {/* Répartition statuts — barres horizontales */}
      <section className="rounded-md border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Répartition par statut global
          </h2>
        </header>
        <div className="p-3">
          <div className="flex flex-col gap-2">
            {stats.repartitionStatuts.map((r) => (
              <div key={r.statut} className="flex items-center gap-2 text-sm">
                <span className="w-24 shrink-0 text-slate-700">{r.label}</span>
                <div className="relative h-5 flex-1 overflow-hidden rounded bg-slate-100">
                  <div
                    className="absolute left-0 top-0 h-full"
                    style={{
                      width: `${(r.nb / maxStatut) * 100}%`,
                      backgroundColor: COULEURS_STATUT_GLOBAL[r.statut],
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-xs text-slate-700">
                  {r.nb}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Vendeurs */}
        <section className="rounded-md border border-slate-200 bg-white">
          <header className="border-b border-slate-200 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Vendeurs — CA TTC
            </h2>
          </header>
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-1">Vendeur</th>
                <th className="px-3 py-1 text-right">Projets</th>
                <th className="px-3 py-1 text-right">CA TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.vendeurs.map((v) => (
                <tr key={v.vendeurId}>
                  <td className="px-3 py-1.5">{v.nom}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs">
                    {v.nbProjets}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs font-semibold">
                    {v.caTTC.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
              {stats.vendeurs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-xs text-slate-500">
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Fournisseurs */}
        <section className="rounded-md border border-slate-200 bg-white">
          <header className="border-b border-slate-200 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Fournisseurs — taux de retard
            </h2>
          </header>
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-1">Fournisseur</th>
                <th className="px-3 py-1 text-right">Cmd.</th>
                <th className="px-3 py-1 text-right">Retard</th>
                <th className="px-3 py-1 text-right">Relq.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.fournisseurs.map((f) => (
                <tr key={f.fournisseurId}>
                  <td className="px-3 py-1.5">{f.nom}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs">
                    {f.nbCommandes}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-1.5 text-right font-mono text-xs font-semibold",
                      f.txRetard > 0.2 ? "text-red-700" : "text-slate-500",
                    )}
                  >
                    {Math.round(f.txRetard * 100)}%
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs text-orange-700">
                    {f.nbReliquats || "—"}
                  </td>
                </tr>
              ))}
              {stats.fournisseurs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-xs text-slate-500">
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* Catégories */}
      <section className="rounded-md border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Catégories de commandes
          </h2>
        </header>
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-1">Catégorie</th>
              <th className="px-3 py-1 text-right">Commandes</th>
              <th className="px-3 py-1 text-right">Retards</th>
              <th className="px-3 py-1 text-right">Reliquats</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.categories.map((c) => (
              <tr key={c.categorie}>
                <td className="px-3 py-1.5">
                  {LIBELLES_CATEGORIE[c.categorie as keyof typeof LIBELLES_CATEGORIE] ?? c.categorie}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs">
                  {c.nbCommandes}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs text-red-700">
                  {c.nbRetards || "—"}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs text-orange-700">
                  {c.nbReliquats || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Kpi({ titre, valeur }: { titre: string; valeur: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {titre}
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{valeur}</div>
    </div>
  );
}
