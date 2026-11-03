import type { SbAsset } from '@/lib/types';

/**
 * Helpers d'images, pour les deux sources de contenu :
 * - asset Storyblok : resize au CDN via le segment `/m/<w>x<h>` ; les URLs
 *   encodent les dimensions source (`/f/<space>/2880x1800/<hash>/…`) ;
 * - image locale (import statique, cf. local-content.ts) : resize par
 *   l'optimiseur Next (`/_next/image/`, avec le / final imposé par trailingSlash) ; les largeurs demandées doivent être
 *   dans `images.deviceSizes` (next.config.ts), et les dimensions sont
 *   portées par l'asset.
 */

const DIMS = /\/(\d+)x(\d+)\//;

const isStoryblok = (filename: string) => /^https?:\/\/[^/]*storyblok\.com\//.test(filename);

export function sbDims(asset: SbAsset): { width: number; height: number } | undefined {
	if (asset.width && asset.height) return { width: asset.width, height: asset.height };
	const match = asset.filename ? DIMS.exec(asset.filename) : null;
	return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined;
}

export function sbSrc(asset: SbAsset, width: number): string {
	const filename = asset.filename ?? '';
	return isStoryblok(filename)
		? `${filename}/m/${width}x0`
		: `/_next/image/?url=${encodeURIComponent(filename)}&w=${width}&q=75`;
}

export function sbSrcSet(asset: SbAsset, widths: number[]): string {
	return widths.map((w) => `${sbSrc(asset, w)} ${w}w`).join(', ');
}
