import type { NextRequest } from 'next/server';
import { getStoryblokApi } from '@/lib/storyblok';
import { getLandingStory } from '@/lib/getLandingStory';

// Endpoint appelé par le webhook Storyblok :
// POST https://<domaine>/api/revalidate/?secret=<STORYBLOK_REVALIDATE_SECRET>
//
// ⚠️ Le `/` final avant le `?` est OBLIGATOIRE : le projet est en
// `trailingSlash: true`, donc `/api/revalidate?secret=...` renvoie un 308 que
// l'émetteur du webhook ne suit pas forcément en POST.
//
// Depuis le passage de la page en `force-dynamic`, il n'y a PLUS RIEN à purger :
// chaque requête relit Storyblok. L'endpoint est conservé parce qu'il répond
// 200 au webhook (Storyblok désactive un webhook qui échoue en boucle) et
// surtout parce qu'il porte le mode diagnostic ci-dessous.
//
// Diagnostic : GET /api/revalidate/?secret=...&debug=1

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

// Lit la story en contournant explicitement tout cache, pour la comparer à ce
// que renvoie le chemin de rendu normal. Si les deux diffèrent, un cache s'est
// réintroduit quelque part.
async function readLive() {
	const { data } = await getStoryblokApi().get(
		'cdn/stories/home',
		{ version: 'published', fallback_lang: 'default' },
		{ cache: 'no-store' },
	);
	return data.story;
}

async function debugReport() {
	const [live, rendered] = await Promise.all([
		readLive().catch((e) => ({ error: String(e) })),
		getLandingStory('fr').catch((e) => ({ error: String(e) })),
	]);

	const label = (s: { content?: { body?: { cta_label?: string }[] } }) =>
		s?.content?.body?.[0]?.cta_label ?? null;

	return {
		commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
		env: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
		mode: 'force-dynamic',
		live: { cta_label: label(live), published_at: live?.published_at ?? null },
		rendered: {
			cta_label: label(rendered),
			published_at: rendered?.published_at ?? null,
		},
		mismatch: label(live) !== label(rendered),
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
		return Response.json({ ok: true, debug: report });
	}

	let action: string | undefined;
	try {
		const body = await request.clone().json();
		action = body?.action;
	} catch {
		// GET manuel, ou body vide : sans importance
	}

	console.log('[revalidate] webhook reçu', {
		action,
		ua: request.headers.get('user-agent'),
	});

	return Response.json({
		ok: true,
		purgeRequired: false,
		reason:
			'La page est en rendu dynamique : chaque requête relit Storyblok, aucune purge nécessaire.',
		action: action ?? null,
		now: Date.now(),
	});
}

export async function POST(request: NextRequest) {
	return handle(request);
}

export async function GET(request: NextRequest) {
	return handle(request);
}
