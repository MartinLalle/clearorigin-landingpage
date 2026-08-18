import { useStoryblokApi } from '@storyblok/astro';

export async function getLandingStory(lang: string) {
	const storyblokApi = useStoryblokApi();
	const { data } = await storyblokApi.get('cdn/stories/home', {
		version: import.meta.env.DEV ? 'draft' : 'published',
		language: lang === 'fr' ? undefined : lang,
		fallback_lang: 'default',
	});
	return data.story;
}
