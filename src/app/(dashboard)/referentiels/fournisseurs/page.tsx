import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EditeurFournisseurs } from "./_Editeur";

export const dynamic = "force-dynamic";

export default async function FournisseursPage() {
  const fournisseurs = await prisma.fournisseur.findMany({
    orderBy: [{ nom: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/referentiels"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Référentiels
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Fournisseurs</h1>
        <p className="text-xs text-slate-500">
          {fournisseurs.length} fiche{fournisseurs.length > 1 ? "s" : ""}
        </p>
      </header>
      <EditeurFournisseurs
        initial={fournisseurs.map((f) => ({
          id: f.id,
          nom: f.nom,
          contact: f.contact,
          telephone: f.telephone,
          email: f.email,
          categories: f.categories,
        }))}
      />
    </div>
  );
}
