import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

const env = loadEnv(import.meta.env.MODE, process.cwd(), '');
const { STORYBLOK_DELIVERY_API_TOKEN, STORYBLOK_API_BASE_URL, STORYBLOK_REGION } = env;

export default defineConfig({
	devToolbar: {
		enabled: false,
	},
	integrations: [
		storyblok({
			accessToken: STORYBLOK_DELIVERY_API_TOKEN,
			apiOptions: {
				region: STORYBLOK_REGION || 'eu',
				endpoint: STORYBLOK_API_BASE_URL
					? `${new URL(STORYBLOK_API_BASE_URL).origin}/v2`
					: undefined,
			},
			components: {
				landing_page: 'storyblok/LandingPage',
				hero: 'storyblok/Hero',
				benefits: 'storyblok/Benefits',
				benefit_item: 'storyblok/BenefitItem',
				steps: 'storyblok/Steps',
				step_item: 'storyblok/StepItem',
				features_grid: 'storyblok/FeaturesGrid',
				feature_item: 'storyblok/FeatureItem',
				social_proof: 'storyblok/SocialProof',
				testimonial: 'storyblok/Testimonial',
				offer: 'storyblok/Offer',
				offer_item: 'storyblok/OfferItem',
				pricing: 'storyblok/Pricing',
				pricing_plan: 'storyblok/PricingPlan',
				guarantees: 'storyblok/Guarantees',
				guarantee_item: 'storyblok/GuaranteeItem',
				faq: 'storyblok/Faq',
				faq_item: 'storyblok/FaqItem',
				cta_final: 'storyblok/CtaFinal',
			},
		}),
	],
	output: 'static',
	vite: {
		plugins: [mkcert()],
	},
});
