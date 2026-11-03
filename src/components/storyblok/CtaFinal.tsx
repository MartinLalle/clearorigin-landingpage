import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
import { sbDims, sbSrc, sbSrcSet } from '@/lib/sb-image';
import './cta-final.css';

type CtaFinalBlok = Blok<{
	flag?: string;
	title?: string;
	subtitle?: string;
	bullets?: string;
	cta_label?: string;
	cta_link?: string;
	secondary_label?: string;
	secondary_link?: string;
	image?: SbAsset;
	image_caption?: string;
	note?: string;
}>;

export default function CtaFinal({ blok }: { blok: CtaFinalBlok }) {
	const bullets = (blok.bullets || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

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
				<div className="cta-final__copy">
					{blok.flag && <p className="cta-final__flag">{blok.flag}</p>}
					<h2 className="cta-final__title">{blok.title}</h2>
					{blok.subtitle && <p className="cta-final__sub">{blok.subtitle}</p>}
					{bullets.length > 0 && (
						<ul className="cta-final__points">
							{bullets.map((point) => (
								<li key={point}>{point}</li>
							))}
						</ul>
					)}
					<div className="cta-final__actions">
						{blok.cta_label && (
							<a
								className="btn btn--primary"
								href={blok.cta_link || 'mailto:info@bfconsult.be'}
							>
								{blok.cta_label}
							</a>
						)}
						{blok.secondary_label && blok.secondary_link && (
							<a
								className="btn btn--ghost"
								href={blok.secondary_link}
								target="_blank"
								rel="noreferrer"
							>
								{blok.secondary_label}
							</a>
						)}
					</div>
					{blok.note && <p className="geo-tag cta-final__note">{blok.note}</p>}
				</div>
				{blok.image?.filename && (
					<figure className="cta-final__proof reveal">
						<img
							src={sbSrc(blok.image, 1000)}
							srcSet={sbSrcSet(blok.image, [640, 1000, 1440])}
							sizes="(max-width: 900px) 100vw, 520px"
							{...sbDims(blok.image)}
							alt={blok.image.alt || ''}
							loading="lazy"
						/>
						{blok.image_caption && (
							<figcaption className="geo-tag">{blok.image_caption}</figcaption>
						)}
					</figure>
				)}
			</div>
		</section>
	);
}
