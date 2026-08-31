import type { Metadata } from 'next';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getLandingStory } from '@/lib/getLandingStory';
import { resolveLang } from '@/lib/i18n';

// Repli si le webhook Storyblok ne part pas : la page se régénère au plus tard
// après ce délai. Doit rester STRICTEMENT SUPÉRIEUR à STORYBLOK_CACHE_TTL
// (cf. lib/getLandingStory.ts), sinon la page se régénère avec un fetch périmé.
export const revalidate = 60;

type PageProps = { params: Promise<{ lang?: string[] }> };

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const lang = resolveLang((await params).lang);
	const story = await getLandingStory(lang);
	const content = story.content;
	const fallbackTitle =
		lang === 'fr'
			? 'ClearOrigin — Traçabilité & conformité EUDR'
			: 'ClearOrigin — EUDR traceability & compliance';

	return {
		title: content.seo_title || fallbackTitle,
		description: content.seo_description || '',
		icons: { icon: '/images/logo_icon_orange.png' },
		alternates: {
			languages: {
				fr: '/',
				en: '/en/',
				es: '/es/',
				pt: '/pt/',
				'x-default': '/',
			},
		},
	};
}

export default async function Page({ params }: PageProps) {
	const lang = resolveLang((await params).lang);
	const story = await getLandingStory(lang);

	return <StoryblokStory story={story} />;
}
