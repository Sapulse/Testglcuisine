/** Skeleton affiché pendant le chargement d'une page serveur. */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="h-20 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
        <div className="h-20 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
        <div className="h-20 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
      </div>
      <div className="mt-2 h-64 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
    </div>
  );
}
