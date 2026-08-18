import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';

// cache() : la story est fetchée une seule fois par requête (generateMetadata + page)
export const getLandingStory = cache(async (lang: string) => {
	const storyblokApi = getStoryblokApi();
	const { data } = await storyblokApi.get('cdn/stories/home', {
		version: process.env.NODE_ENV === 'development' ? 'draft' : 'published',
		language: lang === 'fr' ? undefined : lang,
		fallback_lang: 'default',
	});
	return data.story;
});
