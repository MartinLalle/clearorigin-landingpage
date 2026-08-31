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

/** Le segment optionnel [[...lang]] : absent → fr, sinon en/es/pt. */
export function resolveLang(segments?: string[]): LangCode {
	const code = segments?.[0];
	return code === 'en' || code === 'es' || code === 'pt' ? code : 'fr';
}

// `resolveLang` retombe sur `fr` pour n'importe quel segment. En rendu
// dynamique, `dynamicParams = false` ne garantit plus le 404 : sans ce garde,
// /nimportequoi/ servirait la page FR en 200 (contenu dupliqué à l'infini).
export function isKnownLangPath(segments?: string[]): boolean {
	if (!segments || segments.length === 0) return true; // '/' → fr
	return (
		segments.length === 1 &&
		(segments[0] === 'en' || segments[0] === 'es' || segments[0] === 'pt')
	);
}
