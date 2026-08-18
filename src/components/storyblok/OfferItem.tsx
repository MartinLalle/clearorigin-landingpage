import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './offer-item.css';

type OfferItemBlok = Blok<{ title?: string; text?: string }>;

export default function OfferItem({ blok }: { blok: OfferItemBlok }) {
	return (
		<li className="offer-item reveal" {...storyblokEditable(blok)}>
			<svg
				className="offer-item__check"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M4 12.5l5 5L20 6.5"></path>
			</svg>
			<div>
				<strong className="offer-item__title">{blok.title}</strong>
				{blok.text && <p className="offer-item__text">{blok.text}</p>}
			</div>
		</li>
	);
}
