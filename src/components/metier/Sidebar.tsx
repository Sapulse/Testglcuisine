"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ShoppingCart,
  Wrench,
  Library,
  Menu,
  X,
  BarChart3,
  HardHat,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Entree {
  label: string;
  href: string;
  icone: React.ComponentType<{ className?: string }>;
}

const ENTREES: Entree[] = [
  { label: "Dashboard", href: "/", icone: LayoutDashboard },
  { label: "Projets", href: "/projets", icone: FolderKanban },
  { label: "Planning", href: "/planning", icone: CalendarDays },
  { label: "Commandes", href: "/commandes", icone: ShoppingCart },
  { label: "SAV", href: "/sav", icone: Wrench },
  { label: "Analytics", href: "/analytics", icone: BarChart3 },
  { label: "Vue poseur", href: "/poseur", icone: HardHat },
  { label: "Import Excel", href: "/import", icone: Upload },
  { label: "Référentiels", href: "/referentiels", icone: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const [ouverte, setOuverte] = useState(false);

  // Ferme automatiquement à chaque navigation mobile.
  function close() {
    setOuverte(false);
  }

  return (
    <>
      {/* Barre du haut mobile/tablette < md */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 md:hidden print:hidden">
        <div>
          <div className="text-sm font-semibold text-slate-900">GL Cuisines</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Pilotage chantier
          </div>
        </div>
        <button
          onClick={() => setOuverte((v) => !v)}
          className="rounded-md border border-slate-200 bg-white p-2 text-slate-700"
          aria-label="Ouvrir le menu"
        >
          {ouverte ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-slate-200 bg-slate-50 print:hidden",
          "md:w-56 md:min-h-screen",
          // Mobile : drawer conditionnel
          ouverte ? "flex" : "hidden",
          "md:flex",
        )}
      >
        <div className="hidden border-b border-slate-200 px-4 py-4 md:block">
          <div className="text-sm font-semibold text-slate-900">GL Cuisines</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            Pilotage chantier
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {ENTREES.map(({ label, href, icone: Icone }) => {
            const actif =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  actif
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-200",
                )}
              >
                <Icone className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 md:block">
          v1.0 · GL Cuisines
        </div>
      </aside>
    </>
  );
}
