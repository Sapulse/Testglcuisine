"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CATEGORIES_COMMANDE,
  LIBELLES_CATEGORIE,
  LIBELLES_STATUT_COMMANDE,
  LIBELLES_STATUT_LIVRAISON,
  STATUTS_COMMANDE,
  STATUTS_LIVRAISON,
} from "@/lib/validations/commande";
import { FiltresCommandes } from "./_FiltresCommandes";

interface Ligne {
  id: string;
  projetId: string;
  reference: string;
  clientPrenom: string;
  clientNom: string;
  categorie: keyof typeof LIBELLES_CATEGORIE;
  fournisseurId: string;
  fournisseurNom: string;
  statutCommande: keyof typeof LIBELLES_STATUT_COMMANDE;
  statutLivraison: keyof typeof LIBELLES_STATUT_LIVRAISON;
  semaineLivraisonPrevue: string | null;
  essentielle: boolean;
  remarque: string | null;
}

export function CommandesListeClient({
  commandes,
  fournisseurs,
}: {
  commandes: Ligne[];
  fournisseurs: { value: string; label: string }[];
}) {
  const params = useSearchParams();

  const filtered = useMemo(() => {
    return commandes.filter((c) => {
      if (params.get("fournisseur") && c.fournisseurId !== params.get("fournisseur")) return false;
      if (params.get("categorie") && c.categorie !== params.get("categorie")) return false;
      if (params.get("statutCmd") && c.statutCommande !== params.get("statutCmd")) return false;
      if (params.get("statutLiv") && c.statutLivraison !== params.get("statutLiv")) return false;
      if (params.get("semaine") && c.semaineLivraisonPrevue !== params.get("semaine")) return false;
      const q = (params.get("q") ?? "").toLowerCase();
      if (q) {
        const hay = `${c.reference} ${c.clientPrenom} ${c.clientNom} ${c.fournisseurNom}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [commandes, params]);

  const semainesUniques = useMemo(
    () => Array.from(new Set(commandes.map((c) => c.semaineLivraisonPrevue).filter(Boolean))).sort() as string[],
    [commandes],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Commandes</h1>
        <p className="text-xs text-slate-500">
          {filtered.length} / {commandes.length} commande(s) · vue transverse
        </p>
      </header>

      <FiltresCommandes
        fournisseurs={fournisseurs}
        categories={CATEGORIES_COMMANDE.map((c) => ({ value: c, label: LIBELLES_CATEGORIE[c] }))}
        statutsCommande={STATUTS_COMMANDE.map((s) => ({ value: s, label: LIBELLES_STATUT_COMMANDE[s] }))}
        statutsLivraison={STATUTS_LIVRAISON.map((s) => ({ value: s, label: LIBELLES_STATUT_LIVRAISON[s] }))}
        semaines={semainesUniques.map((s) => ({ value: s, label: s }))}
      />

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Projet</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Fournisseur</th>
              <th className="px-3 py-2">Statut cmd.</th>
              <th className="px-3 py-2">Livraison</th>
              <th className="px-3 py-2">Semaine</th>
              <th className="px-3 py-2">Ess.</th>
              <th className="px-3 py-2">Remarque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/projets/${c.projetId}`} className="font-semibold hover:underline">
                    {c.reference}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {c.clientPrenom} {c.clientNom}
                </td>
                <td className="px-3 py-2 text-slate-700">{LIBELLES_CATEGORIE[c.categorie]}</td>
                <td className="px-3 py-2 text-slate-700">{c.fournisseurNom}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                      c.statutCommande === "non_envoye" && "bg-red-100 text-red-800",
                      c.statutCommande === "envoye" && "bg-blue-100 text-blue-800",
                      c.statutCommande === "confirme" && "bg-blue-100 text-blue-800",
                      c.statutCommande === "expedie" && "bg-indigo-100 text-indigo-800",
                      c.statutCommande === "livre" && "bg-green-100 text-green-800",
                      c.statutCommande === "reliquat" && "bg-orange-100 text-orange-800",
                    )}
                  >
                    {LIBELLES_STATUT_COMMANDE[c.statutCommande]}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                      c.statutLivraison === "en_attente" && "bg-slate-100 text-slate-700",
                      c.statutLivraison === "livre" && "bg-green-100 text-green-800",
                      c.statutLivraison === "partiel" && "bg-orange-100 text-orange-800",
                      c.statutLivraison === "retard" && "bg-red-100 text-red-800",
                    )}
                  >
                    {LIBELLES_STATUT_LIVRAISON[c.statutLivraison]}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{c.semaineLivraisonPrevue ?? "—"}</td>
                <td className="px-3 py-2">
                  {c.essentielle ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                      Oui
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-slate-600">{c.remarque ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucune commande pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
