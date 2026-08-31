import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';

// Aucune mise en cache : la page est en `force-dynamic` (cf. page.tsx) et relit
// Storyblok à chaque requête. C'est ce qui garantit qu'une publication est
// visible immédiatement, sans purge à déclencher ni entrée ISR qui se coince.
//
// cache() ne met rien en cache entre deux requêtes : il déduplique seulement
// l'appel au sein d'une même requête (generateMetadata + page).
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
		{ cache: 'no-store' },
	);

	return data.story;
});
