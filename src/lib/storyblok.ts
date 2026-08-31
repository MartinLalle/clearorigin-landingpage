import { storyblokInit, apiPlugin } from '@storyblok/react/rsc';

import LandingPage from '@/components/storyblok/LandingPage';
import Hero from '@/components/storyblok/Hero';
import Benefits from '@/components/storyblok/Benefits';
import BenefitItem from '@/components/storyblok/BenefitItem';
import Steps from '@/components/storyblok/Steps';
import StepItem from '@/components/storyblok/StepItem';
import FeaturesGrid from '@/components/storyblok/FeaturesGrid';
import FeatureItem from '@/components/storyblok/FeatureItem';
import SocialProof from '@/components/storyblok/SocialProof';
import Testimonial from '@/components/storyblok/Testimonial';
import Offer from '@/components/storyblok/Offer';
import OfferItem from '@/components/storyblok/OfferItem';
import Guarantees from '@/components/storyblok/Guarantees';
import GuaranteeItem from '@/components/storyblok/GuaranteeItem';
import Faq from '@/components/storyblok/Faq';
import FaqItem from '@/components/storyblok/FaqItem';
import CtaFinal from '@/components/storyblok/CtaFinal';

export const getStoryblokApi = storyblokInit({
	accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
	use: [apiPlugin],
	apiOptions: {
		region: process.env.STORYBLOK_REGION || 'eu',
		endpoint: process.env.STORYBLOK_API_BASE_URL
			? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
			: undefined,
		// ⚠️ NE PAS RETIRER — c'était la cause du contenu figé en production.
		//
		// storyblok-js-client garde le `cv` (content version) dans un objet au
		// niveau du module, donc partagé par toutes les requêtes d'une même
		// instance serveur (cf. `cacheVersions` dans son index.mjs). Avec le
		// défaut `cv: 'auto'`, il réattache ce `cv` mémorisé à chaque appel
		// suivant : l'instance reçoit alors éternellement le snapshot de la
		// version qu'elle a vue en premier. Et le flush n'a lieu qu'avec
		// `clear: 'auto'`, alors que le défaut est `'manual'` — donc jamais.
		//
		// Symptôme : après une publication, certaines instances servaient le
		// nouveau contenu et d'autres l'ancien (mesuré 18/6 sur 24 requêtes
		// parallèles). Seul un redéploiement « réparait », en repartant
		// d'instances neuves. Aucun cache Next n'était en cause.
		cache: {
			type: 'none', // pas de mémorisation des réponses
			clear: 'auto', // vider si le cv change malgré tout
			cv: 'manual', // ne jamais réattacher un cv mémorisé
		},
	},
	components: {
		landing_page: LandingPage,
		hero: Hero,
		benefits: Benefits,
		benefit_item: BenefitItem,
		steps: Steps,
		step_item: StepItem,
		features_grid: FeaturesGrid,
		feature_item: FeatureItem,
		social_proof: SocialProof,
		testimonial: Testimonial,
		offer: Offer,
		offer_item: OfferItem,
		guarantees: Guarantees,
		guarantee_item: GuaranteeItem,
		faq: Faq,
		faq_item: FaqItem,
		cta_final: CtaFinal,
	},
});
