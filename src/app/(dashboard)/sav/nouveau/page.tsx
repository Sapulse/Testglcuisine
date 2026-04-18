import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FormulaireSav } from "./_Formulaire";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ projet?: string }>;
}

export default async function NouveauSavPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [projets, fournisseurs] = await Promise.all([
    prisma.projet.findMany({
      include: { client: true },
      orderBy: [{ anneePose: "desc" }, { reference: "asc" }],
    }),
    prisma.fournisseur.findMany({ orderBy: [{ nom: "asc" }] }),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/sav"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Retour SAV
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Nouveau ticket SAV</h1>
      </header>
      <FormulaireSav
        projets={projets.map((p) => ({
          id: p.id,
          label: `${p.reference} · ${p.client.prenom} ${p.client.nom}`,
        }))}
        fournisseurs={fournisseurs.map((f) => ({ id: f.id, label: f.nom }))}
        projetIdInitial={sp.projet}
      />
    </div>
  );
}
