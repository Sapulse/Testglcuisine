"use client";

import { toast } from "sonner";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/metier/ConfirmDialog";
import { useLocalStoreData } from "@/lib/data/use-local-store";
import { fournisseursPourListe } from "@/lib/data/transformers";
import {
  supprimerFournisseur,
  upsertFournisseur,
} from "@/app/(dashboard)/referentiels/_actions";
import {
  CATEGORIES_COMMANDE,
  LIBELLES_CATEGORIE,
} from "@/lib/validations/commande";
import { cn } from "@/lib/utils";

interface Fournisseur {
  id: string;
  nom: string;
  contact: string | null;
  telephone: string | null;
  email: string | null;
  categories: string[];
}

export function EditeurFournisseurs({ initial }: { initial: Fournisseur[] }) {
  const [ajout, setAjout] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const store = useLocalStoreData();
  const fournisseurs: Fournisseur[] = store
    ? fournisseursPourListe(store).map((f) => ({
        id: f.id,
        nom: f.nom,
        contact: f.contact,
        telephone: f.telephone,
        email: f.email,
        categories: f.categories,
      }))
    : initial;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setAjout(true)} disabled={ajout}>
          <Plus className="h-4 w-4" />
          Nouveau
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Téléphone</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Catégories</th>
              <th className="w-24 px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ajout && <Ligne mode="ajout" initial={null} onTermine={() => setAjout(false)} />}
            {fournisseurs.map((f) =>
              editId === f.id ? (
                <Ligne key={f.id} mode="edit" initial={f} onTermine={() => setEditId(null)} />
              ) : (
                <LigneLecture key={f.id} f={f} onEdit={() => setEditId(f.id)} />
              ),
            )}
            {fournisseurs.length === 0 && !ajout && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucun fournisseur. Clique sur « Nouveau ».
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LigneLecture({ f, onEdit }: { f: Fournisseur; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onDelete() {
    return new Promise<void>((resolve) => {
      setErr(null);
      start(async () => {
        const res = await supprimerFournisseur(f.id);
        if (!res.ok) {
          setErr(res.message);
          toast.error(res.message);
        } else {
          toast.success(`${f.nom} supprimé`);
        }
        resolve();
      });
    });
  }

  return (
    <tr className={cn(pending && "opacity-50")}>
      <td className="px-3 py-2 font-medium">{f.nom}</td>
      <td className="px-3 py-2 text-slate-600">{f.contact ?? "—"}</td>
      <td className="px-3 py-2 text-slate-600">{f.telephone ?? "—"}</td>
      <td className="px-3 py-2 text-slate-600">{f.email ?? "—"}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {f.categories.length === 0 ? (
            <span className="text-xs text-slate-400">—</span>
          ) : (
            f.categories.map((c) => (
              <span
                key={c}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
              >
                {LIBELLES_CATEGORIE[c as keyof typeof LIBELLES_CATEGORIE] ?? c}
              </span>
            ))
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <button
            onClick={onEdit}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
            disabled={pending}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <ConfirmDialog
            titre={`Supprimer ${f.nom} ?`}
            description="Action irréversible. Si des commandes ou SAV y sont liés, la suppression sera refusée."
            labelConfirmer="Supprimer"
            variant="destructive"
            onConfirmer={onDelete}
            trigger={
              <button
                className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                disabled={pending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
          />
        </div>
        {err && <div className="mt-1 text-[10px] text-red-600">{err}</div>}
      </td>
    </tr>
  );
}

function Ligne({
  mode,
  initial,
  onTermine,
}: {
  mode: "ajout" | "edit";
  initial: Fournisseur | null;
  onTermine: () => void;
}) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function toggle(c: string) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function onValider() {
    setErr(null);
    if (!nom.trim()) {
      setErr("Nom requis");
      toast.error("Nom requis");
      return;
    }
    start(async () => {
      const res = await upsertFournisseur(
        {
          nom,
          contact: contact || undefined,
          telephone: telephone || undefined,
          email: email || undefined,
          categories: categories as (typeof CATEGORIES_COMMANDE)[number][],
        },
        mode === "edit" && initial ? initial.id : undefined,
      );
      if (!res.ok) {
        setErr(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(mode === "edit" ? "Fiche modifiée" : "Fournisseur ajouté");
      onTermine();
    });
  }

  return (
    <tr className="bg-slate-50">
      <td className="px-2 py-2">
        <Input value={nom} onChange={(e) => setNom(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <Input value={contact} onChange={(e) => setContact(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES_COMMANDE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px]",
                categories.includes(c)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700",
              )}
            >
              {LIBELLES_CATEGORIE[c]}
            </button>
          ))}
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex justify-end gap-1">
          <button
            onClick={onValider}
            disabled={pending}
            className="rounded p-1 text-green-700 hover:bg-green-100"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onTermine}
            disabled={pending}
            className="rounded p-1 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {err && <div className="text-[10px] text-red-600">{err}</div>}
      </td>
    </tr>
  );
}
