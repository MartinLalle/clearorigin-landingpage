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
- **Filet de sécurité — ISR** : la page porte `revalidate = 60` et le fetch de la story `STORYBLOK_CACHE_TTL = 15`. Si le webhook échoue, la publication remonte quand même au plus tard 1 minute après.

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

**Piège n°2 — ISR vs webhook.** Si le webhook ne part pas, la page remonte quand même, mais en 1 min et en *stale-while-revalidate* : le premier rechargement après expiration sert encore l'ancienne version et déclenche la régénération en tâche de fond ; c'est le **deuxième** rechargement qui montre le nouveau contenu. D'où l'impression que « ça marche une fois sur deux ».

**Piège n°3 — le TTL n'est qu'un repli, la purge est le vrai mécanisme.** Contrairement à ce qu'on pourrait croire, il n'y a pas deux fenêtres de cache indépendantes : **Next prend le MINIMUM** entre `STORYBLOK_CACHE_TTL` (`lib/getLandingStory.ts`) et le `revalidate` de `page.tsx`. Vérifiable dans `.next/prerender-manifest.json` :

```
$ node -e "const m=require('./.next/prerender-manifest.json');   for(const [k,v] of Object.entries(m.routes)) console.log(k, v.initialRevalidateSeconds)"
/    15        # page.tsx dit 60, le fetch dit 15 → c'est 15 qui gagne
/en  15
```

Ne comptez donc pas sur un « écart » entre les deux valeurs pour garantir la fraîcheur. Le mécanisme fiable est la **purge à la demande** par le webhook, qui invalide explicitement les deux couches.

**Piège n°4 — purger le motif de route ne purge pas la racine.** `revalidatePath` construit le tag `_N_T_` + le chemin (voir `next/dist/server/web/spec-extension/revalidate.js`). Un appel sur le motif `'/[[...lang]]'` produit `_N_T_/[[...lang]]/page`, que l'entrée prérendue de `/` ne porte pas — elle porte `_N_T_/` (et `_N_T_/index`, cas spécial dans la source). Il faut donc purger les **chemins littéraux** réellement prérendus :

```ts
for (const path of ['/', '/en', '/es', '/pt']) revalidatePath(path);
```

C'est ce que fait `PRERENDERED_PATHS` dans la route. Symptôme quand ça manque : `/en/`, `/es/` et `/pt/` se rafraîchissent, mais `/` reste bloquée.

### Mode diagnostic

Quand un doute persiste sur ce qui tourne réellement en prod, l'endpoint sait se décrire lui-même — sans rien purger :

```bash
curl -s "https://<domaine>/api/revalidate/?secret=<le-secret>&debug=1"
```

Il renvoie le `commit` déployé (`VERCEL_GIT_COMMIT_SHA`), le `fetchTtl` réellement compilé, et surtout `live` vs `cached` : le `cta_label` lu directement chez Storyblok face à celui que sert le Data Cache. Si `dataCacheStale` est `true`, le Data Cache est le coupable — plus besoin de déduire quoi que ce soit depuis l'extérieur.

Chaque appel est tracé dans **Vercel → Logs** (`[revalidate] ok` / `[revalidate] rejeté`) : c'est la preuve directe que Storyblok appelle bien, ou non.
