import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { STORYBLOK_CACHE_TAG } from '@/lib/getLandingStory';

// Webhook Storyblok (story.published / story.unpublished) :
// POST https://<domaine>/api/revalidate/?secret=<STORYBLOK_REVALIDATE_SECRET>
// Purge le cache de la story et des 4 routes prérendues, sans redéploiement.

function revalidateLanding() {
	// expire: 0 → purge immédiate (cas webhook, cf. doc revalidateTag)
	revalidateTag(STORYBLOK_CACHE_TAG, { expire: 0 });
	// Ceinture + bretelles : la route est prérendue pour /, /en/, /es/, /pt/
	revalidatePath('/[[...lang]]', 'page');
}

function isAuthorized(request: NextRequest) {
	const secret = process.env.STORYBLOK_REVALIDATE_SECRET;
	if (!secret) return false;
	return request.nextUrl.searchParams.get('secret') === secret;
}

export async function POST(request: NextRequest) {
	if (!isAuthorized(request)) {
		return Response.json({ revalidated: false }, { status: 401 });
	}

	revalidateLanding();

	return Response.json({ revalidated: true, now: Date.now() });
}

// Pratique pour déclencher une purge à la main depuis un navigateur / curl
export async function GET(request: NextRequest) {
	return POST(request);
}
