"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enregistrerNotes } from "@/app/(dashboard)/projets/_actions";
import { estDemoStatique } from "@/lib/mode";
import { StickyNote } from "lucide-react";

interface Props {
  projetId: string;
  notesInitiales: string | null;
}

/** Bloc de notes libres sur un projet (à part du SAV). */
export function NotesProjet({ projetId, notesInitiales }: Props) {
  const [notes, setNotes] = useState(notesInitiales ?? "");
  const [enregistre, setEnregistre] = useState(notesInitiales ?? "");
  const [pending, start] = useTransition();
  const isDemo = estDemoStatique();
  const dirty = notes !== enregistre;

  function sauvegarder() {
    if (!dirty || isDemo) return;
    start(async () => {
      const res = await enregistrerNotes(projetId, notes);
      if (!res.ok) {
        toast.error(res.message);
      } else {
        setEnregistre(notes);
        toast.success("Notes enregistrées");
      }
    });
  }

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50/40">
      <header className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
          <StickyNote className="h-3 w-3" />
          Notes libres
        </div>
        {dirty && (
          <span className="text-[11px] italic text-amber-800">
            Non enregistré
          </span>
        )}
      </header>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={sauvegarder}
        placeholder="Remarques internes, points de vigilance, contexte client…"
        rows={3}
        disabled={isDemo}
        className="block w-full resize-y bg-transparent p-3 text-sm outline-none disabled:cursor-not-allowed"
      />
      {dirty && !isDemo && (
        <footer className="flex justify-end gap-2 border-t border-amber-200 px-3 py-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNotes(enregistre)}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button size="sm" onClick={sauvegarder} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </footer>
      )}
    </section>
  );
}
