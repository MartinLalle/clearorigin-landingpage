import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
import './feature-item.css';

type FeatureItemBlok = Blok<{
	tag?: string;
	title?: string;
	text?: string;
	image?: SbAsset;
	image_alt?: string;
}>;

export default function FeatureItem({ blok }: { blok: FeatureItemBlok }) {
	return (
		<article className="card feature reveal" {...storyblokEditable(blok)}>
			{blok.image?.filename && (
				<div className="feature__media">
					<img
						src={blok.image.filename}
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
