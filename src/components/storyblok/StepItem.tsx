import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
import { sbDims, sbSrc } from '@/lib/sb-image';
import './step-item.css';

type StepItemBlok = Blok<{ title?: string; text?: string; image?: SbAsset }>;

export default function StepItem({
	blok,
	index = 0,
}: {
	blok: StepItemBlok;
	index?: number;
}) {
	const number = String(index + 1).padStart(2, '0');
	const dims = blok.image?.filename ? sbDims(blok.image.filename) : undefined;
	const width = dims ? Math.min(680, dims.width) : 680;

	return (
		<li className="step reveal" {...storyblokEditable(blok)}>
			<span className="step__marker" aria-hidden="true">
				{number}
			</span>
			<div className="step__body">
				<h3 className="step__title">{blok.title}</h3>
				<p className="step__text">{blok.text}</p>
			</div>
			{blok.image?.filename && (
				<div className="step__media">
					<img
						src={sbSrc(blok.image.filename, width)}
						{...dims}
						alt={blok.image.alt || ''}
						loading="lazy"
					/>
				</div>
			)}
		</li>
	);
}
