"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import type {
  CategorieCommande,
  StatutEtape,
  StatutLivraison,
} from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { modifierEtape } from "@/app/(dashboard)/projets/_actions";
import { modifierStatutsCommande } from "@/app/(dashboard)/commandes/_actions";
import {
  CATEGORIES_COMMANDE,
  LIBELLES_CATEGORIE,
} from "@/lib/validations/commande";
import { LIBELLES_TYPE_PROJET } from "@/lib/validations/projet";
import {
  COULEURS_STATUT_GLOBAL,
  LIBELLES_STATUT_GLOBAL,
  type StatutGlobalProjet,
} from "@/lib/metier/statuts";
import { estDemoStatique } from "@/lib/mode";
import { cn } from "@/lib/utils";
import type { LigneGrille, CelluleEtape, CelluleCommande } from "@/lib/queries/grille";

const NOMS_ETAPES_COURTS: Record<number, string> = {
  1: "Bon cmd",
  2: "Plans tech",
  3: "Plans pose",
  4: "Cmd",
  5: "Livr",
  6: "Dépose",
  7: "Élec",
  8: "Pose",
  9: "Fact",
};

const ORDRE_STATUTS_ETAPE: StatutEtape[] = [
  "non_commence",
  "en_cours",
  "termine",
  "bloque",
];
const ORDRE_STATUTS_LIVRAISON: StatutLivraison[] = [
  "en_attente",
  "livre",
  "partiel",
  "retard",
];

const COULEURS_ETAPE: Record<StatutEtape, string> = {
  non_commence: "bg-white border-slate-200 text-slate-300",
  en_cours: "bg-blue-100 border-blue-300 text-blue-800",
  termine: "bg-green-100 border-green-300 text-green-800",
  bloque: "bg-red-200 border-red-400 text-red-900",
};

const SYMBOLES_ETAPE: Record<StatutEtape, string> = {
  non_commence: "·",
  en_cours: "○",
  termine: "✓",
  bloque: "!",
};

const COULEURS_LIVRAISON: Record<StatutLivraison, string> = {
  en_attente: "bg-slate-100 text-slate-700 border-slate-200",
  livre: "bg-green-100 text-green-900 border-green-300",
  partiel: "bg-orange-100 text-orange-900 border-orange-300",
  retard: "bg-red-200 text-red-900 border-red-400",
};

interface Props {
  lignesInitiales: LigneGrille[];
}

export function GrilleClient({ lignesInitiales }: Props) {
  const [recherche, setRecherche] = useState("");
  const [statutFiltre, setStatutFiltre] = useState<StatutGlobalProjet | "">("");
  const [anneeFiltre, setAnneeFiltre] = useState<string>("");
  const isDemo = estDemoStatique();

  const annees = useMemo(
    () => Array.from(new Set(lignesInitiales.map((l) => l.anneePose))).sort(),
    [lignesInitiales],
  );

  const filtrees = useMemo(() => {
    return lignesInitiales.filter((l) => {
      if (statutFiltre && l.statutGlobal !== statutFiltre) return false;
      if (anneeFiltre && l.anneePose !== Number(anneeFiltre)) return false;
      if (recherche) {
        const r = recherche.toLowerCase();
        const hay = `${l.reference} ${l.clientNom} ${l.clientPrenom} ${l.villeChantier}`.toLowerCase();
        if (!hay.includes(r)) return false;
      }
      return true;
    });
  }, [lignesInitiales, statutFiltre, anneeFiltre, recherche]);

  return (
    <div className="flex flex-col gap-3">
      {/* Filtres */}
      <div className="flex flex-wrap items-end gap-2">
        <input
          type="text"
          placeholder="Rechercher (réf, client, ville)…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="h-8 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm"
        />
        <select
          value={statutFiltre}
          onChange={(e) => setStatutFiltre(e.target.value as StatutGlobalProjet | "")}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm"
        >
          <option value="">Tous statuts</option>
          {(Object.keys(LIBELLES_STATUT_GLOBAL) as StatutGlobalProjet[]).map((s) => (
            <option key={s} value={s}>
              {LIBELLES_STATUT_GLOBAL[s]}
            </option>
          ))}
        </select>
        <select
          value={anneeFiltre}
          onChange={(e) => setAnneeFiltre(e.target.value)}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm"
        >
          <option value="">Toutes années</option>
          {annees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-500">
          {filtrees.length} / {lignesInitiales.length} chantier(s)
          {!isDemo && (
            <> · cliquer sur les cellules pour cycler les statuts</>
          )}
        </span>
      </div>

      {/* Légende */}
      <Legende />

      {/* Tableau ultra-dense (scroll horizontal) */}
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-max border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
            <tr>
              <Th sticky="left-0">Réf.</Th>
              <Th sticky="left-[64px]">Client</Th>
              <Th>Tél.</Th>
              <Th>Année</Th>
              <Th>Type</Th>
              <Th>Adresse / ville</Th>
              <Th>Vendeur</Th>
              {/* 9 étapes */}
              {Object.entries(NOMS_ETAPES_COURTS).map(([n, label]) => (
                <Th key={`et-${n}`} className="text-center">
                  {label}
                </Th>
              ))}
              <Th>Poseurs</Th>
              <Th>Pose</Th>
              {/* 7 catégories de commandes */}
              {CATEGORIES_COMMANDE.map((cat) => (
                <Th key={`cat-${cat}`} colSpan={2} className="text-center">
                  {LIBELLES_CATEGORIE[cat]}
                </Th>
              ))}
              <Th>Statut</Th>
              <Th>—</Th>
            </tr>
            <tr className="bg-slate-50 text-[10px] text-slate-500">
              <Th sticky="left-0" />
              <Th sticky="left-[64px]" />
              <Th />
              <Th />
              <Th />
              <Th />
              <Th />
              {Object.keys(NOMS_ETAPES_COURTS).map((n) => (
                <Th key={`sub-et-${n}`} />
              ))}
              <Th />
              <Th />
              {CATEGORIES_COMMANDE.map((cat) => (
                <>
                  <Th key={`f-${cat}`} className="text-center">
                    Fournisseur
                  </Th>
                  <Th key={`l-${cat}`} className="text-center">
                    Livr.
                  </Th>
                </>
              ))}
              <Th />
              <Th />
            </tr>
          </thead>
          <tbody>
            {filtrees.map((l) => (
              <Ligne key={l.id} ligne={l} isDemo={isDemo} />
            ))}
            {filtrees.length === 0 && (
              <tr>
                <td colSpan={30} className="px-3 py-6 text-center text-slate-500">
                  Aucun chantier pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Ligne({ ligne, isDemo }: { ligne: LigneGrille; isDemo: boolean }) {
  const baseTd =
    "border-b border-r border-slate-200 px-2 py-1 align-middle whitespace-nowrap";
  return (
    <tr className="hover:bg-slate-50">
      <td className={cn(baseTd, "sticky left-0 z-[1] bg-white font-mono")}>
        <Link
          href={`/projets/${ligne.id}`}
          className="font-semibold text-slate-900 hover:underline"
        >
          {ligne.reference}
        </Link>
      </td>
      <td className={cn(baseTd, "sticky left-[64px] z-[1] bg-white font-medium")}>
        {ligne.clientPrenom} {ligne.clientNom}
      </td>
      <td className={cn(baseTd, "text-slate-600")}>{ligne.clientTelephone}</td>
      <td className={cn(baseTd, "text-center font-mono")}>{ligne.anneePose}</td>
      <td className={cn(baseTd)}>
        <div>
          {LIBELLES_TYPE_PROJET[ligne.typeProjet as keyof typeof LIBELLES_TYPE_PROJET] ?? ligne.typeProjet}
        </div>
        <div className="text-[10px] text-slate-500">
          {ligne.estRenovation ? "Rénovation" : "Neuf"}
        </div>
      </td>
      <td className={cn(baseTd, "max-w-[200px] truncate text-slate-600")}>
        {ligne.adresseChantier} · {ligne.villeChantier}
      </td>
      <td className={cn(baseTd, "text-slate-700")}>{ligne.vendeurNom ?? "—"}</td>

      {/* 9 cellules étapes cyclables */}
      {Object.keys(NOMS_ETAPES_COURTS).map((n) => {
        const num = Number(n);
        const e = ligne.etapes[num];
        return (
          <CelluleEtapeView
            key={`et-${ligne.id}-${num}`}
            etape={e}
            projetId={ligne.id}
            isDemo={isDemo}
          />
        );
      })}

      <td className={cn(baseTd, "text-slate-700")}>{ligne.poseursNoms}</td>
      <td className={cn(baseTd, "text-center font-mono font-semibold")}>
        {ligne.semainePose}
      </td>

      {/* 7 catégories × (fournisseur + livraison) */}
      {CATEGORIES_COMMANDE.map((cat) => {
        const c = ligne.commandes[cat];
        return (
          <CelluleCommandeView
            key={`cmd-${ligne.id}-${cat}`}
            cellule={c}
            projetId={ligne.id}
            isDemo={isDemo}
          />
        );
      })}

      <td className={cn(baseTd, "text-center")}>
        <span
          className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
          style={{ backgroundColor: COULEURS_STATUT_GLOBAL[ligne.statutGlobal] }}
        >
          {LIBELLES_STATUT_GLOBAL[ligne.statutGlobal]}
        </span>
      </td>
      <td className={cn(baseTd, "text-center")}>
        <Link
          href={`/projets/${ligne.id}`}
          className="text-slate-400 hover:text-slate-700"
          title="Ouvrir la fiche"
        >
          <ExternalLink className="h-3 w-3" />
        </Link>
      </td>
    </tr>
  );
}

function CelluleEtapeView({
  etape,
  projetId,
  isDemo,
}: {
  etape?: CelluleEtape;
  projetId: string;
  isDemo: boolean;
}) {
  const [statut, setStatut] = useState<StatutEtape | undefined>(etape?.statut);
  const [pending, start] = useTransition();
  const baseTd =
    "border-b border-r border-slate-200 p-0.5 align-middle text-center";

  if (!etape) {
    return <td className={baseTd}>—</td>;
  }

  function cycler() {
    if (isDemo) return;
    const courant = statut ?? "non_commence";
    const idx = ORDRE_STATUTS_ETAPE.indexOf(courant);
    const suivant = ORDRE_STATUTS_ETAPE[(idx + 1) % ORDRE_STATUTS_ETAPE.length];
    setStatut(suivant);
    start(async () => {
      await modifierEtape({ etapeId: etape!.id, statut: suivant, projetId });
    });
  }

  const s = statut ?? "non_commence";
  return (
    <td className={baseTd}>
      <button
        onClick={cycler}
        disabled={isDemo || pending}
        className={cn(
          "h-7 w-7 rounded border text-base font-bold leading-none transition",
          COULEURS_ETAPE[s],
          !isDemo && "cursor-pointer hover:scale-110",
          pending && "opacity-50",
        )}
        title={s}
      >
        {SYMBOLES_ETAPE[s]}
      </button>
    </td>
  );
}

function CelluleCommandeView({
  cellule,
  projetId,
  isDemo,
}: {
  cellule?: CelluleCommande;
  projetId: string;
  isDemo: boolean;
}) {
  const [statutLivr, setStatutLivr] = useState<StatutLivraison | undefined>(
    cellule?.statutLivraison,
  );
  const [pending, start] = useTransition();
  const baseTd =
    "border-b border-r border-slate-200 px-1 py-0.5 align-middle whitespace-nowrap";

  if (!cellule) {
    return (
      <>
        <td className={cn(baseTd, "text-center text-slate-300")}>—</td>
        <td className={cn(baseTd, "text-center text-slate-300")}>—</td>
      </>
    );
  }

  function cycler() {
    if (isDemo) return;
    const courant = statutLivr ?? "en_attente";
    const idx = ORDRE_STATUTS_LIVRAISON.indexOf(courant);
    const suivant =
      ORDRE_STATUTS_LIVRAISON[(idx + 1) % ORDRE_STATUTS_LIVRAISON.length];
    setStatutLivr(suivant);
    start(async () => {
      await modifierStatutsCommande(projetId, cellule!.id, {
        statutLivraison: suivant,
      });
    });
  }

  const s = statutLivr ?? "en_attente";
  const labelSemaine = cellule.semaineLivraisonPrevue ?? "?";
  return (
    <>
      <td className={cn(baseTd, "max-w-[120px] truncate text-slate-800")}>
        {cellule.fournisseurNom}
      </td>
      <td className={cn(baseTd, "text-center")}>
        <button
          onClick={cycler}
          disabled={isDemo || pending}
          className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold transition",
            COULEURS_LIVRAISON[s],
            !isDemo && "cursor-pointer hover:opacity-80",
            pending && "opacity-50",
          )}
          title={s}
        >
          {s === "retard" ? "Retard" : labelSemaine}
        </button>
      </td>
    </>
  );
}

function Th({
  children,
  className,
  sticky,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  sticky?: string;
  colSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        "border-b border-r border-slate-200 px-2 py-1 text-left font-semibold uppercase tracking-wide",
        sticky && `sticky ${sticky} z-20 bg-slate-100`,
        className,
      )}
    >
      {children}
    </th>
  );
}

function Legende() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
      <span className="font-semibold uppercase">Étapes :</span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block h-4 w-4 rounded border text-center font-bold", COULEURS_ETAPE.non_commence)}>
          ·
        </span>
        À faire
      </span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block h-4 w-4 rounded border text-center font-bold", COULEURS_ETAPE.en_cours)}>
          ○
        </span>
        En cours
      </span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block h-4 w-4 rounded border text-center font-bold", COULEURS_ETAPE.termine)}>
          ✓
        </span>
        Terminé
      </span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block h-4 w-4 rounded border text-center font-bold", COULEURS_ETAPE.bloque)}>
          !
        </span>
        Bloqué
      </span>
      <span className="ml-3 font-semibold uppercase">Livraisons :</span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block rounded border px-1.5 font-mono text-[10px]", COULEURS_LIVRAISON.en_attente)}>
          S?
        </span>
        Attendue
      </span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block rounded border px-1.5 font-mono text-[10px]", COULEURS_LIVRAISON.livre)}>
          S?
        </span>
        Livrée
      </span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block rounded border px-1.5 font-mono text-[10px]", COULEURS_LIVRAISON.partiel)}>
          S?
        </span>
        Partielle
      </span>
      <span className="flex items-center gap-1">
        <span className={cn("inline-block rounded border px-1.5 font-mono text-[10px]", COULEURS_LIVRAISON.retard)}>
          Retard
        </span>
      </span>
    </div>
  );
}
