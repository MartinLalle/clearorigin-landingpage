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

### Diagnostiquer quand une publication ne remonte pas

La route est auto-diagnosticable : un seul appel dit où ça coince.

```bash
curl -i "https://<domaine-de-prod>/api/revalidate/?secret=<le-secret>"
```

| Réponse | Cause | Correctif |
| --- | --- | --- |
| `200 {"revalidated":true}` | La route marche. Le problème est en amont : le webhook Storyblok. | Storyblok → Settings → Webhooks : vérifier qu'il est encore `activated` (Storyblok le désactive après des échecs répétés) et lire le log de livraison. |
| `401 {"reason":"Secret fourni mais différent..."}` | Le secret du webhook ≠ celui de Vercel. | Réaligner les deux. |
| `503 {"reason":"STORYBLOK_REVALIDATE_SECRET absent..."}` | La variable n'existe pas dans cet environnement Vercel. | L'ajouter en **Production**, puis redéployer (une variable n'est prise en compte qu'au déploiement suivant). |
| `308 Permanent Redirect` | Le `/` final manque dans l'URL. | Voir ci-dessous. |

**Piège n°1 — le `/` final.** Le projet est en `trailingSlash: true`. `POST /api/revalidate?secret=...` renvoie un **308** vers `/api/revalidate/?secret=...`, et un émetteur de webhook ne suit pas forcément une redirection en POST : la purge n'a alors jamais lieu, sans erreur visible. L'URL du webhook doit être `…/api/revalidate/?secret=…`.

**Piège n°2 — ISR vs webhook.** Si le webhook ne part pas, la page remonte quand même, mais en 5 min et en *stale-while-revalidate* : le premier rechargement après expiration sert encore l'ancienne version et déclenche la régénération en tâche de fond ; c'est le **deuxième** rechargement qui montre le nouveau contenu. D'où l'impression que « ça marche une fois sur deux ».

**Piège n°3 — les deux caches empilés.** Il y en a deux : l'entrée ISR de la page (`revalidate = 300` dans `page.tsx`) et le Data Cache du fetch Storyblok (`STORYBLOK_CACHE_TTL` dans `lib/getLandingStory.ts`). S'ils ont le **même TTL**, ils expirent ensemble et la page peut se régénérer en relisant un fetch encore considéré comme frais : le HTML est reconstruit avec l'ancien contenu, `Age` repart à zéro, et la publication ne remonte jamais. Symptôme observé en prod :

```
age=304  cache=STALE   nouveau texte : non
age=14   cache=HIT     nouveau texte : non   ← page régénérée, contenu périmé
```

D'où la règle : **`STORYBLOK_CACHE_TTL` (60) doit rester strictement inférieur au `revalidate` de la page (300)**, pour que le fetch soit toujours périmé au moment où la page se régénère. Et le webhook purge **les deux** couches, le tag avant la page.

Chaque appel est tracé dans **Vercel → Logs** (`[revalidate] ok` / `[revalidate] rejeté`) : c'est la preuve directe que Storyblok appelle bien, ou non.
