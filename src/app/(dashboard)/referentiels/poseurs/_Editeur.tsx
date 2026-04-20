"use client";

import { toast } from "sonner";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/metier/ConfirmDialog";
import {
  supprimerPoseur,
  upsertPoseur,
} from "@/app/(dashboard)/referentiels/_actions";
import { cn } from "@/lib/utils";

interface Poseur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  interne: boolean;
}

export function EditeurPoseurs({ initial }: { initial: Poseur[] }) {
  const [ajout, setAjout] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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
              <th className="px-3 py-2">Interne/Externe</th>
              <th className="w-24 px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ajout && <LigneEdit initial={null} onTermine={() => setAjout(false)} />}
            {initial.map((p) =>
              editId === p.id ? (
                <LigneEdit key={p.id} initial={p} onTermine={() => setEditId(null)} />
              ) : (
                <LigneLecture key={p.id} p={p} onEdit={() => setEditId(p.id)} />
              ),
            )}
            {initial.length === 0 && !ajout && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                  Aucun poseur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LigneLecture({ p, onEdit }: { p: Poseur; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onDelete() {
    return new Promise<void>((resolve) => {
      start(async () => {
        const res = await supprimerPoseur(p.id);
        if (!res.ok) {
          setErr(res.message);
          toast.error(res.message);
        } else {
          toast.success(`${p.prenom} ${p.nom} supprimé`);
        }
        resolve();
      });
    });
  }

  return (
    <tr className={cn(pending && "opacity-50")}>
      <td className="px-3 py-2 font-medium">{p.prenom}</td>
      <td className="px-3 py-2">{p.nom}</td>
      <td className="px-3 py-2 text-slate-600">{p.telephone ?? "—"}</td>
      <td className="px-3 py-2">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[11px] font-semibold",
            p.interne ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700",
          )}
        >
          {p.interne ? "Interne" : "Externe"}
        </span>
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
            titre={`Supprimer ${p.prenom} ${p.nom} ?`}
            description="Action irréversible. Si des assignations existent, la suppression sera refusée."
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
  initial: Poseur | null;
  onTermine: () => void;
}) {
  const [prenom, setPrenom] = useState(initial?.prenom ?? "");
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [interne, setInterne] = useState(initial?.interne ?? true);
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
      const res = await upsertPoseur(
        {
          nom,
          prenom,
          telephone: telephone || undefined,
          interne,
        },
        initial?.id,
      );
      if (!res.ok) {
        setErr(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(initial ? "Fiche modifiée" : "Poseur ajouté");
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={interne}
            onChange={(e) => setInterne(e.target.checked)}
          />
          <span className="text-xs">Interne</span>
        </label>
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
