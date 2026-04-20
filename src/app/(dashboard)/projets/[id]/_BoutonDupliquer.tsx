"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { dupliquerProjet } from "@/app/(dashboard)/projets/_actions";
import { estDemoStatique } from "@/lib/mode";
import { ConfirmDialog } from "@/components/metier/ConfirmDialog";

export function BoutonDupliquer({ projetId }: { projetId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (estDemoStatique()) return null;

  function onConfirm() {
    return new Promise<void>((resolve) => {
      start(async () => {
        const res = await dupliquerProjet(projetId);
        if (!res.ok) {
          toast.error(res.message);
        } else {
          toast.success("Projet dupliqué");
          if (res.data) router.push(`/projets/${res.data.id}`);
        }
        resolve();
      });
    });
  }

  return (
    <ConfirmDialog
      titre="Dupliquer ce projet ?"
      description="Une copie sera créée avec le même client et les mêmes commandes. Les statuts d'étapes seront remis à zéro."
      labelConfirmer="Dupliquer"
      onConfirmer={onConfirm}
      trigger={
        <button
          disabled={pending}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          title="Dupliquer ce projet comme modèle"
        >
          <Copy className="h-4 w-4" />
          {pending ? "Duplication…" : "Dupliquer"}
        </button>
      }
    />
  );
}
