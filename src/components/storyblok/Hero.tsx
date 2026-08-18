import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
import { sbDims, sbSrc, sbSrcSet } from '@/lib/sb-image';
import './hero.css';

type HeroBlok = Blok<{
	badge?: string;
	headline?: string;
	subheadline?: string;
	cta_label?: string;
	cta_link?: string;
	cta_secondary_label?: string;
	cta_secondary_link?: string;
	image?: SbAsset;
	image_alt?: string;
	image_caption?: string;
}>;

export default function Hero({ blok }: { blok: HeroBlok }) {
	return (
		<section className="hero" {...storyblokEditable(blok)}>
			<svg
				className="parcel-motif hero__motif"
				viewBox="0 0 340 300"
				aria-hidden="true"
			>
				<polygon points="20,110 90,30 210,18 320,80 290,210 150,270 40,230"></polygon>
				<circle cx="20" cy="110" r="3.5"></circle>
				<circle cx="90" cy="30" r="3.5"></circle>
				<circle cx="210" cy="18" r="3.5"></circle>
				<circle cx="320" cy="80" r="3.5"></circle>
				<circle cx="290" cy="210" r="3.5"></circle>
				<circle cx="150" cy="270" r="3.5"></circle>
				<circle cx="40" cy="230" r="3.5"></circle>
			</svg>

			<div className="container hero__inner">
				<div className="hero__copy">
					{blok.badge && <p className="hero__badge">{blok.badge}</p>}
					<h1 className="hero__headline">{blok.headline}</h1>
					<p className="hero__sub">{blok.subheadline}</p>
					<div className="hero__actions">
						{blok.cta_label && (
							<a className="btn btn--primary" href={blok.cta_link || '#cta'}>
								{blok.cta_label}
							</a>
						)}
						{blok.cta_secondary_label && (
							<a
								className="btn btn--ghost"
								href={blok.cta_secondary_link || '#how'}
							>
								{blok.cta_secondary_label}
							</a>
						)}
					</div>
				</div>

				{blok.image?.filename && (
					<figure className="hero__visual">
						<div className="hero__frame">
							<div className="hero__frame-bar" aria-hidden="true">
								<i />
								<i />
								<i />
							</div>
							<img
								src={sbSrc(blok.image.filename, 1104)}
								srcSet={sbSrcSet(blok.image.filename, [640, 1104, 1600])}
								sizes="(max-width: 900px) 100vw, 552px"
								{...sbDims(blok.image.filename)}
								alt={blok.image.alt || blok.image_alt || ''}
								loading="eager"
								fetchPriority="high"
							/>
						</div>
						{blok.image_caption && (
							<figcaption className="geo-tag hero__caption">
								{blok.image_caption}
							</figcaption>
						)}
					</figure>
				)}
			</div>
		</section>
	);
}
