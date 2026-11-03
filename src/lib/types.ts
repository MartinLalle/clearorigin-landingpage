import type { SbBlokData } from '@storyblok/react/rsc';

export interface SbAsset {
	filename?: string;
	alt?: string;
	/** Renseignées pour les images locales (import statique). */
	width?: number;
	height?: number;
}

export type Blok<T = Record<string, unknown>> = SbBlokData & T;
