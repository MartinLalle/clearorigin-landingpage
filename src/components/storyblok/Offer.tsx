import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './offer.css';

type OfferBlok = Blok<{
	eyebrow?: string;
	title?: string;
	intro?: string;
	items?: Blok[];
	bonus_title?: string;
	bonus_text?: string;
}>;

export default function Offer({ blok }: { blok: OfferBlok }) {
	return (
		<section className="section" id="offer" {...storyblokEditable(blok)}>
			<div className="container offer__inner">
				<div>
					{blok.eyebrow && <p className="eyebrow">{blok.eyebrow}</p>}
					<h2 className="section-title">{blok.title}</h2>
					{blok.intro && <p className="section-intro">{blok.intro}</p>}
					<ul className="offer__list">
						{blok.items?.map((item) => (
							<StoryblokServerComponent blok={item} key={item._uid} />
						))}
					</ul>
				</div>
				{blok.bonus_title && (
					<aside className="offer__bonus reveal">
						<p className="offer__bonus-kicker geo-tag">+ Bonus</p>
						<h3 className="offer__bonus-title">{blok.bonus_title}</h3>
						<p className="offer__bonus-text">{blok.bonus_text}</p>
					</aside>
				)}
			</div>
		</section>
	);
}
