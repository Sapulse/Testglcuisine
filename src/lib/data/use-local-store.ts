"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, type SnapshotData } from "./local-store";
import { estDemoStatique } from "@/lib/mode";

/**
 * Hook qui retourne les données du LocalStore, réactivement.
 * En mode dynamique (DB), retourne null (les composants utiliseront alors
 * les props server passées).
 */
export function useLocalStoreData(): SnapshotData | null {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!estDemoStatique()) return null;
  return data;
}
