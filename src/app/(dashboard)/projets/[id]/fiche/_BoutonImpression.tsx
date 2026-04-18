"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Déclenche l'impression système (Chrome : "Enregistrer en PDF"). */
export function BoutonImpression() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      Imprimer / PDF
    </Button>
  );
}
