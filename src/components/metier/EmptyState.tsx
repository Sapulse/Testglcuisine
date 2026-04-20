import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  icone?: React.ComponentType<{ className?: string }>;
  titre: string;
  description?: string;
  cta?: {
    href?: string;
    label: string;
    onClick?: () => void;
  };
  className?: string;
}

/** État vide réutilisable avec icône + CTA optionnel. */
export function EmptyState({ icone: Icone, titre, description, cta, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center",
        className,
      )}
    >
      {Icone && <Icone className="h-8 w-8 text-slate-400" />}
      <h3 className="text-sm font-semibold text-slate-700">{titre}</h3>
      {description && (
        <p className="max-w-md text-xs text-slate-500">{description}</p>
      )}
      {cta && (
        cta.href ? (
          <Link
            href={cta.href}
            className="mt-1 inline-flex h-8 items-center rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
          >
            {cta.label}
          </Link>
        ) : (
          <button
            onClick={cta.onClick}
            className="mt-1 inline-flex h-8 items-center rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
          >
            {cta.label}
          </button>
        )
      )}
    </div>
  );
}
