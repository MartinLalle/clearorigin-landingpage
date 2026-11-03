import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';
import { getLocalStory } from '@/lib/local-content';

// Source du contenu :
// - par défaut, les fichiers storyblok/content/home.<lang>.json du repo
//   (le space Storyblok n'est plus actif, les modifs passent par le code) ;
// - CONTENT_SOURCE=storyblok pour relire Storyblok si l'abonnement est repris.
//
// Mode Storyblok : aucune mise en cache. La page est en `force-dynamic`
// (cf. page.tsx) et relit Storyblok à chaque requête, ce qui garantit qu'une
// publication est visible immédiatement, sans purge ni entrée ISR coincée.
//
// cache() ne met rien en cache entre deux requêtes : il déduplique seulement
// l'appel au sein d'une même requête (generateMetadata + page).
export const getLandingStory = cache(async (lang: string) => {
	if (process.env.CONTENT_SOURCE !== 'storyblok') return getLocalStory(lang);

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
