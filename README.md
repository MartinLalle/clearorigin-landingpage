# ClearOrigin — Landing page

Landing page marketing de [ClearOrigin](https://clearorigin.azurewebsites.net) (traçabilité & conformité EUDR), gérée dans **Storyblok** et rendue par **Astro**. Projet indépendant de l'app ClearOrigin.

## Stack

- **Astro 6** (output statique) + `@storyblok/astro`
- **Storyblok** : space `ClearOrigin` (ID `294620695570259`), story `home`, contenu multilingue FR (défaut) / EN / ES / PT via field-level translations
- HTTPS local via `vite-plugin-mkcert` (requis par le Visual Editor Storyblok)

## Démarrer

```bash
npm install
npm run dev        # https://localhost:4321 (accepter le certificat au premier lancement)
```

Routes : `/` (FR), `/en/`, `/es/`, `/pt/`.

En dev, la page rend la version **draft** de la story ; en build (`npm run build`), la version **publiée**.

## Structure du contenu (théorie des 9 sections)

La story `home` est un `landing_page` dont le champ `body` empile les bloks :

1. `hero` — proposition de valeur + CTA
2. `benefits` — pourquoi (bénéfices / problème)
3. `steps` — comment (4 étapes, fil de traçabilité)
4. `features_grid` — la plateforme (webApp / PWA / vue importateur)
5. `social_proof` — preuves (stats, standards, témoignages)
6. `offer` — l'offre + bonus
7. `pricing` — les 4 plans
8. `guarantees` — garanties
9. `faq` + `cta_final` — FAQ et appel à l'action final

Chaque blok a son composant Astro dans `src/storyblok/` (mapping dans `astro.config.mjs`) et sa définition de schéma dans `storyblok/components.json`.

## Modifier le contenu

Deux façons :

- **Visual Editor Storyblok** (recommandé pour l'éditorial) : lancer `npm run dev`, puis ouvrir la story `home` sur app.storyblok.com — la preview pointe sur `https://localhost:4321/`. Publier pour mettre en prod.
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

`npm run build` produit `dist/` statique (fetch de la story **publiée**). Hébergeable n'importe où ; pour rebuilder à chaque publication Storyblok, brancher un webhook « story published » sur la CI/CD de l'hébergeur.
