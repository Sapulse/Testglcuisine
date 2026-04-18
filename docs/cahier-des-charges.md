# Cahier des charges — GL Cuisines

> Outil de pilotage chantier pour une PME artisanale de cuisines et agencement à Brest.

---

## 1. Contexte métier

**GL Cuisines** — 4 personnes :
- 1 dirigeant
- 1 collaboratrice bureau
- 2 poseurs

**Activité** : conception, vente, pose de cuisines sur mesure + agencement (dressings, SDB, meubles TV, bibliothèques).

**Outil actuel** : un Google Sheets qui gère contacts clients, suivi projet (9 étapes), commandes par catégorie (7 catégories), livraisons, planning par semaine (S01–S52), poseurs assignés, SAV. → Devient ingérable.

**Objectif** : remplacer ce Sheets par une application simple, rapide, orientée décision terrain. Le dirigeant doit pouvoir répondre en 3 secondes à :
- Ce chantier est-il prêt à poser ?
- Qu'est-ce qui bloque ?
- Quelles commandes sont en retard ?

---

## 2. Philosophie produit

**CLARTÉ TERRAIN > RICHESSE FONCTIONNELLE**

- Pas d'esthétique SaaS générique.
- Vues denses et lisibles. Pas de grandes cartes avec du padding.
- Vocabulaire métier français dans toute l'UI.
- Code couleurs forts, cohérents.
- Calcul automatique partout où c'est possible.

---

## 3. Stack technique

| Couche | Choix |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Base de données | PostgreSQL + Prisma |
| UI | Tailwind + shadcn/ui (thème neutral/slate) |
| Formulaires | react-hook-form + Zod |
| Tests | Vitest (logique métier) |

---

## 4. Les 6 modules

### Module 1 — Projets

**Liste `/projets`** :
- Filtres : statut global, semaine de pose, poseur, vendeur.
- Tri par pose, par statut, par nom client.
- Vue dense (tableau).

**Fiche détail `/projets/[id]`** — 6 onglets :
1. **Infos client** — coordonnées, adresse chantier, type projet, vendeur, montant.
2. **Workflow** — les 9 étapes avec leur statut, édition inline.
3. **Commandes** — liste des 7 catégories, CRUD commandes.
4. **Planning** — semaines de pose, poseurs assignés.
5. **SAV** — tickets liés au projet.
6. **Alertes** — alertes actives (calculées, pas stockées).

**Création `/projets/nouveau`** :
- Formulaire react-hook-form + Zod.
- CRUD client intégré (création à la volée possible).

---

### Module 2 — Workflow projet

**9 étapes**, chacune avec un statut :

| # | Étape |
|---|---|
| 1 | Bon de commande |
| 2 | Plans techniques |
| 3 | Plans de pose |
| 4 | Commandes passées |
| 5 | Livraisons reçues |
| 6 | Dépose (si rénovation) |
| 7 | Prépa électrique |
| 8 | Pose |
| 9 | Facturation |

**Statuts possibles** : `non_commence | en_cours | termine | bloque`.

Édition inline depuis la fiche projet (onglet Workflow).

---

### Module 3 — Commandes

**7 catégories suivies** :
1. Électroménagers
2. Meubles
3. Accessoires
4. Plan de travail
5. Crédence
6. Fond de hotte
7. Sanitaires

**Pour chaque commande** :
- Fournisseur (réf. table `Fournisseur`)
- Statut commande : `non_envoye | envoye | confirme | expedie | livre | reliquat`
- Semaine de livraison prévue (ex. `S16`)
- Statut livraison : `en_attente | livre | partiel | retard`
- Flag `essentielle` (bool) — bloque la pose si manquante
- Remarque libre

**Deux vues** :
- Édition depuis la fiche projet (onglet Commandes).
- Page transverse `/commandes` avec filtres fournisseur / semaine / statut / catégorie.

---

### Module 4 — Planning

**Page `/planning`** :
- Vue horizontale **S01 → S52** (scroll horizontal).
- Chaque chantier s'affiche sur sa semaine de pose, avec la **couleur de son statut global**.
- Filtres : poseur, type projet, statut.
- **Semaine courante** visuellement distinguée (colonne surlignée).

**Assignation poseur** :
- Un chantier peut avoir 1 ou 2 poseurs assignés (table `AssignationPoseur`).
- Poseurs internes ou externes (flag).

---

### Module 5 — SAV

**Un ticket SAV** :
- Rattaché à un `Projet` (obligatoire).
- Type de problème (texte).
- Catégorie concernée (enum `CategorieCommande`).
- Fournisseur concerné (optionnel).
- Statut : `ouvert | en_attente_fournisseur | planifie | resolu | clos`
- Flag `bloquant` (bool).
- Dates : `dateOuverture`, `dateIntervention`, `dateCloture`.
- Commentaire.

**Journal chronologique** (`SAVJournal`) : chaque action taggée dans le temps (création, changement de statut, intervention, note libre).

---

### Module 6 — Dashboard dirigeant (`/`)

**6 blocs**, en page d'accueil :

1. **Alertes prioritaires** (rouges) — à traiter aujourd'hui.
2. **Chantiers cette semaine** (pose cette semaine).
3. **Chantiers à risque** (pose < 2 semaines, commandes en retard).
4. **Commandes non envoyées**.
5. **Livraisons critiques** (retard ou attendues cette semaine sur essentielles).
6. **SAV ouverts** (triés par ancienneté).

---

### Référentiels (pages simples)

- `/referentiels/fournisseurs` — CRUD
- `/referentiels/poseurs` — CRUD (flag interne/externe)
- `/referentiels/vendeurs` — CRUD
- `/referentiels/types-projet` — CRUD (tags)

---

## 5. Règles métier

### 5.1 Statut global chantier

Premier match gagne, de haut en bas :

| # | Condition | Statut | Couleur |
|---|---|---|---|
| 1 | Toutes étapes `termine` | **Terminé** | gris `#6b7280` |
| 2 | Pose `termine` ET facturation ≠ `termine` | **À facturer** | violet `#9333ea` |
| 3 | ≥ 1 étape `bloque` | **Bloqué** | rouge foncé `#991b1b` |
| 4 | Pose < 14 jours ET cmd essentielle `non_envoye` ou `retard` | **À risque** | rouge `#dc2626` |
| 5 | Pose < 30 jours ET catégorie essentielle `reliquat` | **Vigilance** | orange `#ea580c` |
| 6 | Toutes catégories essentielles `livre` ET pose ≠ `termine` | **Prêt** | vert `#16a34a` |
| 7 | Sinon | **En cours** | bleu `#2563eb` |

### 5.2 Alertes (7 règles)

| ID | Condition | Niveau |
|---|---|---|
| A1 | Pose < 7j ET commande essentielle `non_envoye` | 🔴 Rouge |
| A2 | Pose < 14j ET livraison essentielle manquante | 🔴 Rouge |
| A3 | Livraison prévue cette semaine ET statut `retard` | 🔴 Rouge |
| A4 | Reliquat sur catégorie essentielle | 🟠 Orange |
| A5 | SAV ouvert bloquant depuis > 15 jours | 🟠 Orange |
| A6 | Pose < 30j ET plans techniques `non_commence` | 🟠 Orange |
| A7 | Pose < 7j ET prépa élec `non_commence` (projet rénovation) | 🟡 Jaune |

Alertes **calculées à la volée**, jamais stockées.

### 5.3 Semaines ISO

- Format `S01` à `S52`.
- Fonctions dans `src/lib/metier/semaines.ts` :
  - `dateVersSemaine(date: Date): string` → `"S16"`
  - `semaineVersDates(semaine: string, annee: number): { debut: Date, fin: Date }`
  - `semaineActuelle(): string` (on est en avril 2026)

---

## 6. Modèle de données Prisma

### Entités

- **`Client`** : nom, prénom, téléphone, email, adresse, CP, ville.
- **`Projet`** : référence unique (ex. `2026-042`), `clientId`, `vendeurId`, `typeProjet`, adresse chantier, montant HT/TTC, `semainePose`, `estRenovation`, dates clés.
- **`EtapeProjet`** : `projetId`, `numero` (1–9), `nom`, `statut` enum, `dateFin`, commentaire.
- **`Commande`** : `projetId`, `fournisseurId`, `categorie` enum, `statutCommande` enum, `semaineLivraisonPrevue`, `statutLivraison` enum, `essentielle` bool, remarque.
- **`Fournisseur`** : nom, contact, téléphone, email, catégories gérées.
- **`Poseur`** : nom, prénom, téléphone, `interne` bool.
- **`Vendeur`** : nom, prénom, téléphone, email.
- **`AssignationPoseur`** : `projetId`, `poseurId`, `semaine`, rôle (principal/secondaire).
- **`SAV`** : `projetId`, `fournisseurId?`, `categorie?`, typeProbleme, statut enum, `bloquant` bool, `dateOuverture`, `dateIntervention?`, `dateCloture?`, commentaire.
- **`SAVJournal`** : `savId`, `type`, commentaire, auteur, timestamp.

### Enums

- `StatutEtape` : `non_commence | en_cours | termine | bloque`
- `CategorieCommande` : `electromenagers | meubles | accessoires | plan_travail | credence | fond_hotte | sanitaires`
- `StatutCommande` : `non_envoye | envoye | confirme | expedie | livre | reliquat`
- `StatutLivraison` : `en_attente | livre | partiel | retard`
- `StatutSAV` : `ouvert | en_attente_fournisseur | planifie | resolu | clos`
- `StatutGlobalProjet` (calculé, non stocké) : `en_cours | pret | vigilance | a_risque | bloque | a_facturer | termine`

### Conventions

- Tables **PascalCase français** (`Projet`, `Commande`, `SAVJournal`).
- Timestamps `createdAt` / `updatedAt` partout.
- Relations explicites avec `onDelete: Cascade` ou `Restrict` selon la sémantique.

---

## 7. Plan des sprints

### Sprint 0 — Setup
- Init Next.js 15 + TS + Tailwind + shadcn (thème neutral/slate).
- Init Prisma + PostgreSQL (connection string dans `.env.example`).
- Arborescence : `src/app/(dashboard)/`, `src/components/ui/`, `src/components/metier/`, `src/lib/metier/`, `src/types/`.
- `.gitignore` + `README.md`.

### Sprint 1 — Fondations métier
- Schéma Prisma complet.
- Seed : 3 projets, 5 fournisseurs, 2 poseurs, 1 SAV.
- `src/lib/metier/semaines.ts` + `statuts.ts` + `alertes.ts`.
- Tests Vitest : ≥ 3 cas par fonction.
- Layout global avec sidebar 6 entrées.
- Dashboard sur données **mockées**.

### Sprint 2 — Projets
- Server Actions CRUD projet + client.
- Page `/projets` (liste filtrée/triée).
- Page `/projets/[id]` avec 6 onglets.
- Page `/projets/nouveau` (RHF + Zod).
- Édition inline du workflow.

### Sprint 3 — Commandes
- Onglet Commandes sur fiche projet (CRUD).
- Page `/commandes` (vue transverse).
- Filtres fournisseur / semaine / statut / catégorie.

### Sprint 4 — Planning + Référentiels
- Page `/planning` (S01–S52).
- Assignation poseurs.
- Pages référentiels : fournisseurs, poseurs, vendeurs, types-projet.

### Sprint 5 — SAV + Dashboard réel
- Module SAV complet avec journal.
- Dashboard branché sur vraies données DB.

### Sprint 6 — Finition
- Check responsive tablette (768px).
- Export PDF fiche chantier.
- `README.md` final + `docs/deploiement.md`.

---

## 8. Règles de code

- **TypeScript strict**, zéro `any`.
- Entités métier en **français** (`Projet`, `Commande`), technique en **anglais** (`getProjetById`, `computeStatutGlobal`).
- **Server components par défaut**, `"use client"` uniquement si nécessaire.
- **Zod** pour toute validation d'entrée (formulaires et server actions).
- Une fonction = une responsabilité (**< 50 lignes**).
- Commentaires métier en français.

---

## 9. Check-list de fin de sprint

À chaque fin de sprint :
1. `npm run build` doit passer.
2. Tests Vitest verts (quand il y en a).
3. Proposition de message de commit clair (convention `feat:` / `fix:` / `docs:` / `chore:` / `test:`).
4. **Attendre** la validation du dirigeant avant de démarrer le sprint suivant.
