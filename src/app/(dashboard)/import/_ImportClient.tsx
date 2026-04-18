"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { Upload, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importerProjetsEnMasse, type LigneImport, type ResultatImport } from "@/app/(dashboard)/import/_actions";
import { estDemoStatique } from "@/lib/mode";
import { TYPES_PROJET, LIBELLES_TYPE_PROJET } from "@/lib/validations/projet";
import { cn } from "@/lib/utils";

interface LigneBrute {
  [key: string]: unknown;
}

/** Normalise une valeur string sans accents, lowercase, pour matcher les colonnes. */
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/** Essaie plusieurs noms de colonne candidats. */
function champ(l: LigneBrute, noms: string[]): string | undefined {
  for (const n of noms) {
    for (const k of Object.keys(l)) {
      if (norm(k) === norm(n)) {
        const v = l[k];
        if (v === null || v === undefined) return undefined;
        return String(v).trim();
      }
    }
  }
  return undefined;
}

function parseLigne(l: LigneBrute): { ligne: LigneImport | null; erreurs: string[] } {
  const erreurs: string[] = [];
  const reference = champ(l, ["reference", "ref", "réf"]);
  if (!reference) erreurs.push("référence manquante");

  const clientNom = champ(l, ["nom", "nom client", "client nom"]);
  const clientPrenom = champ(l, ["prenom", "prénom", "client prenom"]);
  if (!clientNom) erreurs.push("nom client manquant");
  if (!clientPrenom) erreurs.push("prénom client manquant");

  const type = champ(l, ["type", "type projet", "typeprojet"]) ?? "cuisine";
  const typeProjet = (TYPES_PROJET as readonly string[]).includes(norm(type).replace(/ /g, "_"))
    ? (norm(type).replace(/ /g, "_") as (typeof TYPES_PROJET)[number])
    : "cuisine";

  const semainePose = (champ(l, ["semaine pose", "semaine", "sem"]) ?? "").toUpperCase();
  if (!/^S(0[1-9]|[1-4][0-9]|5[0-3])$/.test(semainePose))
    erreurs.push("semaine pose invalide (ex S16)");

  const anneeStr = champ(l, ["annee pose", "année pose", "annee", "année"]);
  const anneePose = Number(anneeStr);
  if (!anneePose) erreurs.push("année pose invalide");

  const villeChantier = champ(l, ["ville chantier", "ville"]) ?? "";
  if (!villeChantier) erreurs.push("ville chantier manquante");

  if (erreurs.length > 0 || !reference || !clientNom || !clientPrenom)
    return { ligne: null, erreurs };

  return {
    ligne: {
      reference,
      clientNom,
      clientPrenom,
      clientTelephone: champ(l, ["telephone", "téléphone", "tel"]),
      clientEmail: champ(l, ["email", "mail"]),
      clientAdresse: champ(l, ["adresse client", "adresse"]) ?? "",
      clientCP: champ(l, ["cp client", "cp", "code postal"]) ?? "",
      clientVille: champ(l, ["ville client"]) ?? villeChantier,
      typeProjet,
      adresseChantier: champ(l, ["adresse chantier"]) ?? champ(l, ["adresse"]) ?? "",
      cpChantier: champ(l, ["cp chantier"]) ?? champ(l, ["cp"]) ?? "",
      villeChantier,
      semainePose,
      anneePose,
      estRenovation: /oui|true|1|renov/i.test(champ(l, ["renovation", "rénovation"]) ?? ""),
      montantHT: Number(champ(l, ["ht", "montant ht"])) || undefined,
      montantTTC: Number(champ(l, ["ttc", "montant ttc"])) || undefined,
    },
    erreurs: [],
  };
}

interface Apercu {
  lignes: LigneImport[];
  invalides: Array<{ index: number; raison: string }>;
}

export function ImportClient() {
  const [apercu, setApercu] = useState<Apercu | null>(null);
  const [resultat, setResultat] = useState<ResultatImport | null>(null);
  const [pending, start] = useTransition();
  const isDemo = estDemoStatique();

  async function onFile(file: File) {
    setResultat(null);
    setApercu(null);
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const feuille = wb.Sheets[wb.SheetNames[0]];
    const rows: LigneBrute[] = XLSX.utils.sheet_to_json(feuille);

    const lignes: LigneImport[] = [];
    const invalides: Array<{ index: number; raison: string }> = [];
    rows.forEach((row, i) => {
      const { ligne, erreurs } = parseLigne(row);
      if (ligne) lignes.push(ligne);
      else invalides.push({ index: i + 2, raison: erreurs.join(", ") });
    });
    setApercu({ lignes, invalides });
  }

  function onImport() {
    if (!apercu) return;
    start(async () => {
      const res = await importerProjetsEnMasse(apercu.lignes);
      setResultat(res);
      if (res.ok) setApercu(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {isDemo && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Mode démo : l'aperçu fonctionne mais l'import en base est désactivé.
        </div>
      )}

      <section className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm text-slate-700">
          Dépose ton fichier Excel (<code>.xlsx</code> ou <code>.xls</code>) ou clique pour choisir.
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="mt-3 cursor-pointer text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
        <p className="mt-3 text-[11px] text-slate-500">
          Colonnes attendues (casse/accents libres) : <code>reference</code>, <code>nom</code>,{" "}
          <code>prenom</code>, <code>type</code>, <code>semaine pose</code>, <code>annee pose</code>,{" "}
          <code>ville chantier</code>, <code>adresse chantier</code>, <code>cp chantier</code>,{" "}
          <code>ht</code>, <code>ttc</code>, <code>renovation</code>.
        </p>
      </section>

      {apercu && (
        <section className="rounded-md border border-slate-200 bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Aperçu
              </h2>
              <p className="text-xs text-slate-500">
                {apercu.lignes.length} valide(s) · {apercu.invalides.length} ignorée(s)
              </p>
            </div>
            <Button size="sm" onClick={onImport} disabled={pending || apercu.lignes.length === 0 || isDemo}>
              {pending ? "Import…" : "Importer en base"}
            </Button>
          </header>

          {apercu.invalides.length > 0 && (
            <div className="border-b border-slate-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Lignes ignorées : {apercu.invalides.map((i) => `ligne ${i.index} (${i.raison})`).join(" · ")}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1">Réf.</th>
                  <th className="px-3 py-1">Client</th>
                  <th className="px-3 py-1">Type</th>
                  <th className="px-3 py-1">Pose</th>
                  <th className="px-3 py-1">Ville</th>
                  <th className="px-3 py-1 text-right">HT / TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apercu.lignes.map((l) => (
                  <tr key={l.reference}>
                    <td className="px-3 py-1 font-mono">{l.reference}</td>
                    <td className="px-3 py-1">{l.clientPrenom} {l.clientNom}</td>
                    <td className="px-3 py-1 text-slate-600">{LIBELLES_TYPE_PROJET[l.typeProjet]}</td>
                    <td className="px-3 py-1 font-mono">{l.semainePose} {l.anneePose}</td>
                    <td className="px-3 py-1">{l.villeChantier}</td>
                    <td className="px-3 py-1 text-right font-mono">
                      {l.montantHT?.toLocaleString("fr-FR") ?? "—"} /{" "}
                      {l.montantTTC?.toLocaleString("fr-FR") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {resultat && (
        <section
          className={cn(
            "flex items-start gap-3 rounded-md border p-3 text-sm",
            resultat.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900",
          )}
        >
          {resultat.ok ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <div>
            {resultat.ok ? (
              <>
                <div className="font-semibold">{resultat.crees} projet(s) créé(s).</div>
                {resultat.ignores.length > 0 && (
                  <div className="mt-1 text-xs">
                    Ignorés : {resultat.ignores.map((i) => `${i.reference} (${i.raison})`).join(", ")}
                  </div>
                )}
              </>
            ) : (
              <div>{resultat.message}</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
