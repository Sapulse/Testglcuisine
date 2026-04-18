#!/usr/bin/env node
/**
 * Build statique pour GitHub Pages.
 *
 * 1. Remplace chaque `_actions.ts` (Server Actions) par son stub lecture seule.
 * 2. Remplace `export const dynamic = "force-dynamic";` par `"force-static";`
 *    dans toutes les pages (output: export interdit les pages dynamiques).
 * 3. Lance `next build` avec NEXT_STATIC=1.
 * 4. Restaure tous les fichiers modifiés (même en cas d'erreur / CTRL+C).
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const STUB_FILES = [
  "src/app/(dashboard)/projets/_actions.ts",
  "src/app/(dashboard)/commandes/_actions.ts",
  "src/app/(dashboard)/sav/_actions.ts",
  "src/app/(dashboard)/planning/_actions.ts",
  "src/app/(dashboard)/referentiels/_actions.ts",
  "src/app/(dashboard)/import/_actions.ts",
].map((rel) => ({
  reel: resolve(ROOT, rel),
  stub: resolve(ROOT, rel.replace(/\.ts$/, ".stub.ts")),
  backup: resolve(ROOT, rel + ".backup"),
}));

// Pages + layouts à muter : leurs `export const dynamic = "force-dynamic";` gênent le static export.
const PAGES_A_MUTER = [
  ...globSync("src/app/(dashboard)/**/page.tsx", { cwd: ROOT }),
  ...globSync("src/app/(dashboard)/**/layout.tsx", { cwd: ROOT }),
].map((rel) => resolve(ROOT, rel));

const DYNAMIC_FROM = 'export const dynamic = "force-dynamic";';
const DYNAMIC_TO = 'export const dynamic = "force-static";';

const contenusOriginaux = new Map(); // path -> content original

function swapStubs() {
  for (const { reel, stub, backup } of STUB_FILES) {
    if (!existsSync(stub)) throw new Error(`Stub manquant : ${stub}`);
    renameSync(reel, backup);
    cpSync(stub, reel);
  }
}

function swapDynamicDirectives() {
  for (const page of PAGES_A_MUTER) {
    const contenu = readFileSync(page, "utf8");
    if (contenu.includes(DYNAMIC_FROM)) {
      contenusOriginaux.set(page, contenu);
      writeFileSync(page, contenu.replace(DYNAMIC_FROM, DYNAMIC_TO));
    }
  }
}

function restore() {
  for (const { reel, backup } of STUB_FILES) {
    if (existsSync(backup)) {
      if (existsSync(reel)) unlinkSync(reel);
      renameSync(backup, reel);
    }
  }
  for (const [page, contenu] of contenusOriginaux) {
    writeFileSync(page, contenu);
  }
  contenusOriginaux.clear();
}

process.on("SIGINT", () => {
  restore();
  process.exit(1);
});

try {
  console.log("↻ Swap des Server Actions vers stubs…");
  swapStubs();

  console.log("↻ Swap force-dynamic → force-static…");
  swapDynamicDirectives();

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
  console.log("↻ Restauration des fichiers originaux");
}
