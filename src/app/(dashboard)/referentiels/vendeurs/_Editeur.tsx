"use client";

import { toast } from "sonner";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/metier/ConfirmDialog";
import { useLocalStoreData } from "@/lib/data/use-local-store";
import { vendeursPourListe } from "@/lib/data/transformers";
import {
  supprimerVendeur,
  upsertVendeur,
} from "@/app/(dashboard)/referentiels/_actions";
import { cn } from "@/lib/utils";

interface Vendeur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string | null;
}

export function EditeurVendeurs({ initial }: { initial: Vendeur[] }) {
  const [ajout, setAjout] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const store = useLocalStoreData();
  const vendeurs: Vendeur[] = store
    ? vendeursPourListe(store).map((v) => ({
        id: v.id,
        nom: v.nom,
        prenom: v.prenom,
        telephone: v.telephone,
        email: v.email,
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
              <th className="px-3 py-2">Prénom</th>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Téléphone</th>
              <th className="px-3 py-2">Email</th>
              <th className="w-24 px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ajout && <LigneEdit initial={null} onTermine={() => setAjout(false)} />}
            {vendeurs.map((v) =>
              editId === v.id ? (
                <LigneEdit key={v.id} initial={v} onTermine={() => setEditId(null)} />
              ) : (
                <LigneLecture key={v.id} v={v} onEdit={() => setEditId(v.id)} />
              ),
            )}
            {vendeurs.length === 0 && !ajout && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucun vendeur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LigneLecture({ v, onEdit }: { v: Vendeur; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onDelete() {
    return new Promise<void>((resolve) => {
      start(async () => {
        const res = await supprimerVendeur(v.id);
        if (!res.ok) {
          setErr(res.message);
          toast.error(res.message);
        } else {
          toast.success(`${v.prenom} ${v.nom} supprimé`);
        }
        resolve();
      });
    });
  }

  return (
    <tr className={cn(pending && "opacity-50")}>
      <td className="px-3 py-2 font-medium">{v.prenom}</td>
      <td className="px-3 py-2">{v.nom}</td>
      <td className="px-3 py-2 text-slate-600">{v.telephone ?? "—"}</td>
      <td className="px-3 py-2 text-slate-600">{v.email ?? "—"}</td>
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
            titre={`Supprimer ${v.prenom} ${v.nom} ?`}
            description="Action irréversible."
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

function LigneEdit({
  initial,
  onTermine,
}: {
  initial: Vendeur | null;
  onTermine: () => void;
}) {
  const [prenom, setPrenom] = useState(initial?.prenom ?? "");
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onValider() {
    setErr(null);
    if (!nom.trim() || !prenom.trim()) {
      setErr("Nom et prénom requis");
      toast.error("Nom et prénom requis");
      return;
    }
    start(async () => {
      const res = await upsertVendeur(
        {
          nom,
          prenom,
          telephone: telephone || undefined,
          email: email || undefined,
        },
        initial?.id,
      );
      if (!res.ok) {
        setErr(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(initial ? "Fiche modifiée" : "Vendeur ajouté");
      onTermine();
    });
  }

  return (
    <tr className="bg-slate-50">
      <td className="px-2 py-2">
        <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <Input value={nom} onChange={(e) => setNom(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-8 text-xs" />
      </td>
      <td className="px-2 py-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-xs" />
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
