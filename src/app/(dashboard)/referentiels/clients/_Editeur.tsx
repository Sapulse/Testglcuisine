"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/metier/ConfirmDialog";
import { EmptyState } from "@/components/metier/EmptyState";
import {
  supprimerClient,
  upsertClient,
} from "@/app/(dashboard)/referentiels/_actions";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string;
  codePostal: string;
  ville: string;
  nbProjets: number;
}

export function EditeurClients({ initial }: { initial: Client[] }) {
  const [ajout, setAjout] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setAjout(true)} disabled={ajout}>
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>
      {initial.length === 0 && !ajout ? (
        <EmptyState
          icone={UserRound}
          titre="Aucun client"
          description="Ajoute ton premier client. Tu pourras ensuite lui rattacher des projets."
          cta={{ label: "Ajouter un client", onClick: () => setAjout(true) }}
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Prénom</th>
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Téléphone</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Adresse</th>
                <th className="px-3 py-2 text-center">Projets</th>
                <th className="w-24 px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ajout && (
                <LigneEdit initial={null} onTermine={() => setAjout(false)} />
              )}
              {initial.map((c) =>
                editId === c.id ? (
                  <LigneEdit
                    key={c.id}
                    initial={c}
                    onTermine={() => setEditId(null)}
                  />
                ) : (
                  <LigneLecture
                    key={c.id}
                    c={c}
                    onEdit={() => setEditId(c.id)}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LigneLecture({ c, onEdit }: { c: Client; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onDelete() {
    return new Promise<void>((resolve) => {
      start(async () => {
        const res = await supprimerClient(c.id);
        if (!res.ok) {
          setErr(res.message);
          toast.error(res.message);
        } else {
          toast.success(`${c.prenom} ${c.nom} supprimé`);
        }
        resolve();
      });
    });
  }

  return (
    <tr className={cn(pending && "opacity-50")}>
      <td className="px-3 py-2 font-medium">{c.prenom}</td>
      <td className="px-3 py-2">{c.nom}</td>
      <td className="px-3 py-2 text-slate-600">{c.telephone}</td>
      <td className="px-3 py-2 text-slate-600">{c.email ?? "—"}</td>
      <td className="px-3 py-2 text-xs text-slate-600">
        {c.adresse}
        <br />
        {c.codePostal} {c.ville}
      </td>
      <td className="px-3 py-2 text-center">
        {c.nbProjets > 0 ? (
          <Link
            href={`/projets?q=${encodeURIComponent(c.nom)}`}
            className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700 hover:bg-slate-200"
          >
            {c.nbProjets}
          </Link>
        ) : (
          <span className="text-xs text-slate-400">0</span>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <button
            onClick={onEdit}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
            disabled={pending}
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <ConfirmDialog
            titre={`Supprimer ${c.prenom} ${c.nom} ?`}
            description={
              c.nbProjets > 0
                ? `Ce client a ${c.nbProjets} projet(s). La suppression sera refusée tant qu'ils existent.`
                : "Action irréversible."
            }
            labelConfirmer="Supprimer"
            variant="destructive"
            onConfirmer={onDelete}
            trigger={
              <button
                className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                disabled={pending}
                title="Supprimer"
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
  initial: Client | null;
  onTermine: () => void;
}) {
  const [prenom, setPrenom] = useState(initial?.prenom ?? "");
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [cp, setCp] = useState(initial?.codePostal ?? "");
  const [ville, setVille] = useState(initial?.ville ?? "");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onValider() {
    setErr(null);
    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !adresse.trim() || !cp.trim() || !ville.trim()) {
      setErr("Tous les champs sont requis (sauf email)");
      toast.error("Tous les champs sont requis (sauf email)");
      return;
    }
    start(async () => {
      const res = await upsertClient(
        {
          nom,
          prenom,
          telephone,
          email: email || undefined,
          adresse,
          codePostal: cp,
          ville,
        },
        initial?.id,
      );
      if (!res.ok) {
        setErr(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(initial ? "Client modifié" : "Client ajouté");
      onTermine();
    });
  }

  return (
    <tr className="bg-slate-50">
      <td className="px-2 py-2">
        <Input
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Prénom"
          className="h-8 text-xs"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom"
          className="h-8 text-xs"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="06…"
          className="h-8 text-xs"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@…"
          className="h-8 text-xs"
        />
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-col gap-1">
          <Input
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Adresse"
            className="h-8 text-xs"
          />
          <div className="flex gap-1">
            <Input
              value={cp}
              onChange={(e) => setCp(e.target.value)}
              placeholder="CP"
              className="h-8 w-20 text-xs"
            />
            <Input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ville"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </td>
      <td className="px-2 py-2 text-center text-xs text-slate-400">—</td>
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
