import type { StaticImageData } from 'next/image';
import type { SbAsset } from '@/lib/types';

import fr from '../../storyblok/content/home.fr.json';
import en from '../../storyblok/content/home.en.json';
import es from '../../storyblok/content/home.es.json';
import pt from '../../storyblok/content/home.pt.json';

import demoImporter from '@/content/screenshots/demo-importer-2x.png';
import demoMap from '@/content/screenshots/demo-map-2x.png';
import pwaDocuments from '@/content/screenshots/pwa-documents.png';
import pwaLotCreate from '@/content/screenshots/pwa-lot-create.png';
import pwaParcelDraw from '@/content/screenshots/pwa-parcel-draw.png';
import pwaParcels from '@/content/screenshots/pwa-parcels.png';
import webappSuppliers from '@/content/screenshots/webapp-suppliers.png';

// Contenu servi depuis le repo (CONTENT_SOURCE ≠ "storyblok").
//
// Les fichiers storyblok/content/home.<lang>.json restent la source unique :
// ce sont eux que `npm run push:storyblok` envoie si le space est réactivé.
// Les placeholders `__ASSET__:<nom>` y sont résolus vers les images importées
// ci-dessus — une capture ajoutée au contenu doit donc être ajoutée ici.

const CONTENT: Record<string, unknown> = { fr, en, es, pt };

const IMAGES: Record<string, StaticImageData> = {
	'demo-importer-2x.png': demoImporter,
	'demo-map-2x.png': demoMap,
	'pwa-documents.png': pwaDocuments,
	'pwa-lot-create.png': pwaLotCreate,
	'pwa-parcel-draw.png': pwaParcelDraw,
	'pwa-parcels.png': pwaParcels,
	'webapp-suppliers.png': webappSuppliers,
};

function toAsset(name: string): SbAsset | null {
	const image = IMAGES[name];
	if (!image) throw new Error(`Image inconnue dans le contenu : ${name}`);
	return { filename: image.src, width: image.width, height: image.height, alt: '' };
}

/** Clone le contenu en résolvant les images et en donnant un _uid stable à chaque blok. */
function hydrate(node: unknown, path: string): unknown {
	if (Array.isArray(node)) return node.map((child, i) => hydrate(child, `${path}-${i}`));
	if (typeof node === 'string' && node.startsWith('__ASSET__:')) {
		return toAsset(node.slice('__ASSET__:'.length));
	}
	if (!node || typeof node !== 'object') return node;
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(node)) out[key] = hydrate(value, `${path}.${key}`);
	if ('component' in out && !out._uid) out._uid = path;
	return out;
}

export function getLocalStory(lang: string) {
	const content = CONTENT[lang] ?? CONTENT.fr;
	return { name: 'Home', slug: 'home', content: hydrate(content, 'home') };
}
