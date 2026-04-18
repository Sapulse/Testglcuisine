"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  assignerPoseur,
  retirerAssignation,
} from "@/app/(dashboard)/planning/_actions";

interface Assignation {
  id: string;
  poseurId: string;
  poseurNom: string;
  semaine: string;
  annee: number;
  role: "principal" | "secondaire";
}

interface Props {
  projetId: string;
  assignations: Assignation[];
  poseurs: Array<{ id: string; nom: string }>;
  semaineDefaut: string;
  anneeDefaut: number;
}

export function AssignationsPoseurs({
  projetId,
  assignations,
  poseurs,
  semaineDefaut,
  anneeDefaut,
}: Props) {
  const [ajout, setAjout] = useState(false);
  const [poseurId, setPoseurId] = useState(poseurs[0]?.id ?? "");
  const [semaine, setSemaine] = useState(semaineDefaut);
  const [annee, setAnnee] = useState(anneeDefaut);
  const [role, setRole] = useState<"principal" | "secondaire">("principal");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onAjouter() {
    setErr(null);
    start(async () => {
      const res = await assignerPoseur({ projetId, poseurId, semaine, annee, role });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setAjout(false);
    });
  }

  function onRetirer(id: string) {
    if (!confirm("Retirer cette assignation ?")) return;
    start(async () => {
      await retirerAssignation(projetId, id);
    });
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Assignations poseurs
        </h2>
        <Button size="sm" variant="outline" onClick={() => setAjout(true)} disabled={ajout}>
          <Plus className="h-4 w-4" />
          Assigner
        </Button>
      </header>
      <div className="p-3">
        {ajout && (
          <div className="mb-3 flex flex-wrap items-end gap-2 rounded bg-slate-50 p-2">
            <Champ label="Poseur">
              <select
                value={poseurId}
                onChange={(e) => setPoseurId(e.target.value)}
                className="h-8 rounded border border-slate-200 bg-white px-1 text-xs"
              >
                {poseurs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </Champ>
            <Champ label="Semaine">
              <Input
                value={semaine}
                onChange={(e) => setSemaine(e.target.value)}
                placeholder="S16"
                className="h-8 w-20 text-xs"
              />
            </Champ>
            <Champ label="Année">
              <Input
                type="number"
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="h-8 w-24 text-xs"
              />
            </Champ>
            <Champ label="Rôle">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "principal" | "secondaire")}
                className="h-8 rounded border border-slate-200 bg-white px-1 text-xs"
              >
                <option value="principal">Principal</option>
                <option value="secondaire">Secondaire</option>
              </select>
            </Champ>
            <div className="flex gap-1">
              <Button size="sm" onClick={onAjouter} disabled={pending}>
                Valider
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAjout(false)} disabled={pending}>
                Annuler
              </Button>
            </div>
            {err && <div className="w-full text-xs text-red-600">{err}</div>}
          </div>
        )}

        {assignations.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun poseur assigné.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {assignations.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded border border-slate-100 bg-slate-50 px-2 py-1.5 text-sm"
              >
                <span className="font-mono text-xs text-slate-500">
                  {a.semaine} · {a.annee}
                </span>
                <span className="font-medium">{a.poseurNom}</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] uppercase text-slate-600">
                  {a.role}
                </span>
                <button
                  onClick={() => onRetirer(a.id)}
                  disabled={pending}
                  className="ml-auto rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-700"
                  title="Retirer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}
