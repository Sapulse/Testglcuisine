import { Sidebar } from "@/components/metier/Sidebar";
import { BannereDemo } from "@/components/metier/BannereDemo";
import { RechercheGlobale } from "@/components/metier/RechercheGlobale";
import { chargerIndexRecherche } from "@/lib/queries/recherche";

export const dynamic = "force-dynamic";

/** Layout : sidebar à gauche (desktop) / barre du haut (mobile). */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const itemsRecherche = await chargerIndexRecherche();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-auto bg-white">
        <BannereDemo />
        <div className="flex items-center justify-end border-b border-slate-100 px-3 py-2 print:hidden">
          <RechercheGlobale items={itemsRecherche} />
        </div>
        {children}
      </main>
    </div>
  );
}
