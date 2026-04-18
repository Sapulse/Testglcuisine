"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Error boundary du groupe (dashboard). Affiché si une page crash côté serveur. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-md border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-600" />
        <h2 className="mt-3 text-lg font-semibold text-red-900">
          Une erreur s'est produite
        </h2>
        <p className="mt-1 text-sm text-red-800">
          {error.message || "Erreur inattendue côté serveur."}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-red-700">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm" onClick={reset}>
            Réessayer
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/">Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
