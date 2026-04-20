import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listerClientsRef } from "@/lib/queries/referentiels";
import { EditeurClients } from "./_Editeur";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listerClientsRef();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <Link
          href="/referentiels"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" /> Référentiels
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Clients</h1>
        <p className="text-xs text-slate-500">
          {clients.length} client{clients.length > 1 ? "s" : ""}
        </p>
      </header>
      <EditeurClients
        initial={clients.map((c) => ({
          id: c.id,
          nom: c.nom,
          prenom: c.prenom,
          telephone: c.telephone,
          email: c.email,
          adresse: c.adresse,
          codePostal: c.codePostal,
          ville: c.ville,
          nbProjets: c.nbProjets,
        }))}
      />
    </div>
  );
}
