import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './pricing.css';

type PricingBlok = Blok<{
	eyebrow?: string;
	title?: string;
	intro?: string;
	plans?: Blok[];
	note?: string;
}>;

export default function Pricing({ blok }: { blok: PricingBlok }) {
	return (
		<section
			className="section section--mist"
			id="pricing"
			{...storyblokEditable(blok)}
		>
			<div className="container">
				{blok.eyebrow && <p className="eyebrow">{blok.eyebrow}</p>}
				<h2 className="section-title">{blok.title}</h2>
				{blok.intro && <p className="section-intro">{blok.intro}</p>}
				<div className="pricing__grid">
					{blok.plans?.map((plan) => (
						<StoryblokServerComponent blok={plan} key={plan._uid} />
					))}
				</div>
				{blok.note && <p className="geo-tag pricing__note">{blok.note}</p>}
			</div>
		</section>
	);
}
