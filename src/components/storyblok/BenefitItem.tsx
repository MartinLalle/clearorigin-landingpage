import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './benefit-item.css';

const ICONS: Record<string, string> = {
	'map-pin':
		'M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
	'file-check': 'M6 2h9l5 5v15H6V2Zm8 0v6h6M9.5 14.5l2 2 4-4.5',
	satellite:
		'M13 7 17 3l4 4-4 4m-8 2-4 4 4 4 4-4m-5-5 6 6m2.5-8.5 3 3M4.5 13.5l3 3',
	share:
		'M18 8a3 3 0 1 0-2.8-4M18 8a3 3 0 0 1-2.8-2M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0-2.8-4M8.7 10.7l6.6-3.4m-6.6 6 6.6 3.4',
	shield:
		'M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3Zm-3.5 10 2.5 2.5 4.5-5',
	clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v6l4 2',
};

type BenefitItemBlok = Blok<{ icon?: string; title?: string; text?: string }>;

export default function BenefitItem({ blok }: { blok: BenefitItemBlok }) {
	const iconPath = ICONS[blok.icon ?? ''] || ICONS['map-pin'];

	return (
		<article className="card benefit reveal" {...storyblokEditable(blok)}>
			<span className="benefit__icon" aria-hidden="true">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d={iconPath}></path>
				</svg>
			</span>
			<h3 className="benefit__title">{blok.title}</h3>
			<p className="benefit__text">{blok.text}</p>
		</article>
	);
}
