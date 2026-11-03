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

## Source du contenu

**Par défaut, la page lit le contenu du repo** : `storyblok/content/home.<lang>.json`, avec les images de `src/content/screenshots/` (déclarées dans `src/lib/local-content.ts`). Depuis novembre 2026, l'essai Storyblok du space a expiré et le client ne modifie plus le contenu lui-même : toute modification se fait dans ces fichiers, puis commit et déploiement.

Pour revenir à Storyblok si l'abonnement est repris :

1. Relancer `npm run push:storyblok` pour que le space reprenne le contenu du repo.
2. Définir `CONTENT_SOURCE=storyblok` (dans `.env` et chez l'hébergeur).

À partir de là, Storyblok redevient la source, et les sections ci-dessous s'appliquent de nouveau.

## Modifier le contenu (mode Storyblok)

Deux façons :

- **Visual Editor Storyblok** (recommandé pour l'éditorial) : lancer `npm run dev`, puis ouvrir la story `home` sur app.storyblok.com — la preview pointe sur `https://localhost:3000/`. Le bridge met la page à jour en live pendant l'édition. Publier pour mettre en prod.
- **Par code** : éditer `storyblok/content/home.<lang>.json` puis relancer le push (ci-dessous). ⚠️ Le push écrase le contenu de la story — ne pas mélanger les deux méthodes sans re-synchroniser.

## Pousser vers Storyblok (components-as-code)

```bash
npx storyblok@latest login        # une fois (Management API)
npm run push:storyblok            # langues + composants + assets + story + preview URL
```

Options : `--skip-assets` (ne pas uploader `src/content/screenshots/`), `--no-publish` (laisser en draft).
Le script lit le token du login CLI (`~/.storyblok/credentials.json`) ou `STORYBLOK_MANAGEMENT_TOKEN`.

Les screenshots de l'app vont dans `src/content/screenshots/` (versionné) ; le contenu les référence par `__ASSET__:<nom>.png`, résolus à l'upload.

## Déploiement

La page est en **rendu dynamique** (`export const dynamic = 'force-dynamic'` dans `page.tsx`) : chaque requête relit Storyblok. Une publication est donc visible **au rechargement suivant**, sans redéploiement, sans purge à déclencher, et sans délai.

### La cause racine du contenu figé (à ne jamais réintroduire)

Pendant longtemps, une publication ne remontait pas en prod et seul un redéploiement Vercel « réparait ». Ce n'était **aucun cache Next**. C'était `storyblok-js-client` :

```js
// storyblok-js-client/dist/index.mjs
this.cvMode = config.cache?.cv ?? 'auto';                                   // 542
if (!params.cv && this.cvMode === 'auto') params.cv = cacheVersions[params.token]; // 558
```

`cacheVersions` est un objet **au niveau du module**, donc partagé par toutes les requêtes d'une même instance serveur. Dès sa première réponse, l'instance mémorise le `cv` (content version) et le réattache à chaque appel suivant : Storyblok lui sert alors éternellement le snapshot de cette version. Le flush n'a lieu qu'avec `clear: 'auto'`, alors que le défaut est `'manual'` — donc jamais.

Le symptôme signait le diagnostic : sur **24 requêtes parallèles, 18 servaient le nouveau contenu et 6 l'ancien**, selon l'instance touchée. Et un redéploiement « corrigeait » le problème simplement en repartant d'instances neuves.

Le correctif est dans `src/lib/storyblok.ts` :

```ts
apiOptions: {
	cache: { type: 'none', clear: 'auto', cv: 'manual' },
}
```

`cv: 'manual'` est explicitement recommandé par le type `ISbCache` pour « le SSR avec cache edge, où des URLs stables sont requises ». **Ne pas retirer ce bloc.**

### Pourquoi le rendu dynamique

L'ISR a été retiré pendant la recherche de la cause ci-dessus. Maintenant qu'elle est connue et corrigée, il redeviendrait viable — mais le rendu dynamique est conservé pour sa simplicité : aucune couche de cache, donc rien qui puisse diverger. Si le volume l'exige un jour, la bonne étape suivante est un cache CDN court et explicite (`s-maxage`), en gardant le correctif `cv: 'manual'`.

### Le webhook Storyblok

Il n'est plus nécessaire au fonctionnement, mais l'endpoint `POST /api/revalidate/?secret=...` est conservé : il répond `200` (Storyblok désactive un webhook qui échoue en boucle) et il porte le mode diagnostic.

Configuration, si le webhook doit être (re)créé :

1. Générer un secret : `openssl rand -hex 20` — **hexadécimal**, pour éviter les caractères (`!`, `^`, `*`) qui cassent dans une URL ou un shell.
2. Vercel → Settings → Environment Variables → `STORYBLOK_REVALIDATE_SECRET` (Production + Preview), puis redéployer.
3. Storyblok → Settings → Webhooks : endpoint `https://<domaine>/api/revalidate/?secret=<le-secret>`, triggers `story.published` / `story.unpublished` / `story.deleted`.

**Le `/` avant le `?` est obligatoire.** Le projet est en `trailingSlash: true` : sans lui, la requête reçoit un `308` que l'émetteur ne suit pas forcément en POST.

### Mode diagnostic

Quand un doute existe sur ce qui tourne réellement en prod, l'endpoint sait se décrire lui-même :

```bash
curl -s "https://<domaine>/api/revalidate/?secret=<le-secret>&debug=1"
```

Il renvoie le `commit` déployé (`VERCEL_GIT_COMMIT_SHA`), le `mode` de rendu, et surtout `live` vs `rendered` : le `cta_label` lu en contournant tout cache face à celui que renvoie le chemin de rendu normal. Si `mismatch` est `true`, un cache s'est réintroduit quelque part.

Sous PowerShell, `curl` est un alias d'`Invoke-WebRequest` qui ne connaît pas `-s` et tronque la sortie. Utiliser :

```powershell
(Invoke-RestMethod "https://<domaine>/api/revalidate/?secret=<le-secret>&debug=1").debug | ConvertTo-Json -Depth 5
```

### Piège de mesure

`src/lib/i18n.ts` contient `cta: 'Demander une démo'` **en dur** pour le bouton du header et du footer. Un `grep "Demander une démo"` sur le HTML de prod matche donc cette chaîne, pas le `cta_label` venant de Storyblok. Pour vérifier qu'une publication est bien remontée, comparer avec la valeur **exacte** renvoyée par l'API Storyblok, pas avec un préfixe.
