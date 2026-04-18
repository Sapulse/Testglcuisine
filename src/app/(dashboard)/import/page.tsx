import { ImportClient } from "./_ImportClient";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Import Excel</h1>
        <p className="text-xs text-slate-500">
          Charge ton Google Sheets / Excel existant pour migrer plusieurs projets d'un coup.
        </p>
      </header>
      <ImportClient />
    </div>
  );
}
