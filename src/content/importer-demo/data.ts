// Lot fictif de la simulation « vue importateur ».
//
// Calqué sur le lot de démo construit dans l'app en local (LOT-2026-014) : même chaîne
// (2 producteurs de Côte d'Ivoire → coopérative → exportateur au Ghana → importateur en
// Belgique), mêmes parcelles et mêmes rapports WHISP (parcels.ts). Les documents de la
// grille de légalité sont inventés pour montrer les différents statuts ; les libellés des
// vérificateurs sont ceux de la grille Côte d'Ivoire / cacao, publiée en français.

import type { DemoLink, DemoNode, DemoPrinciple, DemoProducer } from './types';

export const LOT = {
	exporter: 'Tema Bay Cocoa Exporters',
	reference: 'LOT-2026-014',
	quantity: '350 kg',
	price: '2 450 EUR',
};

const PRINCIPLES_AYA: DemoPrinciple[] = [
	{
		title:
			"1 - Droits d'utilisation des terres - Droits d'utilisation des terres",
		verifiers: [
			{
				label: 'Titre foncier',
				status: 'permanent',
				file: 'titre-foncier-gnamagui.pdf',
			},
			{
				label: 'Certificat foncier coutumier',
				status: 'permanent',
				file: 'certificat-foncier-okrouyo.pdf',
			},
			{
				label:
					"Déclaration d'immatriculation au registre des sociétés coopératives",
				status: 'valid',
				file: 'immatriculation-coop.pdf',
				validUntil: '31/12/2027',
			},
		],
	},
	{
		title: "2 - Protection de l'environnement - Protection de l'environnement",
		verifiers: [
			{
				label:
					'Engagement à respecter la réglementation phytosanitaire et à n’utiliser que des produits autorisés',
				status: 'valid',
				file: 'engagement-phytosanitaire.pdf',
				validUntil: '30/09/2027',
			},
			{
				label:
					'Preuve de possession d’un magasin de stockage conforme pour les pesticides',
				status: 'valid',
				file: 'magasin-stockage-photos.jpg',
				validUntil: '30/09/2027',
			},
		],
	},
	{
		title:
			'3 - Règles forestières directement liées à la récolte du bois - Règles forestières',
		verifiers: [],
	},
	{
		title: '4 - Droits des tiers - Droits des tiers',
		verifiers: [
			{
				label:
					'Procès-verbal de recensement des droits coutumiers (et ses annexes)',
				status: 'permanent',
				file: 'pv-recensement-droits-coutumiers.pdf',
			},
			{
				label: 'Accord écrit de compensation signé',
				status: 'na',
			},
		],
	},
	{
		title: '5 - Droits du travail - Droits du travail',
		verifiers: [
			{
				label: "Rapports d'examen médical d'embauche et périodiques",
				status: 'valid',
				file: 'examens-medicaux-2026.pdf',
				validUntil: '15/03/2027',
			},
			{
				label: 'Contrat de travail écrit',
				status: 'permanent',
				file: 'contrats-travail.pdf',
			},
			{
				label:
					'Affichage des taux minima de salaires et conditions de rémunération',
				status: 'valid',
				file: 'affichage-salaires.jpg',
				validUntil: '31/12/2026',
			},
		],
	},
	{
		title:
			'6 - Droits humains protégés par le droit international - Droits humains',
		verifiers: [],
	},
	{
		title:
			'7 - Principe du consentement libre, préalable et éclairé (FPIC) - Consentement libre, préalable et éclairé (FPIC)',
		verifiers: [
			{
				label:
					'Procès-verbal de réunion de concertation pour le consentement libre, préalable et informé',
				status: 'permanent',
				file: 'pv-concertation-fpic.pdf',
			},
			{
				label:
					'Liste exhaustive des détenteurs de droits coutumiers collectifs',
				status: 'permanent',
				file: 'liste-detenteurs-droits.pdf',
			},
		],
	},
	{
		title:
			'8 - Réglementation fiscale, anti-corruption, commerciale et douanière - Fiscalité, anti-corruption, commerce et douanes',
		verifiers: [
			{
				label: 'Reçu de paiement de la redevance professionnelle café-cacao',
				status: 'valid',
				file: 'redevance-cafe-cacao-2026.pdf',
				validUntil: '31/12/2026',
			},
			{
				label:
					'Reçu de paiement des redevances et reversements au Conseil du Café-Cacao',
				status: 'valid',
				file: 'recu-conseil-cafe-cacao.pdf',
				validUntil: '30/06/2027',
			},
		],
	},
];

// Second producteur : dossier moins avancé, pour montrer « Incomplet » et « Expiré ».
const PRINCIPLES_YAO: DemoPrinciple[] = PRINCIPLES_AYA.map(
	(principle, index) => {
		if (index === 0) {
			return {
				...principle,
				verifiers: [
					{ label: 'Titre foncier', status: 'missing' },
					{
						label: 'Certificat foncier coutumier',
						status: 'permanent',
						file: 'certificat-foncier-gadouan.pdf',
					},
					principle.verifiers[2],
				],
			};
		}
		if (index === 4) {
			return {
				...principle,
				verifiers: [
					{
						label: "Rapports d'examen médical d'embauche et périodiques",
						status: 'expired',
						file: 'examens-medicaux-2025.pdf',
						validUntil: '15/09/2026',
					},
					principle.verifiers[1],
					principle.verifiers[2],
				],
			};
		}
		return principle;
	},
);

export const PRODUCERS: DemoProducer[] = [
	{
		id: 'aya',
		name: 'Aya Kouamé',
		country: 'CI',
		product: 'cocoa',
		principles: PRINCIPLES_AYA,
	},
	{
		id: 'yao',
		name: "Yao N'Dri",
		country: 'CI',
		product: 'cocoa',
		principles: PRINCIPLES_YAO,
	},
];

// Les intermédiaires sont anonymisés et placés au centre de leur pays, comme dans l'app.
export const NODES: DemoNode[] = [
	{
		id: 'coop',
		kind: 'intermediary',
		country: 'CI',
		position: [7.54, -5.55],
		ordinal: 1,
	},
	{
		id: 'exporter',
		kind: 'intermediary',
		country: 'GH',
		position: [7.95, -1.02],
		ordinal: 2,
	},
	{ id: 'importer', kind: 'importer', country: 'BE', position: [50.64, 4.67] },
];

export const LINKS: DemoLink[] = [
	{ from: 'aya', to: 'coop', fromIsProducer: true },
	{ from: 'yao', to: 'coop', fromIsProducer: true },
	{ from: 'coop', to: 'exporter', fromIsProducer: false },
	{ from: 'exporter', to: 'importer', fromIsProducer: false },
];
