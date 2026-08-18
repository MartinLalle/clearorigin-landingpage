import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './faq-item.css';

type FaqItemBlok = Blok<{ question?: string; answer?: string }>;

export default function FaqItem({ blok }: { blok: FaqItemBlok }) {
	return (
		<details className="faq-item" {...storyblokEditable(blok)}>
			<summary className="faq-item__question">
				{blok.question}
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					aria-hidden="true"
				>
					<path d="M6 9l6 6 6-6"></path>
				</svg>
			</summary>
			<p className="faq-item__answer">{blok.answer}</p>
		</details>
	);
}
