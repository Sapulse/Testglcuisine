"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  projetSchema,
  TYPES_PROJET,
  LIBELLES_TYPE_PROJET,
  type ProjetInput,
} from "@/lib/validations/projet";
import { creerProjet } from "@/app/(dashboard)/projets/_actions";
import { useState } from "react";

interface Option {
  id: string;
  label: string;
}

interface FormulaireProjetProps {
  clients: Option[];
  vendeurs: Option[];
  anneeCourante: number;
  semaineCourante: string;
}

/** Champ horizontal label + contenu + erreur. */
function Champ({
  id,
  label,
  erreur,
  children,
}: {
  id: string;
  label: string;
  erreur?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </div>
  );
}

export function FormulaireProjet({
  clients,
  vendeurs,
  anneeCourante,
  semaineCourante,
}: FormulaireProjetProps) {
  const router = useRouter();
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjetInput>({
    resolver: zodResolver(projetSchema),
    defaultValues: {
      reference: "",
      typeProjet: "cuisine",
      adresseChantier: "",
      codePostalChantier: "",
      villeChantier: "",
      semainePose: semaineCourante,
      anneePose: anneeCourante,
      estRenovation: false,
      vendeurId: "",
      client: { mode: "existant", clientId: "" },
    },
  });

  const modeClient = watch("client.mode");

  async function onSubmit(data: ProjetInput) {
    setErreurServeur(null);
    const res = await creerProjet(data);
    if (!res.ok) {
      setErreurServeur(res.message);
      return;
    }
    if (res.data) router.push(`/projets/${res.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Champ id="reference" label="Référence" erreur={errors.reference?.message}>
          <Input id="reference" placeholder="2026-042" {...register("reference")} />
        </Champ>

        <Champ id="typeProjet" label="Type de projet" erreur={errors.typeProjet?.message}>
          <select
            id="typeProjet"
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
            {...register("typeProjet")}
          >
            {TYPES_PROJET.map((t) => (
              <option key={t} value={t}>
                {LIBELLES_TYPE_PROJET[t]}
              </option>
            ))}
          </select>
        </Champ>

        <Champ id="vendeurId" label="Vendeur" erreur={errors.vendeurId?.message}>
          <select
            id="vendeurId"
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
            {...register("vendeurId")}
          >
            <option value="">—</option>
            {vendeurs.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </Champ>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Champ id="adresseChantier" label="Adresse chantier" erreur={errors.adresseChantier?.message}>
          <Input id="adresseChantier" {...register("adresseChantier")} />
        </Champ>
        <Champ id="codePostalChantier" label="Code postal" erreur={errors.codePostalChantier?.message}>
          <Input id="codePostalChantier" inputMode="numeric" {...register("codePostalChantier")} />
        </Champ>
        <Champ id="villeChantier" label="Ville" erreur={errors.villeChantier?.message}>
          <Input id="villeChantier" {...register("villeChantier")} />
        </Champ>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Champ id="semainePose" label="Semaine de pose" erreur={errors.semainePose?.message}>
          <Input id="semainePose" placeholder="S16" {...register("semainePose")} />
        </Champ>
        <Champ id="anneePose" label="Année pose" erreur={errors.anneePose?.message}>
          <Input
            id="anneePose"
            type="number"
            {...register("anneePose", { valueAsNumber: true })}
          />
        </Champ>
        <Champ id="montantHT" label="Montant HT (€)" erreur={errors.montantHT?.message}>
          <Input id="montantHT" type="number" step="0.01" {...register("montantHT")} />
        </Champ>
        <Champ id="montantTTC" label="Montant TTC (€)" erreur={errors.montantTTC?.message}>
          <Input id="montantTTC" type="number" step="0.01" {...register("montantTTC")} />
        </Champ>
      </section>

      <section className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("estRenovation")} />
          <span>Rénovation (dépose / prépa élec)</span>
        </label>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Label htmlFor="dateSignature">Date signature</Label>
          <Input id="dateSignature" type="date" className="w-auto" {...register("dateSignature")} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-md border border-slate-200 p-3">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Client</h2>
          <Controller
            name="client.mode"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => field.onChange("existant")}
                  className={
                    "rounded px-2 py-1 " +
                    (field.value === "existant"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700")
                  }
                >
                  Existant
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange("nouveau")}
                  className={
                    "rounded px-2 py-1 " +
                    (field.value === "nouveau"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700")
                  }
                >
                  Nouveau
                </button>
              </div>
            )}
          />
        </header>

        {modeClient === "existant" ? (
          <Champ id="clientId" label="Client" erreur={errors.client?.message as string | undefined}>
            <select
              id="clientId"
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
              {...register("client.clientId")}
            >
              <option value="">— Choisir —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Champ>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Champ id="nom" label="Nom" erreur={(errors.client as { nom?: { message?: string } })?.nom?.message}>
              <Input id="nom" {...register("client.nom")} />
            </Champ>
            <Champ id="prenom" label="Prénom" erreur={(errors.client as { prenom?: { message?: string } })?.prenom?.message}>
              <Input id="prenom" {...register("client.prenom")} />
            </Champ>
            <Champ id="telephone" label="Téléphone" erreur={(errors.client as { telephone?: { message?: string } })?.telephone?.message}>
              <Input id="telephone" {...register("client.telephone")} />
            </Champ>
            <Champ id="email" label="Email" erreur={(errors.client as { email?: { message?: string } })?.email?.message}>
              <Input id="email" type="email" {...register("client.email")} />
            </Champ>
            <Champ id="adresse" label="Adresse" erreur={(errors.client as { adresse?: { message?: string } })?.adresse?.message}>
              <Input id="adresse" {...register("client.adresse")} />
            </Champ>
            <Champ id="codePostal" label="CP" erreur={(errors.client as { codePostal?: { message?: string } })?.codePostal?.message}>
              <Input id="codePostal" {...register("client.codePostal")} />
            </Champ>
            <Champ id="ville" label="Ville" erreur={(errors.client as { ville?: { message?: string } })?.ville?.message}>
              <Input id="ville" {...register("client.ville")} />
            </Champ>
          </div>
        )}
      </section>

      {erreurServeur && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreurServeur}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/projets")}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer le projet"}
        </Button>
      </div>
    </form>
  );
}
