import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { Instrument_Sans } from 'next/font/google';
import '@/styles/global.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';
import { parseLandingPath, resolveLang } from '@/lib/i18n';

// Police de marque de l'app ClearOrigin. Fonte variable : graisse + largeur
// (axe `wdth`), les titres utilisent la largeur réduite via `font-stretch`.
const instrumentSans = Instrument_Sans({
	subsets: ['latin', 'latin-ext'],
	axes: ['wdth'],
	variable: '--font-instrument',
	display: 'swap',
});

export const viewport: Viewport = { themeColor: '#0f3326' };

export function generateStaticParams() {
	return [
		{ lang: [] },
		{ lang: ['en'] },
		{ lang: ['es'] },
		{ lang: ['pt'] },
		{ lang: ['demo'] },
		{ lang: ['en', 'demo'] },
		{ lang: ['es', 'demo'] },
		{ lang: ['pt', 'demo'] },
	];
}

export const dynamicParams = false;

export default async function RootLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ lang?: string[] }>;
}) {
	const segments = (await params).lang;
	const lang = resolveLang(segments);
	const page = parseLandingPath(segments)?.page ?? 'home';

	return (
		<html lang={lang} className={instrumentSans.variable}>
			<body>
				<SiteHeader lang={lang} page={page} />
				<main>{children}</main>
				<SiteFooter lang={lang} />
				<ScrollReveal />
			</body>
		</html>
	);
}
