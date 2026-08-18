import type { ReactNode } from 'react';
import { Lexend, IBM_Plex_Mono } from 'next/font/google';
import '@/styles/global.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';
import { resolveLang } from '@/lib/i18n';

const lexend = Lexend({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700', '800'],
	variable: '--font-lexend',
	display: 'swap',
});

const plexMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	variable: '--font-plex-mono',
	display: 'swap',
});

export function generateStaticParams() {
	return [{ lang: [] }, { lang: ['en'] }, { lang: ['es'] }, { lang: ['pt'] }];
}

export const dynamicParams = false;

export default async function RootLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ lang?: string[] }>;
}) {
	const lang = resolveLang((await params).lang);

	return (
		<html lang={lang} className={`${lexend.variable} ${plexMono.variable}`}>
			<body>
				<SiteHeader lang={lang} />
				<main>{children}</main>
				<SiteFooter lang={lang} />
				<ScrollReveal />
			</body>
		</html>
	);
}
