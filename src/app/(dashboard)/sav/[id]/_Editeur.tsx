"use client";

import { useState, useTransition } from "react";
import { ajouterAuJournal, modifierSav, supprimerSav } from "../_actions";
import type { StatutSAV } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LIBELLES_STATUT_SAV,
  STATUTS_SAV,
  TYPES_JOURNAL_SAV,
  LIBELLES_TYPE_JOURNAL,
} from "@/lib/validations/sav";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  projetId: string;
  statut: StatutSAV;
  bloquant: boolean;
  commentaire: string | null;
  dateIntervention: Date | null;
  dateCloture: Date | null;
}

/** Panneau d'édition rapide d'un SAV + ajout d'entrée au journal. */
export function EditeurSav(props: Props) {
  const router = useRouter();
  const [statut, setStatut] = useState<StatutSAV>(props.statut);
  const [bloquant, setBloquant] = useState(props.bloquant);
  const [commentaire, setCommentaire] = useState(props.commentaire ?? "");
  const [dateIntervention, setDateIntervention] = useState(
    props.dateIntervention
      ? new Date(props.dateIntervention).toISOString().slice(0, 10)
      : "",
  );
  const [dateCloture, setDateCloture] = useState(
    props.dateCloture ? new Date(props.dateCloture).toISOString().slice(0, 10) : "",
  );
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onEnregistrer() {
    setErr(null);
    start(async () => {
      const res = await modifierSav({
        id: props.id,
        statut,
        bloquant,
        commentaire: commentaire || undefined,
        dateIntervention: dateIntervention || undefined,
        dateCloture: dateCloture || undefined,
      });
      if (!res.ok) setErr(res.message);
    });
  }

  function onSupprimer() {
    if (!confirm("Supprimer ce ticket SAV ?")) return;
    start(async () => {
      const res = await supprimerSav(props.id);
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      router.push("/sav");
    });
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Modifier le ticket
        </h2>
      </header>
      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label>Statut</Label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value as StatutSAV)}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
          >
            {STATUTS_SAV.map((s) => (
              <option key={s} value={s}>
                {LIBELLES_STATUT_SAV[s]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-1 text-sm">
          <input
            type="checkbox"
            checked={bloquant}
            onChange={(e) => setBloquant(e.target.checked)}
          />
          <span>Bloquant</span>
        </label>
        <div className="flex flex-col gap-1">
          <Label htmlFor="dateIntervention">Date intervention</Label>
          <Input
            id="dateIntervention"
            type="date"
            value={dateIntervention}
            onChange={(e) => setDateIntervention(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="dateCloture">Date clôture</Label>
          <Input
            id="dateCloture"
            type="date"
            value={dateCloture}
            onChange={(e) => setDateCloture(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1">
          <Label htmlFor="commentaire">Commentaire</Label>
          <textarea
            id="commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={3}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none"
          />
        </div>
      </div>
      {err && <div className="px-3 pb-2 text-xs text-red-600">{err}</div>}
      <footer className="flex justify-between gap-2 border-t border-slate-200 px-3 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSupprimer}
          disabled={pending}
          className="text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
        <Button size="sm" onClick={onEnregistrer} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </footer>
    </section>
  );
}

export function FormulaireJournal({ savId }: { savId: string }) {
  const [type, setType] = useState<(typeof TYPES_JOURNAL_SAV)[number]>("note");
  const [auteur, setAuteur] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onAjouter() {
    if (!commentaire.trim()) {
      setErr("Commentaire requis");
      return;
    }
    setErr(null);
    start(async () => {
      const res = await ajouterAuJournal({
        savId,
        type,
        auteur: auteur || undefined,
        commentaire,
      });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setCommentaire("");
      setAuteur("");
      setType("note");
    });
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Ajouter au journal
        </h2>
      </header>
      <div className="flex flex-col gap-2 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label>Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof TYPES_JOURNAL_SAV)[number])}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
            >
              {TYPES_JOURNAL_SAV.map((t) => (
                <option key={t} value={t}>
                  {LIBELLES_TYPE_JOURNAL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Auteur</Label>
            <Input value={auteur} onChange={(e) => setAuteur(e.target.value)} placeholder="Ex: Gildas" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Commentaire</Label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={2}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
          />
        </div>
        {err && <div className="text-xs text-red-600">{err}</div>}
        <div className="flex justify-end">
          <Button size="sm" onClick={onAjouter} disabled={pending}>
            Ajouter
          </Button>
        </div>
      </div>
    </section>
  );
}
