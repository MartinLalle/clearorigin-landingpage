import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Les URLs publiques sont /en/, /es/, /pt/ (héritées de la version Astro)
	trailingSlash: true,
	turbopack: {
		root: path.dirname(fileURLToPath(import.meta.url)),
	},
};

export default nextConfig;
