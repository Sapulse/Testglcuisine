import Link from "next/link";
import { Building2, HardHat, UserRound, Users } from "lucide-react";
import { comptesReferentiels } from "@/lib/queries/referentiels";
export const dynamic = "force-dynamic";


export default async function ReferentielsPage() {
  const { fournisseurs, poseurs, vendeurs, clients } = await comptesReferentiels();

  const entrees = [
    { href: "/referentiels/clients", titre: "Clients", nb: clients, icone: Users },
    {
      href: "/referentiels/fournisseurs",
      titre: "Fournisseurs",
      nb: fournisseurs,
      icone: Building2,
    },
    { href: "/referentiels/poseurs", titre: "Poseurs", nb: poseurs, icone: HardHat },
    { href: "/referentiels/vendeurs", titre: "Vendeurs", nb: vendeurs, icone: UserRound },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Référentiels</h1>
        <p className="text-xs text-slate-500">
          Gestion des fiches fournisseurs, poseurs et vendeurs.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {entrees.map(({ href, titre, nb, icone: Icone }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Icone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{titre}</div>
              <div className="text-xs text-slate-500">
                {nb} fiche{nb > 1 ? "s" : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
