export type Risk = 'low' | 'medium' | 'high' | 'unknown';

export type DemoParcel = {
	id: string;
	producerId: string;
	/** Anneau extérieur du polygone, en [lng, lat] (GeoJSON). */
	ring: [number, number][] | number[][];
	areaHectares: number;
	risk: Risk;
	riskByCategory: { category: string; risk: Risk }[];
	indicators: { key: string; present: boolean }[];
};

export type VerifierStatus =
	'valid' | 'permanent' | 'missing' | 'expired' | 'na';

export type DemoVerifier = {
	label: string;
	status: VerifierStatus;
	file?: string;
	validUntil?: string;
};

export type DemoPrinciple = {
	title: string;
	verifiers: DemoVerifier[];
};

export type DemoProducer = {
	id: string;
	name: string;
	country: CountryCode;
	product: 'cocoa';
	principles: DemoPrinciple[];
};

export type CountryCode = 'CI' | 'GH' | 'BE';

export type DemoNode = {
	id: string;
	kind: 'intermediary' | 'importer';
	country: CountryCode;
	/** [lat, lng] */
	position: [number, number];
	ordinal?: number;
};

/** Un lien orienté de la chaîne : d'un producteur (ou de ses parcelles) ou d'un intermédiaire vers un nœud. */
export type DemoLink = {
	from: string;
	to: string;
	fromIsProducer: boolean;
};
