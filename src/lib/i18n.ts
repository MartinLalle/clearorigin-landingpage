export const LANGS = [
	{ code: 'fr', label: 'FR', path: '/' },
	{ code: 'en', label: 'EN', path: '/en/' },
	{ code: 'es', label: 'ES', path: '/es/' },
	{ code: 'pt', label: 'PT', path: '/pt/' },
] as const;

export type LangCode = (typeof LANGS)[number]['code'];

export const CHROME: Record<
	LangCode,
	{ cta: string; developedBy: string; legal: string }
> = {
	fr: {
		cta: 'Demander une démo',
		developedBy: 'Une solution par',
		legal: 'Tous droits réservés',
	},
	en: {
		cta: 'Request a demo',
		developedBy: 'A solution by',
		legal: 'All rights reserved',
	},
	es: {
		cta: 'Solicitar una demo',
		developedBy: 'Una solución de',
		legal: 'Todos los derechos reservados',
	},
	pt: {
		cta: 'Solicitar uma demo',
		developedBy: 'Uma solução por',
		legal: 'Todos os direitos reservados',
	},
};

export type PageKey = 'home' | 'demo';

/** Le segment optionnel [[...lang]] : absent → fr, sinon en/es/pt (suivi éventuellement de `demo`). */
export function resolveLang(segments?: string[]): LangCode {
	const code = segments?.[0];
	return code === 'en' || code === 'es' || code === 'pt' ? code : 'fr';
}

/**
 * Routes connues : `/`, `/demo/` (fr) et `/<lang>/`, `/<lang>/demo/` (en, es, pt).
 * Renvoie `null` pour tout autre chemin.
 *
 * `resolveLang` retombe sur `fr` pour n'importe quel segment. En rendu dynamique,
 * `dynamicParams = false` ne garantit plus le 404 : sans ce garde, /nimportequoi/
 * servirait la page FR en 200 (contenu dupliqué à l'infini).
 */
export function parseLandingPath(
	segments?: string[],
): { lang: LangCode; page: PageKey } | null {
	const parts = segments ?? [];
	const isLang = (code?: string) =>
		code === 'en' || code === 'es' || code === 'pt';
	if (parts.length === 0) return { lang: 'fr', page: 'home' };
	if (parts.length === 1 && parts[0] === 'demo')
		return { lang: 'fr', page: 'demo' };
	if (parts.length === 1 && isLang(parts[0]))
		return { lang: parts[0] as LangCode, page: 'home' };
	if (parts.length === 2 && isLang(parts[0]) && parts[1] === 'demo')
		return { lang: parts[0] as LangCode, page: 'demo' };
	return null;
}

export function isKnownLangPath(segments?: string[]): boolean {
	return parseLandingPath(segments) !== null;
}

/** Chemin public d'une page dans une langue : `/`, `/en/`, `/demo/`, `/en/demo/`… */
export function pagePath(lang: LangCode, page: PageKey = 'home'): string {
	const base = LANGS.find((l) => l.code === lang)?.path ?? '/';
	return page === 'demo' ? `${base}demo/` : base;
}
