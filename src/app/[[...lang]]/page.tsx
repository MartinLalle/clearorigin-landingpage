import type { Metadata } from 'next';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getLandingStory } from '@/lib/getLandingStory';
import { notFound } from 'next/navigation';
import { parseLandingPath, resolveLang } from '@/lib/i18n';
import ImporterDemo from '@/components/importer-demo/ImporterDemo';
import { getSimMeta } from '@/content/importer-demo/strings';

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
	const segments = (await params).lang;
	const lang = resolveLang(segments);

	if (parseLandingPath(segments)?.page === 'demo') {
		const meta = getSimMeta(lang);
		return {
			title: meta.title,
			description: meta.description,
			icons: { icon: '/images/logo_wout_title_forest.png' },
			// Page de simulation : utile aux visiteurs, sans intérêt pour les moteurs.
			robots: { index: false, follow: true },
		};
	}

	const story = await getLandingStory(lang);
	const content = story.content;
	const fallbackTitle =
		lang === 'fr'
			? 'ClearOrigin — Traçabilité & conformité EUDR'
			: 'ClearOrigin — EUDR traceability & compliance';

	return {
		title: content.seo_title || fallbackTitle,
		description: content.seo_description || '',
		icons: { icon: '/images/logo_wout_title_forest.png' },
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
	const route = parseLandingPath(segments);
	if (!route) notFound();
	const { lang } = route;
	if (route.page === 'demo') return <ImporterDemo lang={lang} />;
	const story = await getLandingStory(lang);

	return <StoryblokStory story={story} />;
}
