"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  savSchema,
  STATUTS_SAV,
  LIBELLES_STATUT_SAV,
  type SavInput,
} from "@/lib/validations/sav";
import {
  CATEGORIES_COMMANDE,
  LIBELLES_CATEGORIE,
} from "@/lib/validations/commande";
import { creerSav } from "../_actions";

interface Option {
  id: string;
  label: string;
}

export function FormulaireSav({
  projets,
  fournisseurs,
  projetIdInitial,
}: {
  projets: Option[];
  fournisseurs: Option[];
  projetIdInitial?: string;
}) {
  const router = useRouter();
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SavInput>({
    resolver: zodResolver(savSchema),
    defaultValues: {
      projetId: projetIdInitial ?? "",
      fournisseurId: "",
      typeProbleme: "",
      statut: "ouvert",
      bloquant: false,
      commentaire: "",
    },
  });

  async function onSubmit(data: SavInput) {
    setErreurServeur(null);
    const res = await creerSav(data);
    if (!res.ok) {
      setErreurServeur(res.message);
      return;
    }
    if (res.data) router.push(`/sav/${res.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="projetId">Projet</Label>
          <select
            id="projetId"
            {...register("projetId")}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
          >
            <option value="">— Choisir —</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {errors.projetId && (
            <span className="text-xs text-red-600">{errors.projetId.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="fournisseurId">Fournisseur (optionnel)</Label>
          <select
            id="fournisseurId"
            {...register("fournisseurId")}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
          >
            <option value="">—</option>
            {fournisseurs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="categorie">Catégorie concernée (optionnel)</Label>
          <select
            id="categorie"
            {...register("categorie")}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
          >
            <option value="">—</option>
            {CATEGORIES_COMMANDE.map((c) => (
              <option key={c} value={c}>
                {LIBELLES_CATEGORIE[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="statut">Statut</Label>
          <select
            id="statut"
            {...register("statut")}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
          >
            {STATUTS_SAV.map((s) => (
              <option key={s} value={s}>
                {LIBELLES_STATUT_SAV[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="typeProbleme">Type de problème</Label>
        <Input id="typeProbleme" {...register("typeProbleme")} placeholder="Ex: Caissons hauts manquants" />
        {errors.typeProbleme && (
          <span className="text-xs text-red-600">{errors.typeProbleme.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="commentaire">Commentaire</Label>
        <textarea
          id="commentaire"
          {...register("commentaire")}
          rows={3}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("bloquant")} />
        <span>Bloquant (impacte la pose)</span>
      </label>

      {erreurServeur && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreurServeur}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/sav")}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer le ticket"}
        </Button>
      </div>
    </form>
  );
}
