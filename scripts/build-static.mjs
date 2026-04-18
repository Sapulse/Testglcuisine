#!/usr/bin/env node
/**
 * Build statique pour GitHub Pages.
 * Remplace temporairement chaque `_actions.ts` par son stub (sans `"use server"`)
 * puis lance `next build`, et restaure les originaux en sortie (ou en cas d'erreur).
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, renameSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const FICHIERS = [
  "src/app/(dashboard)/projets/_actions.ts",
  "src/app/(dashboard)/commandes/_actions.ts",
  "src/app/(dashboard)/sav/_actions.ts",
  "src/app/(dashboard)/planning/_actions.ts",
  "src/app/(dashboard)/referentiels/_actions.ts",
].map((rel) => ({
  reel: resolve(ROOT, rel),
  stub: resolve(ROOT, rel.replace(/\.ts$/, ".stub.ts")),
  backup: resolve(ROOT, rel + ".backup"),
}));

function swap() {
  for (const { reel, stub, backup } of FICHIERS) {
    if (!existsSync(stub)) {
      throw new Error(`Stub manquant : ${stub}`);
    }
    renameSync(reel, backup);
    cpSync(stub, reel);
  }
}

function restore() {
  for (const { reel, backup } of FICHIERS) {
    if (existsSync(backup)) {
      if (existsSync(reel)) unlinkSync(reel);
      renameSync(backup, reel);
    }
  }
}

process.on("SIGINT", () => {
  restore();
  process.exit(1);
});

try {
  console.log("↻ Swap des Server Actions vers stubs…");
  swap();

  console.log("▶ next build (static)…");
  const res = spawnSync("npx", ["next", "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_STATIC: "1",
      NEXT_PUBLIC_STATIC_DEMO: "1",
    },
  });

  if (res.status !== 0) {
    console.error("✗ next build a échoué");
    process.exit(res.status ?? 1);
  }
  console.log("✓ Build statique OK → dossier `out/`");
} finally {
  restore();
  console.log("↻ Restauration des Server Actions originaux");
}
