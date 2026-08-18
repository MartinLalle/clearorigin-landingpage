import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './guarantee-item.css';

type GuaranteeItemBlok = Blok<{ title?: string; text?: string }>;

export default function GuaranteeItem({ blok }: { blok: GuaranteeItemBlok }) {
	return (
		<article className="guarantee reveal" {...storyblokEditable(blok)}>
			<svg
				className="guarantee__icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3Z"></path>
				<path d="M8.5 12l2.5 2.5 4.5-5"></path>
			</svg>
			<h3 className="guarantee__title">{blok.title}</h3>
			<p className="guarantee__text">{blok.text}</p>
		</article>
	);
}
