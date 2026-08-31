import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { STORYBLOK_CACHE_TAG } from '@/lib/getLandingStory';

// Webhook Storyblok (story.published / story.unpublished / story.deleted) :
// POST https://<domaine>/api/revalidate/?secret=<STORYBLOK_REVALIDATE_SECRET>
//
// ⚠️ Le `/` final avant le `?` est OBLIGATOIRE : le projet est en
// `trailingSlash: true`, donc `/api/revalidate?secret=...` renvoie un 308 que
// l'émetteur du webhook ne suit pas forcément en POST — la purge n'a alors
// jamais lieu, silencieusement.

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

	// Les DEUX couches doivent être purgées, dans cet ordre : le Data Cache du
	// fetch d'abord, sinon la page régénérée relirait la story depuis le cache et
	// serait reconstruite avec l'ancien contenu.
	revalidateTag(STORYBLOK_CACHE_TAG, { expire: 0 });
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
		path: '/[[...lang]]',
		ua: request.headers.get('user-agent'),
	});

	return Response.json({
		revalidated: true,
		tag: STORYBLOK_CACHE_TAG,
		path: '/[[...lang]]',
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
