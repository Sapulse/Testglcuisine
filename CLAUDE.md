# CLAUDE.md — Mémoire projet GL Cuisines

Ce fichier sert de mémoire persistante pour tous les échanges sur ce repo. À lire en premier à chaque session.

---

## 🎯 Le projet en une phrase

Un **outil de pilotage chantier** pour GL Cuisines (PME artisanale de cuisines à Brest, 4 personnes) qui remplace leur Google Sheets actuel. Permettre au dirigeant de répondre en 3 secondes à :
> « Ce chantier est-il prêt à poser ? Qu'est-ce qui bloque ? Quelles commandes sont en retard ? »

Ce n'est **pas un ERP**. C'est un outil simple, terrain, orienté décision.

---

## 🧭 Philosophie (règle d'or)

**CLARTÉ TERRAIN > RICHESSE FONCTIONNELLE**

- Pas d'esthétique SaaS générique.
- Vues denses et lisibles, pas de cartes énormes avec du padding.
- Vocabulaire métier **français** partout dans l'UI : « chantier », « pose », « poseur », « reliquat », « semaine S23 ».
- Code couleurs forts et cohérents (statuts chantier et alertes).
- Tout ce qui peut être calculé automatiquement l'est (statut global, alertes).

---

## 🏗️ Stack technique

- **Next.js 15** (App Router) + **TypeScript strict**
- **Prisma** + **PostgreSQL**
- **Tailwind** + **shadcn/ui** (thème neutral/slate)
- **react-hook-form** + **Zod** pour les formulaires
- **Vitest** pour les tests unitaires métier

---

## 📦 Les 6 modules à livrer

1. **Projets** — Liste + fiche détail 6 onglets (Infos, Workflow, Commandes, Planning, SAV, Alertes) + CRUD client.
2. **Workflow** — 9 étapes par projet, chacune avec statut `non_commence | en_cours | termine | bloque`.
3. **Commandes** — 7 catégories, statut commande + statut livraison + flag essentielle, vue projet et vue transverse.
4. **Planning** — Vue horizontale S01–S52 avec chantiers placés sur leur semaine de pose.
5. **SAV** — Tickets rattachés projet, journal chronologique des actions.
6. **Dashboard dirigeant** — 6 blocs (alertes, cette semaine, à risque, commandes non envoyées, livraisons critiques, SAV ouverts).

Plus des **référentiels simples** : Fournisseurs, Poseurs, Vendeurs, Types de projet.

---

## 📐 Règles métier clés

### Statut global chantier (premier match gagne)

| Condition | Statut | Couleur |
|---|---|---|
| Toutes étapes `termine` | **Terminé** | gris `#6b7280` |
| Pose `termine` + facturation non faite | **À facturer** | violet `#9333ea` |
| ≥1 étape `bloque` | **Bloqué** | rouge foncé `#991b1b` |
| Pose < 14j ET cmd essentielle `non_envoye` ou `retard` | **À risque** | rouge `#dc2626` |
| Pose < 30j ET catégorie essentielle `reliquat` | **Vigilance** | orange `#ea580c` |
| Toutes catégories essentielles `livre` ET pose pas faite | **Prêt** | vert `#16a34a` |
| Sinon | **En cours** | bleu `#2563eb` |

### 7 règles d'alertes (calculées à la volée)

- **A1** 🔴 Pose < 7j ET cmd essentielle `non_envoye`
- **A2** 🔴 Pose < 14j ET livraison essentielle manquante
- **A3** 🔴 Livraison prévue cette semaine et statut `retard`
- **A4** 🟠 Reliquat sur catégorie essentielle
- **A5** 🟠 SAV ouvert bloquant depuis > 15 jours
- **A6** 🟠 Pose < 30j ET plans techniques `non_commence`
- **A7** 🟡 Pose < 7j ET prépa élec `non_commence` (rénovation)

### 9 étapes du workflow

1. Bon de commande
2. Plans techniques
3. Plans de pose
4. Commandes passées
5. Livraisons reçues
6. Dépose (si rénovation)
7. Prépa électrique
8. Pose
9. Facturation

### 7 catégories de commandes

Électroménagers, Meubles, Accessoires, Plan de travail, Crédence, Fond de hotte, Sanitaires.

---

## 🗄️ Modèle de données (Prisma)

Tables : `Client`, `Projet`, `EtapeProjet`, `Commande`, `Fournisseur`, `Poseur`, `Vendeur`, `AssignationPoseur`, `SAV`, `SAVJournal`.

- `Projet` → 1 `Client`, N `Commande`, N `EtapeProjet`, N `SAV`, N `AssignationPoseur`
- `Commande` → 1 `Projet` + 1 `Fournisseur`
- `SAV` → 1 `Projet` + éventuellement 1 `Fournisseur`

Enums pour tous les statuts. Timestamps `createdAt`/`updatedAt` partout. Noms de tables en **PascalCase français**.

---

## ⚙️ Règles de code (strictes)

- **TypeScript strict**, **pas de `any`**.
- Entités métier en **français** (`Projet`, `Commande`, `Poseur`), code technique en **anglais** (`getProjetById`).
- **Server components par défaut**, `"use client"` uniquement si nécessaire.
- **Zod** pour toute validation d'entrée.
- Une fonction = une responsabilité (**< 50 lignes**).
- Commentaires métier en français.

### Arborescence imposée

```
src/
  app/(dashboard)/    # pages applicatives
  components/ui/      # primitives shadcn
  components/metier/  # composants métier réutilisables
  lib/metier/         # logique pure (statuts, alertes, semaines)
  types/              # types partagés
```

---

## 📋 Déroulé des sprints

Après CHAQUE sprint je dois :
1. Vérifier que `npm run build` passe.
2. Proposer un message de commit clair.
3. **M'ARRÊTER** et attendre « ok sprint suivant ».

| Sprint | Contenu |
|---|---|
| **0** | Setup Next.js + Prisma + shadcn + arborescence |
| **1** | Schéma Prisma + seed + lib/metier (semaines, statuts, alertes) + tests Vitest + layout + dashboard mock |
| **2** | Module Projets (liste, fiche 6 onglets, création, workflow inline) |
| **3** | Module Commandes (onglet fiche + vue transverse) |
| **4** | Planning S01–S52 + référentiels |
| **5** | SAV + dashboard sur vraies données |
| **6** | Responsive tablette + export PDF + docs finales |

---

## ❓ Quand demander l'avis du dirigeant

**UNIQUEMENT pour** :
- Arbitrages métier ambigus.
- Données réelles manquantes (noms fournisseurs/poseurs réels).
- Actions destructrices (suppressions massives, reset DB, force push).

**JAMAIS pour** :
- Choix techniques standards (librairies, patterns, structure de composants).

---

## 🌿 Git

- Branche de développement : `claude/gl-cuisines-project-app-EVpTi`
- Push toujours avec `git push -u origin <branch>`.
- Ne **pas** créer de PR sans demande explicite.
- Commits en français, style conventionnel : `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

---

## 📅 Contexte temporel

On est en **avril 2026**. La fonction `semaineActuelle()` doit renvoyer la semaine ISO correspondante.
