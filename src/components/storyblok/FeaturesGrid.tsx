import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './features-grid.css';

type FeaturesGridBlok = Blok<{
	eyebrow?: string;
	title?: string;
	intro?: string;
	items?: Blok[];
}>;

export default function FeaturesGrid({ blok }: { blok: FeaturesGridBlok }) {
	return (
		<section
			className="section section--mist"
			id="features"
			{...storyblokEditable(blok)}
		>
			<div className="container">
				{blok.eyebrow && <p className="eyebrow">{blok.eyebrow}</p>}
				<h2 className="section-title">{blok.title}</h2>
				{blok.intro && <p className="section-intro">{blok.intro}</p>}
				<div className="features__grid">
					{blok.items?.map((item) => (
						<StoryblokServerComponent blok={item} key={item._uid} />
					))}
				</div>
			</div>
		</section>
	);
}
