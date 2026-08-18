import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './steps.css';

type StepsBlok = Blok<{
	eyebrow?: string;
	title?: string;
	intro?: string;
	items?: Blok[];
}>;

export default function Steps({ blok }: { blok: StepsBlok }) {
	return (
		<section className="section" id="how" {...storyblokEditable(blok)}>
			<div className="container">
				{blok.eyebrow && <p className="eyebrow">{blok.eyebrow}</p>}
				<h2 className="section-title">{blok.title}</h2>
				{blok.intro && <p className="section-intro">{blok.intro}</p>}
				<ol className="steps__list">
					{blok.items?.map((item, index) => (
						<StoryblokServerComponent
							blok={item}
							index={index}
							key={item._uid}
						/>
					))}
				</ol>
			</div>
		</section>
	);
}
