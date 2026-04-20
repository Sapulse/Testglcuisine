"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CategorieCommande,
  StatutCommande,
  StatutLivraison,
} from "@prisma/client";
import { Plus, Trash2, Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/metier/ConfirmDialog";
import { QuickAddFournisseur } from "@/components/metier/QuickAddFournisseur";
import { cn } from "@/lib/utils";
import {
  creerCommande,
  modifierCommande,
  supprimerCommande,
} from "@/app/(dashboard)/commandes/_actions";
import {
  CATEGORIES_COMMANDE,
  LIBELLES_CATEGORIE,
  LIBELLES_STATUT_COMMANDE,
  LIBELLES_STATUT_LIVRAISON,
  STATUTS_COMMANDE,
  STATUTS_LIVRAISON,
} from "@/lib/validations/commande";

interface LigneCommande {
  id: string;
  categorie: CategorieCommande;
  fournisseurId: string;
  fournisseurNom: string;
  statutCommande: StatutCommande;
  semaineLivraisonPrevue: string | null;
  statutLivraison: StatutLivraison;
  essentielle: boolean;
  remarque: string | null;
}

interface Props {
  projetId: string;
  commandes: LigneCommande[];
  fournisseurs: Array<{ id: string; nom: string }>;
}

export function TableauCommandesProjet({ projetId, commandes, fournisseurs }: Props) {
  const [ajout, setAjout] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {commandes.length} commande{commandes.length > 1 ? "s" : ""} ·{" "}
          {commandes.filter((c) => c.essentielle).length} essentielle(s)
        </p>
        <Button size="sm" onClick={() => setAjout(true)} disabled={ajout}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Fournisseur</th>
              <th className="px-3 py-2">Statut cmd.</th>
              <th className="px-3 py-2">Livraison</th>
              <th className="px-3 py-2">Semaine</th>
              <th className="px-3 py-2">Ess.</th>
              <th className="px-3 py-2">Remarque</th>
              <th className="px-3 py-2 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ajout && (
              <LigneEdition
                projetId={projetId}
                fournisseurs={fournisseurs}
                initial={null}
                onTermine={() => setAjout(false)}
              />
            )}
            {commandes.map((c) =>
              editId === c.id ? (
                <LigneEdition
                  key={c.id}
                  projetId={projetId}
                  fournisseurs={fournisseurs}
                  initial={c}
                  onTermine={() => setEditId(null)}
                />
              ) : (
                <LigneLecture
                  key={c.id}
                  commande={c}
                  projetId={projetId}
                  onEdit={() => setEditId(c.id)}
                />
              ),
            )}
            {commandes.length === 0 && !ajout && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucune commande. Clique sur « Ajouter » pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LigneLecture({
  commande: c,
  projetId,
  onEdit,
}: {
  commande: LigneCommande;
  projetId: string;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();

  function onDelete() {
    start(async () => {
      const res = await supprimerCommande(projetId, c.id);
      if (!res.ok) toast.error(res.message);
      else toast.success(`Commande ${LIBELLES_CATEGORIE[c.categorie]} supprimée`);
    });
  }

  return (
    <tr className={cn(pending && "opacity-50")}>
      <td className="px-3 py-2">{LIBELLES_CATEGORIE[c.categorie]}</td>
      <td className="px-3 py-2">{c.fournisseurNom}</td>
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
            Essentielle
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-xs text-slate-600">{c.remarque ?? "—"}</td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <button
            onClick={onEdit}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Modifier"
            disabled={pending}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <ConfirmDialog
            titre="Supprimer cette commande ?"
            description={`${LIBELLES_CATEGORIE[c.categorie]} chez ${c.fournisseurNom}. Action irréversible.`}
            labelConfirmer="Supprimer"
            variant="destructive"
            onConfirmer={onDelete}
            trigger={
              <button
                className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                title="Supprimer"
                disabled={pending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
          />
        </div>
      </td>
    </tr>
  );
}

function LigneEdition({
  projetId,
  fournisseurs,
  initial,
  onTermine,
}: {
  projetId: string;
  fournisseurs: Array<{ id: string; nom: string }>;
  initial: LigneCommande | null;
  onTermine: () => void;
}) {
  const [categorie, setCategorie] = useState<CategorieCommande>(
    initial?.categorie ?? "meubles",
  );
  const [fournisseurId, setFournisseurId] = useState(
    initial?.fournisseurId ?? fournisseurs[0]?.id ?? "",
  );
  const [statutCommande, setStatutCommande] = useState<StatutCommande>(
    initial?.statutCommande ?? "non_envoye",
  );
  const [statutLivraison, setStatutLivraison] = useState<StatutLivraison>(
    initial?.statutLivraison ?? "en_attente",
  );
  const [semaine, setSemaine] = useState(initial?.semaineLivraisonPrevue ?? "");
  const [essentielle, setEssentielle] = useState(initial?.essentielle ?? true);
  const [remarque, setRemarque] = useState(initial?.remarque ?? "");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const router = useRouter();

  function onValider() {
    setErr(null);
    if (!fournisseurId) {
      setErr("Sélectionne un fournisseur");
      return;
    }
    start(async () => {
      const payload = {
        fournisseurId,
        categorie,
        statutCommande,
        statutLivraison,
        semaineLivraisonPrevue: semaine || undefined,
        essentielle,
        remarque: remarque || undefined,
      };
      const res = initial
        ? await modifierCommande(projetId, { id: initial.id, ...payload })
        : await creerCommande({ projetId, ...payload });
      if (!res.ok) {
        setErr(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(initial ? "Commande modifiée" : "Commande créée");
      onTermine();
    });
  }

  return (
    <tr className="bg-slate-50">
      <td className="px-2 py-2">
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value as CategorieCommande)}
          className="h-8 w-full rounded border border-slate-200 bg-white px-1 text-xs"
        >
          {CATEGORIES_COMMANDE.map((c) => (
            <option key={c} value={c}>
              {LIBELLES_CATEGORIE[c]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <Combobox
          options={fournisseurs.map((f) => ({ value: f.id, label: f.nom }))}
          value={fournisseurId}
          onChange={setFournisseurId}
          placeholder="Choisir…"
          recherchePlaceholder="Rechercher un fournisseur…"
          className="text-xs"
          onCreer={() => setQuickAddOpen(true)}
          labelCreer="+ Nouveau fournisseur"
        />
        <QuickAddFournisseur
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          categorieDefaut={categorie}
          onCree={() => router.refresh()}
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={statutCommande}
          onChange={(e) => setStatutCommande(e.target.value as StatutCommande)}
          className="h-8 w-full rounded border border-slate-200 bg-white px-1 text-xs"
        >
          {STATUTS_COMMANDE.map((s) => (
            <option key={s} value={s}>
              {LIBELLES_STATUT_COMMANDE[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <select
          value={statutLivraison}
          onChange={(e) => setStatutLivraison(e.target.value as StatutLivraison)}
          className="h-8 w-full rounded border border-slate-200 bg-white px-1 text-xs"
        >
          {STATUTS_LIVRAISON.map((s) => (
            <option key={s} value={s}>
              {LIBELLES_STATUT_LIVRAISON[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <Input
          value={semaine}
          onChange={(e) => setSemaine(e.target.value)}
          placeholder="S16"
          className="h-8 w-20 text-xs"
        />
      </td>
      <td className="px-2 py-2 text-center">
        <input
          type="checkbox"
          checked={essentielle}
          onChange={(e) => setEssentielle(e.target.checked)}
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={remarque}
          onChange={(e) => setRemarque(e.target.value)}
          placeholder="—"
          className="h-8 text-xs"
        />
      </td>
      <td className="px-2 py-2">
        <div className="flex justify-end gap-1">
          <button
            onClick={onValider}
            disabled={pending}
            className="rounded p-1 text-green-700 hover:bg-green-100"
            title="Valider"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onTermine}
            disabled={pending}
            className="rounded p-1 text-slate-500 hover:bg-slate-200"
            title="Annuler"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {err && <div className="text-[10px] text-red-600">{err}</div>}
      </td>
    </tr>
  );
}
