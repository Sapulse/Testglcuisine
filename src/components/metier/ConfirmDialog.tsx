"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  trigger: React.ReactElement;
  titre: string;
  description?: string;
  labelConfirmer?: string;
  labelAnnuler?: string;
  variant?: "default" | "destructive";
  onConfirmer: () => void | Promise<void>;
}

/**
 * Wrapper autour d'un trigger qui ouvre une modale de confirmation custom
 * (remplace `window.confirm()` par une UI propre).
 */
export function ConfirmDialog({
  trigger,
  titre,
  description,
  labelConfirmer = "Confirmer",
  labelAnnuler = "Annuler",
  variant = "default",
  onConfirmer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function valider() {
    setPending(true);
    try {
      await onConfirmer();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  // Clone le trigger pour ajouter onClick.
  const triggerClone = (
    <span onClick={() => setOpen(true)} className="contents">
      {trigger}
    </span>
  );

  return (
    <>
      {triggerClone}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{titre}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {labelAnnuler}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={valider}
              disabled={pending}
            >
              {pending ? "…" : labelConfirmer}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
