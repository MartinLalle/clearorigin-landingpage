import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';

// Tag de cache posé sur le fetch Storyblok. Le webhook appelle /api/revalidate/
// qui purge ce tag ET la page : la publication remonte en quelques secondes.
export const STORYBLOK_CACHE_TAG = 'storyblok';

// ⚠️ Doit rester STRICTEMENT INFÉRIEUR au `revalidate` exporté par page.tsx (300).
//
// Il y a deux caches empilés : celui de la page (ISR) et le Data Cache du fetch.
// S'ils ont le même TTL, ils expirent en même temps et la page peut se régénérer
// en relisant le fetch encore considéré comme frais — elle est alors reconstruite
// avec l'ancien contenu, `Age` repart à zéro, et le contenu publié ne remonte
// jamais. Avec un TTL plus court, le fetch est toujours périmé quand la page se
// régénère, donc chaque régénération relit vraiment Storyblok.
export const STORYBLOK_CACHE_TTL = 60;

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
