"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertFournisseur } from "@/app/(dashboard)/referentiels/_actions";
import {
  CATEGORIES_COMMANDE,
  LIBELLES_CATEGORIE,
  type CommandeInput,
} from "@/lib/validations/commande";
import { cn } from "@/lib/utils";

type Categorie = CommandeInput["categorie"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback appelé après création réussie. Doit recharger la liste de fournisseurs. */
  onCree?: (id: string) => void;
  /** Catégorie pré-sélectionnée si on vient d'un formulaire commande. */
  categorieDefaut?: Categorie;
}

/** Dialogue rapide pour créer un fournisseur sans quitter le formulaire en cours. */
export function QuickAddFournisseur({
  open,
  onOpenChange,
  onCree,
  categorieDefaut,
}: Props) {
  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<Categorie[]>(
    categorieDefaut ? [categorieDefaut] : [],
  );
  const [pending, start] = useTransition();

  function reset() {
    setNom("");
    setContact("");
    setTelephone("");
    setEmail("");
    setCategories(categorieDefaut ? [categorieDefaut] : []);
  }

  function toggleCat(c: Categorie) {
    setCategories((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  }

  function valider() {
    if (!nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    start(async () => {
      const res = await upsertFournisseur({
        nom: nom.trim(),
        contact: contact || undefined,
        telephone: telephone || undefined,
        email: email || undefined,
        categories,
      });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(`Fournisseur « ${nom} » créé`);
      reset();
      onOpenChange(false);
      // Note : pour récupérer l'id du nouveau fournisseur, le parent doit
      // recharger sa liste. Le router.refresh() côté parent suffit.
      onCree?.("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau fournisseur</DialogTitle>
          <DialogDescription>
            Création rapide — tu pourras compléter la fiche dans Référentiels.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2 flex flex-col gap-1">
            <Label htmlFor="qa-nom">Nom</Label>
            <Input
              id="qa-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="qa-contact">Contact</Label>
            <Input
              id="qa-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="qa-tel">Téléphone</Label>
            <Input
              id="qa-tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <Label htmlFor="qa-email">Email</Label>
            <Input
              id="qa-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <Label>Catégories gérées</Label>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES_COMMANDE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[11px]",
                    categories.includes(c)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                  )}
                >
                  {LIBELLES_CATEGORIE[c]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button onClick={valider} disabled={pending}>
            {pending ? "Création…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
