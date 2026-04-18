# Guide de déploiement — GL Cuisines

Ce document décrit le déploiement de l'application **GL Cuisines** en production. Le stack cible recommandé est **Vercel + Neon**, mais toute plateforme supportant Next.js 15 et PostgreSQL convient (Railway, Render, Fly.io, OVH, auto-hébergé).

---

## 1. Prérequis

- Un compte **GitHub** (ou GitLab) avec le repo.
- Un compte **Vercel** (https://vercel.com).
- Une base **PostgreSQL** accessible (Neon, Supabase, Railway, RDS…). Prévoir ≥ 0,5 Go.
- (optionnel) Un domaine personnalisé (ex. `pilotage.glcuisines.fr`).

---

## 2. Base de données

### Option A — Neon (recommandé)

1. Crée un projet sur https://neon.tech (offre gratuite suffit pour démarrer).
2. Copie la connection string (format `postgres://user:pass@host/db?sslmode=require`).
3. Teste-la localement :

```bash
DATABASE_URL="postgres://..." npx prisma db push
```

### Option B — Base auto-hébergée

Assure-toi qu'elle est accessible depuis Internet (ou en VPC peering avec Vercel).

---

## 3. Déploiement Vercel

### 3.1. Importer le projet

1. Sur https://vercel.com, **New Project** → importe le repo GitHub.
2. Framework détecté : **Next.js** (rien à changer).
3. **Root directory** : laisser à la racine.

### 3.2. Variables d'environnement

Dans Vercel → **Settings → Environment Variables**, ajouter :

| Clé | Valeur | Environnements |
|---|---|---|
| `DATABASE_URL` | Connection string Postgres | Production, Preview |

### 3.3. Build command (par défaut)

```
npm run build
```

Ajouter un hook post-install pour générer le client Prisma automatiquement — déjà géré par `@prisma/client` dans `package.json` via `postinstall` si nécessaire. Sinon ajoute dans `package.json` :

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### 3.4. Premier déploiement

Clique **Deploy**. Au bout de ~2 minutes l'app tourne sur `https://<projet>.vercel.app`.

---

## 4. Initialisation de la base

Premier boot : le schéma n'est pas encore créé. Deux options :

### Depuis ton poste

```bash
DATABASE_URL="<url-prod>" npx prisma db push
DATABASE_URL="<url-prod>" npx tsx prisma/seed.ts   # si tu veux charger la démo
```

⚠️ **Ne pas seeder en production** si les données de démo polluent les vraies.

### Depuis un shell Vercel

Vercel ne fournit pas de shell persistant. Tu peux utiliser une **Cron Job** temporaire ou, plus simple, pousser le schéma depuis ton poste.

---

## 5. Vérifications post-déploiement

- [ ] `/` charge le dashboard (messages « Aucune alerte » si base vide)
- [ ] `/projets` affiche la liste
- [ ] Création d'un projet fonctionne (CRUD écrit bien en base)
- [ ] `/planning` affiche les 52 colonnes
- [ ] Export **Fiche PDF** sur un projet ouvre la version A4

---

## 6. Domaine personnalisé

Dans Vercel → **Settings → Domains**, ajouter `pilotage.glcuisines.fr`. Configurer un `CNAME` chez le registrar (OVH, Gandi…) pointant vers `cname.vercel-dns.com`. Let's Encrypt est automatique.

---

## 7. Sauvegardes

- **Neon** : snapshots automatiques conservés 7 jours sur l'offre gratuite (30 jours+ sur plan payant).
- **Export manuel** :

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F).sql
```

Stocker les sauvegardes hors-site (Google Drive, S3…).

---

## 8. Mises à jour

Les `main` poussés sur GitHub déclenchent automatiquement un déploiement sur Vercel.

Pour appliquer un changement de schéma Prisma en prod :

```bash
# 1. Sur ton poste, sur une branche :
npx prisma migrate dev --name <nom-du-changement>

# 2. Commit la migration (dossier prisma/migrations/)

# 3. Vercel appliquera automatiquement via le build si tu ajoutes :
"build": "prisma migrate deploy && next build"
```

---

## 9. Monitoring

- **Logs Vercel** : dashboard → onglet « Logs » (temps réel).
- **Erreurs** : envisager Sentry (intégration officielle Next.js) si le projet grossit.
- **Uptime** : Better Uptime ou UptimeRobot (ping `/` toutes les 5 min).

---

## 10. Rollback

En cas de problème après déploiement :

1. Vercel → **Deployments** → sélectionner le dernier build OK.
2. Menu `…` → **Promote to Production**.

Effet immédiat, aucun redéploiement nécessaire.

---

## 11. Variables d'environnement complètes

| Clé | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string Postgres |
| `NODE_ENV` | ❌ | Géré automatiquement par Vercel |

Aucun autre secret n'est requis à ce stade (pas d'auth externe, pas de service tiers).

---

## 12. Checklist de mise en prod

- [ ] `npm run build` passe en local
- [ ] `npm run test` → 47/47 tests verts
- [ ] Variables d'env configurées sur Vercel (Production **et** Preview)
- [ ] Schéma DB créé (`prisma db push` ou `prisma migrate deploy`)
- [ ] Déploiement Vercel OK
- [ ] Vérifications post-déploiement effectuées (section 5)
- [ ] Domaine personnalisé configuré (si prévu)
- [ ] Sauvegarde initiale prise
- [ ] URL transmise à GL Cuisines avec mini-guide utilisateur
