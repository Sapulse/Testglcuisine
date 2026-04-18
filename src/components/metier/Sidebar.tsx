"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ShoppingCart,
  Wrench,
  Library,
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
  { label: "Référentiels", href: "/referentiels", icone: Library },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="text-sm font-semibold text-slate-900">GL Cuisines</div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Pilotage chantier
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {ENTREES.map(({ label, href, icone: Icone }) => {
          const actif =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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
      <div className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500">
        v0.1 · Sprint 1
      </div>
    </aside>
  );
}
