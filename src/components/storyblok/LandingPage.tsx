import {
	StoryblokServerComponent,
	storyblokEditable,
} from '@storyblok/react/rsc';
import type { Blok } from '@/lib/types';

export default function LandingPage({
	blok,
}: {
	blok: Blok<{ body?: Blok[] }>;
}) {
	return (
		<div {...storyblokEditable(blok)}>
			{blok.body?.map((nestedBlok) => (
				<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
			))}
		</div>
	);
}
