# GL Cuisines — Pilotage chantier

Application web de pilotage chantier pour **GL Cuisines** (PME artisanale de cuisines et agencement à Brest).

> Répondre en 3 secondes à : « Ce chantier est-il prêt à poser ? Qu'est-ce qui bloque ? Quelles commandes sont en retard ? »

Voir [`CLAUDE.md`](./CLAUDE.md) pour la philosophie projet et [`docs/cahier-des-charges.md`](./docs/cahier-des-charges.md) pour les specs détaillées.

---

## 🏗️ Stack

- **Next.js 15** (App Router) + **TypeScript strict**
- **Prisma** + **PostgreSQL**
- **Tailwind CSS** + **shadcn/ui** (thème slate)
- **react-hook-form** + **Zod**
- **Vitest**

---

## 🚀 Démarrage local

```bash
# 1. installer les dépendances
npm install

# 2. configurer la base
cp .env.example .env
# puis renseigner DATABASE_URL

# 3. générer le client Prisma + pousser le schéma
npm run db:generate
npm run db:push

# 4. lancer le dev server
npm run dev
```

L'application tourne sur [http://localhost:3000](http://localhost:3000).

---

## 📂 Arborescence

```
src/
  app/(dashboard)/    # pages applicatives
  app/page.tsx        # accueil public
  app/layout.tsx      # layout racine
  components/ui/      # primitives shadcn
  components/metier/  # composants métier réutilisables
  lib/metier/         # logique pure : semaines, statuts, alertes
  lib/prisma.ts       # client Prisma singleton
  types/              # types partagés
prisma/
  schema.prisma       # schéma base de données
docs/
  cahier-des-charges.md
```

---

## 🧪 Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Build production |
| `npm run start` | Lance le build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (logique métier) |
| `npm run db:push` | Pousse le schéma Prisma en base |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run db:seed` | Seed de données de démo |

---

## 📋 État du projet

Développement par **sprints**. Sprint courant : voir dernier commit.

- [x] Sprint 0 — Setup
- [ ] Sprint 1 — Fondations métier (schéma + logique)
- [ ] Sprint 2 — Module Projets
- [ ] Sprint 3 — Module Commandes
- [ ] Sprint 4 — Planning + Référentiels
- [ ] Sprint 5 — SAV + Dashboard réel
- [ ] Sprint 6 — Finition (responsive, PDF, docs)
