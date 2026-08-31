import type { Metadata } from 'next';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getLandingStory } from '@/lib/getLandingStory';
import { notFound } from 'next/navigation';
import { isKnownLangPath, resolveLang } from '@/lib/i18n';

// Rendu à chaque requête, sans aucune couche de cache.
//
// L'ISR a été retiré : l'entrée prérendue de `/` se bloquait en production —
// elle cessait d'être régénérée alors que `/en/`, `/es/` et `/pt/` tournaient
// normalement et que la donnée fraîche était bien disponible côté serveur.
// Aucune purge (revalidateTag / revalidatePath) ne la débloquait.
//
// Ici, chaque requête relit Storyblok : une publication est visible au
// rechargement suivant, et il n'existe plus rien qui puisse rester coincé.
export const dynamic = 'force-dynamic';

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
	const segments = (await params).lang;
	if (!isKnownLangPath(segments)) notFound();
	const lang = resolveLang(segments);
	const story = await getLandingStory(lang);

	return <StoryblokStory story={story} />;
}
