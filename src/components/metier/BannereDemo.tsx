"use client";

import { useState } from "react";
import { toast } from "sonner";
import { estDemoStatique } from "@/lib/mode";
import { resetStore } from "@/lib/data/local-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Bandeau démo (mode statique GitHub Pages).
 * Indique que les données sont locales au navigateur, et propose un reset.
 */
export function BannereDemo() {
  const [open, setOpen] = useState(false);
  if (!estDemoStatique()) return null;

  function reset() {
    resetStore();
    toast.success("Données démo réinitialisées");
    setOpen(false);
    setTimeout(() => window.location.reload(), 400);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 print:hidden">
        <span>
          <strong className="font-semibold">Démo interactive</strong> · les
          créations / modifications sont stockées dans <em>ton navigateur</em>{" "}
          (non partagées). Pour un usage réel multi-utilisateurs : déploiement sur
          serveur requis.
        </span>
        <button
          onClick={() => setOpen(true)}
          className="rounded border border-amber-300 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-900 hover:bg-amber-100"
        >
          Réinitialiser la démo
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser les données démo ?</DialogTitle>
            <DialogDescription>
              Toutes tes modifications (projets ajoutés, étapes cochées,
              commandes…) seront effacées et l&apos;app reviendra aux 3 projets
              de démonstration de départ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={reset}>
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
