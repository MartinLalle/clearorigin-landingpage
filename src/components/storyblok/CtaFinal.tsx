import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';
import './cta-final.css';

type CtaFinalBlok = Blok<{
	title?: string;
	subtitle?: string;
	cta_label?: string;
	cta_link?: string;
	note?: string;
}>;

export default function CtaFinal({ blok }: { blok: CtaFinalBlok }) {
	return (
		<section
			className="section section--navy cta-final"
			id="cta"
			{...storyblokEditable(blok)}
		>
			<svg
				className="parcel-motif cta-final__motif"
				viewBox="0 0 340 300"
				aria-hidden="true"
			>
				<polygon points="30,90 130,20 280,45 310,170 220,270 70,250"></polygon>
				<circle cx="30" cy="90" r="3.5"></circle>
				<circle cx="130" cy="20" r="3.5"></circle>
				<circle cx="280" cy="45" r="3.5"></circle>
				<circle cx="310" cy="170" r="3.5"></circle>
				<circle cx="220" cy="270" r="3.5"></circle>
				<circle cx="70" cy="250" r="3.5"></circle>
			</svg>
			<div className="container cta-final__inner">
				<h2 className="cta-final__title">{blok.title}</h2>
				{blok.subtitle && <p className="cta-final__sub">{blok.subtitle}</p>}
				<div className="cta-final__actions">
					{blok.cta_label && (
						<a
							className="btn btn--primary"
							href={blok.cta_link || 'mailto:info@bfconsult.be'}
						>
							{blok.cta_label}
						</a>
					)}
				</div>
				{blok.note && <p className="geo-tag cta-final__note">{blok.note}</p>}
			</div>
		</section>
	);
}
