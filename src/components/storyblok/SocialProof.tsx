import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './social-proof.css';

type StatBlok = Blok<{ value?: string; label?: string }>;

type SocialProofBlok = Blok<{
	eyebrow?: string;
	title?: string;
	intro?: string;
	stats?: StatBlok[];
	testimonials?: Blok[];
}>;

export default function SocialProof({ blok }: { blok: SocialProofBlok }) {
	return (
		<section
			className="section section--navy"
			id="proof"
			{...storyblokEditable(blok)}
		>
			<div className="container">
				{blok.eyebrow && <p className="eyebrow">{blok.eyebrow}</p>}
				<h2 className="section-title">{blok.title}</h2>
				{blok.intro && <p className="section-intro">{blok.intro}</p>}

				{blok.stats && blok.stats.length > 0 && (
					<dl className="proof__stats">
						{blok.stats.map((stat) => (
							<div
								className="proof__stat"
								key={stat._uid}
								{...storyblokEditable(stat)}
							>
								<dd>{stat.value}</dd>
								<dt>{stat.label}</dt>
							</div>
						))}
					</dl>
				)}

				<div className="proof__quotes">
					{blok.testimonials?.map((item) => (
						<StoryblokServerComponent blok={item} key={item._uid} />
					))}
				</div>
			</div>
		</section>
	);
}
