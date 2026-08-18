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
		cta: 'Pedir uma demo',
		developedBy: 'Uma solução por',
		legal: 'Todos os direitos reservados',
	},
};

/** Le segment optionnel [[...lang]] : absent → fr, sinon en/es/pt. */
export function resolveLang(segments?: string[]): LangCode {
	const code = segments?.[0];
	return code === 'en' || code === 'es' || code === 'pt' ? code : 'fr';
}
