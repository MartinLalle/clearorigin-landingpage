import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './pricing-plan.css';

type PricingPlanBlok = Blok<{
	name?: string;
	price?: string;
	period?: string;
	description?: string;
	features?: string;
	highlight?: boolean;
	highlight_label?: string;
	cta_label?: string;
	cta_link?: string;
}>;

export default function PricingPlan({ blok }: { blok: PricingPlanBlok }) {
	const features = (blok.features || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	return (
		<article
			className={`card plan reveal${blok.highlight ? ' plan--highlight' : ''}`}
			{...storyblokEditable(blok)}
		>
			{blok.highlight && blok.highlight_label && (
				<p className="plan__flag">{blok.highlight_label}</p>
			)}
			<h3 className="plan__name">{blok.name}</h3>
			<p className="plan__price">
				<span className="plan__amount">{blok.price}</span>
				{blok.period && <span className="plan__period">/ {blok.period}</span>}
			</p>
			{blok.description && <p className="plan__desc">{blok.description}</p>}
			<ul className="plan__features">
				{features.map((feature) => (
					<li key={feature}>{feature}</li>
				))}
			</ul>
			{blok.cta_label && (
				<a
					className={`btn ${blok.highlight ? 'btn--primary' : 'btn--ghost'} plan__cta`}
					href={blok.cta_link || '#cta'}
				>
					{blok.cta_label}
				</a>
			)}
		</article>
	);
}
