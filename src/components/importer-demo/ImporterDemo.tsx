import { pagePath, type LangCode } from '@/lib/i18n';
import { getDemoStrings, getSimMeta } from '@/content/importer-demo/strings';
import DemoApp from './DemoApp';
import './importer-demo.css';

/**
 * Simulation de la vue importateur (lien public d'un lot), servie par la landing elle-même :
 * aucune dépendance à un environnement de l'app, aucune donnée enregistrée.
 */
export default function ImporterDemo({ lang }: { lang: LangCode }) {
	const { sim } = getDemoStrings(lang);
	const meta = getSimMeta(lang);

	return (
		<div className="demo-page">
			<div className="demo-banner">
				<div className="container demo-banner__inner">
					<a className="demo-banner__back" href={pagePath(lang)}>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M19 12H5M11 18l-6-6 6-6" />
						</svg>
						{sim.back}
					</a>
					<p className="demo-banner__text">
						<span className="demo-banner__badge">{sim.badge}</span>
						{sim.banner}
					</p>
				</div>
			</div>

			<h1 className="visually-hidden">{meta.title}</h1>
			<DemoApp lang={lang} />
		</div>
	);
}
