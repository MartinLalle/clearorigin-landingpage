# ClearOrigin — Landing page

Landing page marketing de [ClearOrigin](https://clearorigin.azurewebsites.net) (traçabilité & conformité EUDR), gérée dans **Storyblok** et rendue par **Next.js**. Projet indépendant de l'app ClearOrigin.

## Stack

- **Next.js 16** (App Router, SSG + ISR) + `@storyblok/react` (entry RSC)
- **Storyblok** : space `ClearOrigin` (ID `294620695570259`), story `home`, contenu multilingue FR (défaut) / EN / ES / PT via field-level translations
- HTTPS local via `next dev --experimental-https` (requis par le Visual Editor Storyblok)

## Démarrer

```bash
npm install
npm run dev        # https://localhost:3000 (accepter le certificat au premier lancement)
```

Routes : `/` (FR), `/en/`, `/es/`, `/pt/`.

En dev, la page rend la version **draft** de la story (avec les attributs d'édition du Visual Editor) ; en build (`npm run build`), la version **publiée**.

## Structure du contenu (8 sections)

La story `home` est un `landing_page` dont le champ `body` empile les bloks :

1. `hero` — proposition de valeur + CTA
2. `benefits` — pourquoi (bénéfices / problème)
3. `steps` — comment (4 étapes, fil de traçabilité)
4. `features_grid` — la plateforme (webApp / PWA / vue importateur)
5. `social_proof` — preuves (stats, standards, témoignages)
6. `offer` — l'offre + bonus
7. `guarantees` — garanties
8. `faq` + `cta_final` — FAQ et appel à l'action final (demande de démo)

Chaque blok a son composant React dans `src/components/storyblok/` (mapping dans `src/lib/storyblok.ts`) et sa définition de schéma dans `storyblok/components.json`.

## Modifier le contenu

Deux façons :

- **Visual Editor Storyblok** (recommandé pour l'éditorial) : lancer `npm run dev`, puis ouvrir la story `home` sur app.storyblok.com — la preview pointe sur `https://localhost:3000/`. Le bridge met la page à jour en live pendant l'édition. Publier pour mettre en prod.
- **Par code** : éditer `storyblok/content/home.<lang>.json` puis relancer le push (ci-dessous). ⚠️ Le push écrase le contenu de la story — ne pas mélanger les deux méthodes sans re-synchroniser.

## Pousser vers Storyblok (components-as-code)

```bash
npx storyblok@latest login        # une fois (Management API)
npm run push:storyblok            # langues + composants + assets + story + preview URL
```

Options : `--skip-assets` (ne pas uploader `screenshots/`), `--no-publish` (laisser en draft).
Le script lit le token du login CLI (`~/.storyblok/credentials.json`) ou `STORYBLOK_MANAGEMENT_TOKEN`.

Les screenshots de l'app vont dans `screenshots/` (non versionné) ; le contenu les référence par `__ASSET__:<nom>.png`, résolus à l'upload.

## Déploiement

`npm run build` prérend les 4 routes en statique (fetch de la story **publiée**). Aucune publication Storyblok ne nécessite de redéploiement :

- **Instantané — webhook** : Storyblok appelle `POST /api/revalidate/?secret=...` à chaque publication, ce qui purge le tag de cache `storyblok` et les 4 routes prérendues. La page suivante servie est régénérée avec le contenu à jour.
- **Filet de sécurité — ISR** : le fetch de la story et la page portent `revalidate = 300`. Si le webhook échoue, la publication remonte quand même au plus tard 5 minutes après.

### Configurer le webhook (une fois)

1. Générer un secret : `openssl rand -hex 20`.
2. L'ajouter dans Vercel → Settings → Environment Variables, sous le nom `STORYBLOK_REVALIDATE_SECRET` (Production + Preview), puis redéployer une dernière fois.
3. Dans Storyblok → **Settings → Webhooks → New webhook** :
   - Endpoint : `https://<domaine-de-prod>/api/revalidate/?secret=<le-secret>` (garder le `/` final, le projet est en `trailingSlash: true`)
   - Triggers : `story.published`, `story.unpublished`, `story.deleted`
4. Vérifier : publier la story `home`, recharger la page en navigation privée. Un appel manuel fonctionne aussi :

```bash
curl -X POST "https://<domaine-de-prod>/api/revalidate/?secret=<le-secret>"
# {"revalidated":true,"now":...}
```

Sans `STORYBLOK_REVALIDATE_SECRET` en environnement, la route répond `401` et seul l'ISR 5 minutes s'applique.
