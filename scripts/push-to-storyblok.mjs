/**
 * Pousse tout vers le space Storyblok via la Management API :
 *   1. Langues du space (en, es, pt — fr = langue par défaut)
 *   2. Composants (storyblok/components.json)
 *   3. Assets (screenshots/ — placeholders __ASSET__:<nom> dans le contenu)
 *   4. Story `home` (contenu FR + traductions field-level __i18n__)
 *   5. URL de preview du Visual Editor
 *
 * Auth : STORYBLOK_MANAGEMENT_TOKEN (personal access token) en variable
 * d'environnement, sinon le token stocké par `storyblok login` dans
 * ~/.storyblok/credentials.json.
 *
 * Usage : node scripts/push-to-storyblok.mjs [--skip-assets] [--no-publish]
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '294620695570259';
const MAPI = 'https://mapi.storyblok.com/v1';
const PREVIEW_URL = 'https://localhost:4321/';
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || path.join(ROOT, 'screenshots');
const LANGS = [
	{ code: 'en', name: 'English' },
	{ code: 'es', name: 'Español' },
	{ code: 'pt', name: 'Português' },
];

const args = new Set(process.argv.slice(2));
const skipAssets = args.has('--skip-assets');
const publish = !args.has('--no-publish');

// ---------- auth ----------

function getToken() {
	if (process.env.STORYBLOK_MANAGEMENT_TOKEN) return process.env.STORYBLOK_MANAGEMENT_TOKEN;
	const credPath = path.join(os.homedir(), '.storyblok', 'credentials.json');
	if (fs.existsSync(credPath)) {
		const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
		// La CLI stocke { "<region-or-email>": { password/token ... } } — on prend le premier token trouvé
		for (const entry of Object.values(creds)) {
			if (typeof entry === 'string') return entry;
			if (entry && typeof entry === 'object') {
				const token = entry.password || entry.token || entry.access_token;
				if (token) return token;
			}
		}
	}
	console.error(
		'Aucun token Management API. Exporte STORYBLOK_MANAGEMENT_TOKEN ou lance `npx storyblok@latest login`.'
	);
	process.exit(1);
}

const TOKEN = getToken();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mapi(method, endpoint, body, attempt = 0) {
	const res = await fetch(`${MAPI}${endpoint}`, {
		method,
		headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});
	if (res.status === 429 && attempt < 5) {
		await sleep(1200);
		return mapi(method, endpoint, body, attempt + 1);
	}
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`${method} ${endpoint} -> ${res.status}: ${text}`);
	}
	await sleep(200); // rate limit MAPI ~6 req/s
	return res.status === 204 ? null : res.json();
}

// ---------- 1. langues ----------

async function pushLanguages() {
	await mapi('PUT', `/spaces/${SPACE_ID}`, { space: { languages: LANGS } });
	console.log(`✔ Langues du space : fr (défaut) + ${LANGS.map((l) => l.code).join(', ')}`);
}

// ---------- 2. composants ----------

function loadComponentDefs() {
	return JSON.parse(fs.readFileSync(path.join(ROOT, 'storyblok', 'components.json'), 'utf8'));
}

async function pushComponents(defs) {
	const existing = (await mapi('GET', `/spaces/${SPACE_ID}/components/`)).components;
	const byName = new Map(existing.map((c) => [c.name, c]));
	for (const def of defs) {
		const found = byName.get(def.name);
		if (found) {
			await mapi('PUT', `/spaces/${SPACE_ID}/components/${found.id}`, { component: def });
			console.log(`✔ Composant mis à jour : ${def.name}`);
		} else {
			await mapi('POST', `/spaces/${SPACE_ID}/components/`, { component: def });
			console.log(`✔ Composant créé : ${def.name}`);
		}
	}
}

// ---------- 3. assets ----------

function pngSize(buffer) {
	// IHDR : largeur/hauteur en big-endian aux offsets 16 et 20
	if (buffer.length > 24 && buffer.toString('ascii', 12, 16) === 'IHDR') {
		return `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;
	}
	return undefined;
}

async function uploadAsset(filePath) {
	const filename = path.basename(filePath);
	const buffer = fs.readFileSync(filePath);
	const signed = await mapi('POST', `/spaces/${SPACE_ID}/assets/`, {
		filename,
		size: filename.endsWith('.png') ? pngSize(buffer) : undefined,
		validate_upload: 1,
	});
	const form = new FormData();
	for (const [key, value] of Object.entries(signed.fields)) form.append(key, value);
	form.append('file', new Blob([buffer]), filename);
	const s3 = await fetch(signed.post_url, { method: 'POST', body: form });
	if (!s3.ok) throw new Error(`Upload S3 échoué pour ${filename}: ${s3.status}`);
	await mapi('GET', `/spaces/${SPACE_ID}/assets/${signed.id}/finish_upload`);
	const asset = await mapi('GET', `/spaces/${SPACE_ID}/assets/${signed.id}`);
	console.log(`✔ Asset uploadé : ${filename} -> ${asset.filename}`);
	return asset;
}

async function pushAssets() {
	/** @type {Map<string, {id:number, filename:string}>} */
	const map = new Map();
	// Réutilise les assets déjà présents dans le space (match sur le nom de fichier)
	const existing = (await mapi('GET', `/spaces/${SPACE_ID}/assets/?per_page=100`)).assets || [];
	for (const asset of existing) {
		map.set(decodeURIComponent(asset.filename.split('/').pop()), asset);
	}
	if (!skipAssets && fs.existsSync(SCREENSHOTS_DIR)) {
		for (const file of fs.readdirSync(SCREENSHOTS_DIR)) {
			if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
			if (map.has(file)) {
				console.log(`— Asset déjà présent, réutilisé : ${file}`);
				continue;
			}
			map.set(file, await uploadAsset(path.join(SCREENSHOTS_DIR, file)));
		}
	}
	return map;
}

// ---------- 4. story ----------

function loadContent(lang) {
	const file = path.join(ROOT, 'storyblok', 'content', `home.${lang}.json`);
	return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

function buildTranslatableMap(defs) {
	const map = new Map();
	for (const def of defs) {
		const fields = new Set(
			Object.entries(def.schema)
				.filter(([, field]) => field.translatable)
				.map(([name]) => name)
		);
		map.set(def.name, fields);
	}
	return map;
}

/** Fusionne les traductions dans l'arbre FR via les suffixes __i18n__<lang>. */
function mergeTranslations(frNode, langNode, lang, translatable) {
	if (!frNode || !langNode || typeof frNode !== 'object') return;
	const fields = translatable.get(frNode.component) || new Set();
	for (const [key, frValue] of Object.entries(frNode)) {
		if (Array.isArray(frValue)) {
			const langArr = Array.isArray(langNode[key]) ? langNode[key] : [];
			frValue.forEach((child, i) => mergeTranslations(child, langArr[i], lang, translatable));
		} else if (fields.has(key) && typeof langNode[key] === 'string' && langNode[key] !== frValue) {
			frNode[`${key}__i18n__${lang}`] = langNode[key];
		}
	}
}

/** Remplace les placeholders __ASSET__:<nom> par de vrais objets asset Storyblok. */
function resolveAssets(node, assets, missing) {
	if (Array.isArray(node)) {
		node.forEach((child) => resolveAssets(child, assets, missing));
		return;
	}
	if (!node || typeof node !== 'object') return;
	for (const [key, value] of Object.entries(node)) {
		if (typeof value === 'string' && value.startsWith('__ASSET__:')) {
			const name = value.slice('__ASSET__:'.length);
			const asset = assets.get(name);
			if (asset) {
				node[key] = {
					id: asset.id,
					alt: asset.alt || '',
					name: '',
					focus: '',
					title: '',
					filename: asset.filename,
					copyright: '',
					fieldtype: 'asset',
				};
			} else {
				missing.add(name);
				node[key] = null;
			}
		} else if (value && typeof value === 'object') {
			resolveAssets(value, assets, missing);
		}
	}
}

async function pushStory(content) {
	const search = await mapi('GET', `/spaces/${SPACE_ID}/stories/?with_slug=home`);
	const payload = {
		story: { name: 'Home', slug: 'home', content, path: '/' },
		...(publish ? { publish: 1 } : {}),
	};
	if (search.stories?.length) {
		const id = search.stories[0].id;
		await mapi('PUT', `/spaces/${SPACE_ID}/stories/${id}`, payload);
		console.log(`✔ Story home mise à jour (id ${id})${publish ? ' + publiée' : ''}`);
	} else {
		const created = await mapi('POST', `/spaces/${SPACE_ID}/stories/`, payload);
		console.log(`✔ Story home créée (id ${created.story.id})${publish ? ' + publiée' : ''}`);
	}
}

// ---------- 5. preview URL ----------

async function setPreviewUrl() {
	await mapi('PUT', `/spaces/${SPACE_ID}`, {
		space: { environments: [{ name: 'Dev', location: PREVIEW_URL }] },
	});
	console.log(`✔ Preview URL du Visual Editor : ${PREVIEW_URL}`);
}

// ---------- main ----------

const defs = loadComponentDefs();
await pushLanguages();
await pushComponents(defs);
const assets = await pushAssets();

const content = loadContent('fr');
if (!content) {
	console.error('storyblok/content/home.fr.json introuvable.');
	process.exit(1);
}
const translatable = buildTranslatableMap(defs);
for (const { code } of LANGS) {
	const langContent = loadContent(code);
	if (langContent) {
		mergeTranslations(content, langContent, code, translatable);
		console.log(`✔ Traductions fusionnées : ${code}`);
	} else {
		console.warn(`⚠ Pas de fichier de traduction pour ${code}, champs en fallback FR.`);
	}
}
const missing = new Set();
resolveAssets(content, assets, missing);
if (missing.size) {
	console.warn(`⚠ Assets manquants (champs laissés vides) : ${[...missing].join(', ')}`);
}

await pushStory(content);
await setPreviewUrl();
console.log('\nTerminé. Ouvre https://app.storyblok.com et vérifie la story home.');
