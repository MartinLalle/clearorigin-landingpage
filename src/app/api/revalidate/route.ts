import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { getStoryblokApi } from '@/lib/storyblok';
import {
	getLandingStory,
	STORYBLOK_CACHE_TAG,
	STORYBLOK_CACHE_TTL,
} from '@/lib/getLandingStory';

// Webhook Storyblok (story.published / story.unpublished / story.deleted) :
// POST https://<domaine>/api/revalidate/?secret=<STORYBLOK_REVALIDATE_SECRET>
//
// ⚠️ Le `/` final avant le `?` est OBLIGATOIRE : le projet est en
// `trailingSlash: true`, donc `/api/revalidate?secret=...` renvoie un 308 que
// l'émetteur du webhook ne suit pas forcément en POST — la purge n'a alors
// jamais lieu, silencieusement.
//
// Diagnostic (ne purge rien) : GET /api/revalidate/?secret=...&debug=1

// Chemins RÉELLEMENT prérendus (cf. generateStaticParams dans layout.tsx).
// On purge les chemins littéraux et pas seulement le motif de route : Next
// associe l'entrée prérendue au tag de son chemin réel (`_N_T_/`, avec un cas
// spécial `_N_T_/index` pour la racine), pas à `_N_T_/[[...lang]]/page`. Purger
// uniquement le motif laissait `/` intacte — c'était le bug.
const PRERENDERED_PATHS = ['/', '/en', '/es', '/pt'];

type AuthResult = { ok: true } | { ok: false; status: number; reason: string };

function authorize(request: NextRequest): AuthResult {
	const expected = process.env.STORYBLOK_REVALIDATE_SECRET;

	if (!expected) {
		return {
			ok: false,
			status: 503,
			reason:
				'STORYBLOK_REVALIDATE_SECRET absent de cet environnement (Vercel → Settings → Environment Variables, puis redéployer).',
		};
	}

	const provided =
		request.nextUrl.searchParams.get('secret') ??
		request.headers.get('x-webhook-secret');

	if (provided !== expected) {
		return {
			ok: false,
			status: 401,
			reason: provided
				? 'Secret fourni mais différent de STORYBLOK_REVALIDATE_SECRET.'
				: 'Aucun secret fourni (query `secret` ou header `x-webhook-secret`).',
		};
	}

	return { ok: true };
}

// Lit la story en contournant tous les caches, pour la comparer à ce que sert
// le Data Cache. Si les deux diffèrent, le coupable est identifié sans deviner.
async function readLive() {
	const { data } = await getStoryblokApi().get(
		'cdn/stories/home',
		{ version: 'published', fallback_lang: 'default' },
		{ cache: 'no-store' },
	);
	return data.story;
}

async function debugReport() {
	const [live, cached] = await Promise.all([
		readLive().catch((e) => ({ error: String(e) })),
		getLandingStory('fr').catch((e) => ({ error: String(e) })),
	]);

	const label = (s: { content?: { body?: { cta_label?: string }[] } }) =>
		s?.content?.body?.[0]?.cta_label ?? null;

	return {
		commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
		env: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
		fetchTtl: STORYBLOK_CACHE_TTL,
		prerenderedPaths: PRERENDERED_PATHS,
		live: { cta_label: label(live), published_at: live?.published_at ?? null },
		cached: {
			cta_label: label(cached),
			published_at: cached?.published_at ?? null,
		},
		dataCacheStale: label(live) !== label(cached),
	};
}

async function handle(request: NextRequest) {
	const auth = authorize(request);

	if (!auth.ok) {
		// Visible dans Vercel → Logs : prouve que l'appel arrive, et pourquoi il est rejeté
		console.warn('[revalidate] rejeté', {
			status: auth.status,
			reason: auth.reason,
			ua: request.headers.get('user-agent'),
		});
		return Response.json(
			{ revalidated: false, reason: auth.reason },
			{ status: auth.status },
		);
	}

	if (request.nextUrl.searchParams.get('debug') === '1') {
		const report = await debugReport();
		console.log('[revalidate] debug', report);
		return Response.json({ revalidated: false, debug: report });
	}

	// Purger les DEUX couches, dans cet ordre : le Data Cache du fetch d'abord,
	// sinon une page régénérée relirait la story depuis le cache et serait
	// reconstruite avec l'ancien contenu.
	revalidateTag(STORYBLOK_CACHE_TAG, { expire: 0 });
	for (const path of PRERENDERED_PATHS) revalidatePath(path);
	// Filet : couvre le cas où l'entrée serait indexée sur le motif de route
	revalidatePath('/[[...lang]]', 'page');

	// Le payload Storyblok est informatif : la purge est globale de toute façon
	let action: string | undefined;
	try {
		const body = await request.clone().json();
		action = body?.action;
	} catch {
		// GET manuel, ou body vide : sans importance
	}

	console.log('[revalidate] ok', {
		action,
		tag: STORYBLOK_CACHE_TAG,
		paths: PRERENDERED_PATHS,
		ua: request.headers.get('user-agent'),
	});

	return Response.json({
		revalidated: true,
		tag: STORYBLOK_CACHE_TAG,
		paths: PRERENDERED_PATHS,
		action: action ?? null,
		now: Date.now(),
	});
}

export async function POST(request: NextRequest) {
	return handle(request);
}

// Pratique pour déclencher/diagnostiquer une purge à la main (curl, navigateur)
export async function GET(request: NextRequest) {
	return handle(request);
}
