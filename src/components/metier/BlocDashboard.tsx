import { cn } from "@/lib/utils";

interface BlocDashboardProps {
  titre: string;
  compteur: number;
  accent?: "rouge" | "orange" | "jaune" | "bleu" | "neutre";
  children: React.ReactNode;
}

const ACCENTS: Record<NonNullable<BlocDashboardProps["accent"]>, string> = {
  rouge: "border-l-red-600",
  orange: "border-l-orange-500",
  jaune: "border-l-yellow-500",
  bleu: "border-l-blue-600",
  neutre: "border-l-slate-300",
};

/** Bloc dense du dashboard : titre + compteur + liste. */
export function BlocDashboard({
  titre,
  compteur,
  accent = "neutre",
  children,
}: BlocDashboardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-md border border-slate-200 border-l-4 bg-white",
        ACCENTS[accent],
      )}
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          {titre}
        </h2>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
          {compteur}
        </span>
      </header>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

/** Ligne cliquable dans un bloc. */
export function LigneBloc({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const contenu = (
    <div className="flex items-center justify-between px-3 py-2 text-sm text-slate-800 hover:bg-slate-50">
      {children}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {contenu}
      </a>
    );
  }
  return contenu;
}
