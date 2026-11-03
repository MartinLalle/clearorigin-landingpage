import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Les URLs publiques sont /en/, /es/, /pt/ (héritées de la version Astro)
	trailingSlash: true,
	// Largeurs demandées par sbSrc/sbSrcSet pour les images locales (src/lib/sb-image.ts)
	images: {
		deviceSizes: [390, 640, 680, 800, 1000, 1104, 1440, 1600, 1920],
		qualities: [75],
	},
	turbopack: {
		root: path.dirname(fileURLToPath(import.meta.url)),
	},
};

export default nextConfig;
