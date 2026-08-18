import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './faq.css';

type FaqBlok = Blok<{
	eyebrow?: string;
	title?: string;
	intro?: string;
	items?: Blok[];
}>;

export default function Faq({ blok }: { blok: FaqBlok }) {
	return (
		<section
			className="section section--mist"
			id="faq"
			{...storyblokEditable(blok)}
		>
			<div className="container faq__inner">
				<div>
					{blok.eyebrow && <p className="eyebrow">{blok.eyebrow}</p>}
					<h2 className="section-title">{blok.title}</h2>
					{blok.intro && <p className="section-intro">{blok.intro}</p>}
				</div>
				<div className="faq__list">
					{blok.items?.map((item) => (
						<StoryblokServerComponent blok={item} key={item._uid} />
					))}
				</div>
			</div>
		</section>
	);
}
