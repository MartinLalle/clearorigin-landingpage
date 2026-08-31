import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';

// Tag de cache posé sur le fetch Storyblok. Le webhook appelle /api/revalidate/
// qui purge ce tag ET la page : la publication remonte en quelques secondes.
export const STORYBLOK_CACHE_TAG = 'storyblok';

// TTL du Data Cache du fetch Storyblok.
//
// ⚠️ Next NE garde PAS deux fenêtres distinctes : le `revalidate` effectif de la
// route est le MINIMUM entre ce TTL et le `revalidate` exporté par page.tsx.
// Vérifiable dans `.next/prerender-manifest.json` (`initialRevalidateSeconds`).
// Avec 15 ici et 60 dans page.tsx, la route revalide donc toutes les 15 s.
//
// On le garde volontairement plus court que celui de la page pour que le Data
// Cache ne soit jamais la couche périmée. Mais le mécanisme FIABLE reste la
// purge à la demande par le webhook (/api/revalidate/) : ce TTL n'est qu'un
// repli si le webhook ne part pas.
export const STORYBLOK_CACHE_TTL = 15;

// cache() : la story est fetchée une seule fois par requête (generateMetadata + page)
export const getLandingStory = cache(async (lang: string) => {
	const storyblokApi = getStoryblokApi();
	const isDraft = process.env.NODE_ENV === 'development';

	const { data } = await storyblokApi.get(
		'cdn/stories/home',
		{
			version: isDraft ? 'draft' : 'published',
			language: lang === 'fr' ? undefined : lang,
			fallback_lang: 'default',
		},
		isDraft
			? { cache: 'no-store' }
			: {
					next: {
						tags: [STORYBLOK_CACHE_TAG],
						revalidate: STORYBLOK_CACHE_TTL,
					},
				},
	);

	return data.story;
});
