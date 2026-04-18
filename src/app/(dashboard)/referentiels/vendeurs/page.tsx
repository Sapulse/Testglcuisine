import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EditeurVendeurs } from "./_Editeur";

export const dynamic = "force-dynamic";

export default async function VendeursPage() {
  const vendeurs = await prisma.vendeur.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
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
        <h1 className="text-xl font-semibold text-slate-900">Vendeurs</h1>
        <p className="text-xs text-slate-500">
          {vendeurs.length} vendeur{vendeurs.length > 1 ? "s" : ""}
        </p>
      </header>
      <EditeurVendeurs
        initial={vendeurs.map((v) => ({
          id: v.id,
          nom: v.nom,
          prenom: v.prenom,
          telephone: v.telephone,
          email: v.email,
        }))}
      />
    </div>
  );
}
