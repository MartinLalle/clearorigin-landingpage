import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';

// Tag de cache posé sur le fetch Storyblok. Le webhook Storyblok appelle
// /api/revalidate/ qui invalide ce tag : la publication se reflète en prod
// sans redéploiement, en quelques secondes.
export const STORYBLOK_CACHE_TAG = 'storyblok';

// Filet de sécurité si le webhook n'arrive pas (doit rester aligné sur le
// `revalidate` exporté par la page).
export const STORYBLOK_CACHE_TTL = 300;

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
