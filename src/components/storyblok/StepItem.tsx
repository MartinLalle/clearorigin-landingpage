import { storyblokEditable } from '@storyblok/react/rsc';
import type { Blok, SbAsset } from '@/lib/types';
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
				<img
					className="step__image"
					src={blok.image.filename}
					alt={blok.image.alt || ''}
					loading="lazy"
				/>
			)}
		</li>
	);
}
