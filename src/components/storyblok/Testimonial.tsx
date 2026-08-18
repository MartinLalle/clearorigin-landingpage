import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './testimonial.css';

type TestimonialBlok = Blok<{ quote?: string; author?: string; role?: string }>;

export default function Testimonial({ blok }: { blok: TestimonialBlok }) {
	return (
		<figure className="quote reveal" {...storyblokEditable(blok)}>
			<blockquote className="quote__text">“{blok.quote}”</blockquote>
			<figcaption className="quote__author">
				<strong>{blok.author}</strong>
				{blok.role && <span className="geo-tag quote__role">{blok.role}</span>}
			</figcaption>
		</figure>
	);
}
