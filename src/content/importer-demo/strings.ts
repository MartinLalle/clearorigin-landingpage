import type { LangCode } from '@/lib/i18n';
import type { CountryCode, VerifierStatus } from './types';
import { APP_STRINGS } from './app-strings';

// Textes propres à la simulation (bandeau, statuts, pays) ; le reste vient de l'app (app-strings.ts).
const SIM: Record<
	LangCode,
	{
		metaTitle: string;
		metaDescription: string;
		badge: string;
		banner: string;
		back: string;
		restart: string;
		cocoa: string;
		countries: Record<CountryCode, string>;
		status: Record<VerifierStatus, string>;
	}
> = {
	fr: {
		metaTitle: 'Vue importateur — simulation | ClearOrigin',
		metaDescription:
			"Explorez, sans compte, la vue qu'un importateur européen reçoit pour un lot tracé avec ClearOrigin.",
		badge: 'Simulation',
		banner:
			"Voici ce que reçoit votre client importateur, sans créer de compte. Les données sont fictives : rien n'est enregistré.",
		back: 'Retour au site',
		restart: 'Recommencer la simulation',
		cocoa: 'Cacao',
		countries: { CI: "Côte d'Ivoire", GH: 'Ghana', BE: 'Belgique' },
		status: {
			valid: 'Valide',
			permanent: 'Permanent',
			missing: 'Non fourni',
			expired: 'Expiré',
			na: 'Non applicable',
		},
	},
	en: {
		metaTitle: 'Importer view — simulation | ClearOrigin',
		metaDescription:
			'Explore, without an account, the view a European importer receives for a batch traced with ClearOrigin.',
		badge: 'Simulation',
		banner:
			'This is what your importer client receives — no account needed. The data is fictitious: nothing is saved.',
		back: 'Back to the site',
		restart: 'Restart the simulation',
		cocoa: 'Cocoa',
		countries: { CI: "Côte d'Ivoire", GH: 'Ghana', BE: 'Belgium' },
		status: {
			valid: 'Valid',
			permanent: 'Permanent',
			missing: 'Not provided',
			expired: 'Expired',
			na: 'Not applicable',
		},
	},
	es: {
		metaTitle: 'Vista del importador — simulación | ClearOrigin',
		metaDescription:
			'Explore, sin cuenta, la vista que recibe un importador europeo para un lote trazado con ClearOrigin.',
		badge: 'Simulación',
		banner:
			'Esto es lo que recibe su cliente importador, sin crear una cuenta. Los datos son ficticios: no se guarda nada.',
		back: 'Volver al sitio',
		restart: 'Reiniciar la simulación',
		cocoa: 'Cacao',
		countries: { CI: 'Costa de Marfil', GH: 'Ghana', BE: 'Bélgica' },
		status: {
			valid: 'Válido',
			permanent: 'Permanente',
			missing: 'No aportado',
			expired: 'Caducado',
			na: 'No aplicable',
		},
	},
	pt: {
		metaTitle: 'Vista do importador — simulação | ClearOrigin',
		metaDescription:
			'Explore, sem conta, a vista que um importador europeu recebe para um lote rastreado com o ClearOrigin.',
		badge: 'Simulação',
		banner:
			'Isto é o que o seu cliente importador recebe, sem criar conta. Os dados são fictícios: nada é guardado.',
		back: 'Voltar ao site',
		restart: 'Reiniciar a simulação',
		cocoa: 'Cacau',
		countries: { CI: 'Costa do Marfim', GH: 'Gana', BE: 'Bélgica' },
		status: {
			valid: 'Válido',
			permanent: 'Permanente',
			missing: 'Não fornecido',
			expired: 'Expirado',
			na: 'Não aplicável',
		},
	},
};

export type DemoStrings = {
	sim: (typeof SIM)['fr'];
	t: (
		key: keyof (typeof APP_STRINGS)['fr'],
		vars?: Record<string, string | number>,
	) => string;
};

export function getDemoStrings(lang: LangCode): DemoStrings {
	const app = APP_STRINGS[lang] ?? APP_STRINGS.fr;
	return {
		sim: SIM[lang] ?? SIM.fr,
		t: (key, vars) => {
			let text: string = app[key] ?? APP_STRINGS.en[key] ?? key;
			for (const [name, value] of Object.entries(vars ?? {})) {
				text = text.replaceAll(`{{${name}}}`, String(value));
			}
			return text;
		},
	};
}

export function getSimMeta(lang: LangCode) {
	const sim = SIM[lang] ?? SIM.fr;
	return { title: sim.metaTitle, description: sim.metaDescription };
}
