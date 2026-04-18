"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { dupliquerProjet } from "@/app/(dashboard)/projets/_actions";
import { estDemoStatique } from "@/lib/mode";

export function BoutonDupliquer({ projetId }: { projetId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  if (estDemoStatique()) return null;

  function onClick() {
    if (!confirm("Créer une copie de ce projet ? (étapes remises à zéro)")) return;
    setErreur(null);
    start(async () => {
      const res = await dupliquerProjet(projetId);
      if (!res.ok) {
        setErreur(res.message);
        return;
      }
      if (res.data) router.push(`/projets/${res.data.id}`);
    });
  }

  return (
    <>
      <button
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        title="Dupliquer ce projet comme modèle"
      >
        <Copy className="h-4 w-4" />
        {pending ? "Duplication…" : "Dupliquer"}
      </button>
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </>
  );
}
