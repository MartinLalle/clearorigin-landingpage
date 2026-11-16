import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
import { sbDims, sbSrc, sbSrcSet } from '@/lib/sb-image';
import CanopyMotif from '@/components/CanopyMotif';
import ArrowIcon from '@/components/ArrowIcon';
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
		<section className="section--canopy hero" {...storyblokEditable(blok)}>
			<CanopyMotif className="hero__motif" />

			<div className="container hero__inner">
				<div className="hero__copy">
					{blok.badge && <p className="hero__badge">{blok.badge}</p>}
					<h1 className="hero__headline">{blok.headline}</h1>
					<p className="hero__sub">{blok.subheadline}</p>
					<div className="hero__actions">
						{blok.cta_label && (
							<a className="btn btn--primary" href={blok.cta_link || '#cta'}>
								{blok.cta_label}
								<ArrowIcon />
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
								<span className="hero__frame-url" />
							</div>
							<img
								src={sbSrc(blok.image, 1104)}
								srcSet={sbSrcSet(blok.image, [640, 1104, 1600])}
								sizes="(max-width: 900px) 100vw, 600px"
								{...sbDims(blok.image)}
								alt={blok.image.alt || blok.image_alt || ''}
								loading="eager"
								fetchPriority="high"
							/>
						</div>
						{blok.image_caption && (
							<figcaption className="meta hero__caption">
								{blok.image_caption}
							</figcaption>
						)}
					</figure>
				)}
			</div>
		</section>
	);
}
