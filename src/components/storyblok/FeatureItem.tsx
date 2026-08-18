import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
import { sbDims, sbSrc } from '@/lib/sb-image';
import './feature-item.css';

type FeatureItemBlok = Blok<{
	tag?: string;
	title?: string;
	text?: string;
	image?: SbAsset;
	image_alt?: string;
}>;

export default function FeatureItem({ blok }: { blok: FeatureItemBlok }) {
	const dims = blok.image?.filename ? sbDims(blok.image.filename) : undefined;
	const isPortrait = !!dims && dims.height > dims.width;

	return (
		<article className="card feature reveal" {...storyblokEditable(blok)}>
			{blok.image?.filename && (
				<div
					className={
						isPortrait
							? 'feature__media feature__media--phone'
							: 'feature__media'
					}
				>
					<img
						src={sbSrc(blok.image.filename, isPortrait ? 390 : 800)}
						{...dims}
						alt={blok.image.alt || blok.image_alt || ''}
						loading="lazy"
					/>
				</div>
			)}
			<div className="feature__body">
				{blok.tag && <p className="geo-tag feature__tag">{blok.tag}</p>}
				<h3 className="feature__title">{blok.title}</h3>
				<p className="feature__text">{blok.text}</p>
			</div>
		</article>
	);
}
