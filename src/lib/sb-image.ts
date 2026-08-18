/**
 * Helpers pour le service d'images Storyblok (resize au CDN via le
 * segment `/m/<w>x<h>`). Les URLs d'assets encodent les dimensions
 * source (`/f/<space>/2880x1800/<hash>/…`), exploitées pour width/height.
 */

const DIMS = /\/(\d+)x(\d+)\//;

export function sbDims(
	filename: string,
): { width: number; height: number } | undefined {
	const match = DIMS.exec(filename);
	return match
		? { width: Number(match[1]), height: Number(match[2]) }
		: undefined;
}

export function sbSrc(filename: string, width: number): string {
	return `${filename}/m/${width}x0`;
}

export function sbSrcSet(filename: string, widths: number[]): string {
	return widths.map((w) => `${sbSrc(filename, w)} ${w}w`).join(', ');
}
