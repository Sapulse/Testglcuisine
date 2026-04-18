# GL Cuisines — Pilotage chantier

Application web de **pilotage chantier** pour GL Cuisines (PME artisanale de cuisines et agencement à Brest). Remplace leur Google Sheets actuel par un outil orienté terrain : répondre en 3 secondes à « ce chantier est-il prêt à poser, qu'est-ce qui bloque, quelles commandes sont en retard ».

> Voir [`CLAUDE.md`](./CLAUDE.md) pour la philosophie produit et [`docs/cahier-des-charges.md`](./docs/cahier-des-charges.md) pour les specs détaillées.

---

## ✨ Fonctionnalités

| Module | Contenu |
|---|---|
| **Dashboard dirigeant** | 6 blocs live (alertes, cette semaine, à risque, commandes non envoyées, livraisons critiques, SAV ouverts) |
| **Projets** | Liste filtrée, fiche 6 onglets (Infos, Workflow 9 étapes, Commandes, Planning, SAV, Alertes), création RHF+Zod, workflow éditable inline |
| **Commandes** | 7 catégories, CRUD sur fiche projet, vue transverse multi-projets avec 6 filtres |
| **Planning** | Vue horizontale S01–S52, semaine courante surlignée, cartes colorées par statut |
| **SAV** | Tickets rattachés projet, journal chronologique, 5 statuts, flag bloquant |
| **Référentiels** | Fournisseurs, Poseurs, Vendeurs — CRUD éditables inline |
| **Fiche PDF** | Export A4 imprimable d'une fiche chantier complète |

### Règles métier automatiques

- **Statut global chantier** (7 cas, premier match gagne) : Terminé · À facturer · Bloqué · À risque · Vigilance · Prêt · En cours
- **7 règles d'alertes** (A1–A7) calculées à la volée depuis la semaine de pose, l'état des étapes et des commandes

---

## 🏗️ Stack

- **Next.js 15+** (App Router) + **TypeScript strict**
- **Prisma 6** + **PostgreSQL**
- **Tailwind CSS** + **shadcn/ui** (thème slate)
- **react-hook-form** + **Zod**
- **Vitest** (47 tests sur la logique métier)

---

## ☁️ Prévisualiser sur GitHub (Codespaces)

Pour essayer l'app sans rien installer localement :

1. Sur GitHub, ouvre le repo → bouton vert **« Code »** → onglet **Codespaces** → **« Create codespace on main »**.
2. Attends ~2 minutes (le container installe Node + Postgres + les dépendances + lance le seed).
3. Une notification VS Code propose d'**ouvrir l'app sur le port 3000** → clique dessus.
4. L'app s'ouvre dans un nouvel onglet avec les 3 projets de démo chargés.

> Codespaces est gratuit jusqu'à 60h/mois sur un compte GitHub perso. Tout est déjà configuré dans `.devcontainer/` (Node 22 + Postgres 16 + seed auto).

---

## 🚀 Démarrage local

```bash
# 1. Cloner puis installer
npm install

# 2. Configurer la base de données
cp .env.example .env
# puis renseigner DATABASE_URL (Postgres local ou hébergé)

# 3. Créer le schéma + charger les données de démo
npm run db:generate
npm run db:push
npm run db:seed

# 4. Lancer le serveur de développement
npm run dev
```

L'application tourne sur [http://localhost:3000](http://localhost:3000).

Le seed crée 3 projets scénarisés (Durand à risque, Tanguy vigilance + SAV bloquant, Kerleau cette semaine), 5 fournisseurs, 2 poseurs, 1 vendeur.

---

## 📂 Arborescence

```
src/
  app/
    (dashboard)/
      page.tsx                    # dashboard dirigeant
      layout.tsx                  # sidebar + contenu
      projets/
        page.tsx                  # liste filtrée
        nouveau/                  # formulaire création
        [id]/
          page.tsx                # fiche 6 onglets
          fiche/                  # version imprimable / PDF
      commandes/                  # vue transverse
      planning/                   # S01–S52
      sav/                        # tickets + journal
      referentiels/
        fournisseurs/
        poseurs/
        vendeurs/
  components/
    ui/                           # primitives shadcn (Button, Input, Tabs…)
    metier/                       # Sidebar, BadgeStatut, tableaux CRUD…
  lib/
    metier/                       # logique pure : semaines, statuts, alertes
    queries/                      # lecture DB (projets, commandes, sav, dashboard)
    validations/                  # schemas Zod
    prisma.ts                     # client Prisma singleton
prisma/
  schema.prisma                   # 10 tables, 9 enums
  seed.ts                         # données de démo
docs/
  cahier-des-charges.md
  deploiement.md
```

---

## 🧪 Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur Next.js en dev (HMR) |
| `npm run build` | Build de production |
| `npm run start` | Lance le build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (47 tests métier) |
| `npm run test:watch` | Vitest en mode watch |
| `npm run db:push` | Pousse le schéma Prisma en base |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run db:seed` | Charge les données de démo |

---

## 🧠 Règles de code

- **TypeScript strict** — zéro `any`.
- **Entités métier en français** (`Projet`, `Commande`), **code technique en anglais** (`getProjetById`, `calculerStatutGlobal`).
- **Server components par défaut**, `"use client"` uniquement où nécessaire.
- **Zod** pour toute validation (formulaires + Server Actions).
- Une fonction = une responsabilité (**< 50 lignes**).
- Commentaires métier en français.

---

## 🧾 Export PDF

Sur une fiche projet, clique sur **« Fiche PDF »** → ouvre une version A4 optimisée impression. Utilise `Ctrl+P` / `Cmd+P` puis **« Enregistrer au format PDF »** dans Chrome ou Safari.

---

## 📱 Responsive

- **Desktop / tablette ≥ 768 px** : sidebar permanente à gauche.
- **Mobile < 768 px** : barre de navigation en haut avec menu burger, contenus en colonne unique.

---

## 🚢 Déploiement

Voir [`docs/deploiement.md`](./docs/deploiement.md) — prêt pour **Vercel + Neon** (ou Railway, Render, Fly.io).

---

## 🗺️ Historique

| Sprint | Contenu |
|---|---|
| 0 | Setup Next.js + Prisma + shadcn |
| 1 | Schéma + seed + logique métier + 47 tests + dashboard mock |
| 2 | Module Projets (liste, fiche 6 onglets, création, workflow inline) |
| 3 | Module Commandes (CRUD fiche + vue transverse) |
| 4 | Planning S01–S52 + assignations + référentiels CRUD |
| 5 | SAV complet avec journal + dashboard sur vraies données |
| 6 | Responsive tablette + export PDF + docs finales |

---

## 📄 Licence

Propriétaire — GL Cuisines.
