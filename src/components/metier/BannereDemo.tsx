import { estDemoStatique } from "@/lib/mode";

/** Bandeau d'avertissement affiché en mode démo (GitHub Pages). */
export function BannereDemo() {
  if (!estDemoStatique()) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 print:hidden">
      <strong className="font-semibold">Démo en lecture seule</strong> · les
      créations / modifications sont désactivées. Pour utiliser l'app pour de
      vrai, déploie-la (voir&nbsp;
      <a
        href="https://github.com/Sapulse/Testglcuisine#-d%C3%A9marrage-local"
        className="underline"
      >
        README
      </a>
      ).
    </div>
  );
}
