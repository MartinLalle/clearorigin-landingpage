import type { SbBlokData } from '@storyblok/react/rsc';

export interface SbAsset {
	filename?: string;
	alt?: string;
}

export type Blok<T = Record<string, unknown>> = SbBlokData & T;
