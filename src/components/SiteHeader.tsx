import './site-header.css';
import {
	CHROME,
	LANGS,
	pagePath,
	type LangCode,
	type PageKey,
} from '@/lib/i18n';

export default function SiteHeader({
	lang,
	page = 'home',
}: {
	lang: LangCode;
	page?: PageKey;
}) {
	const chrome = CHROME[lang] ?? CHROME.fr;
	const homePath = pagePath(lang);
	// Sur la simulation, le CTA ramène au formulaire de contact de la landing.
	const ctaHref = page === 'home' ? '#cta' : `${homePath}#cta`;

	return (
		<header className="site-header">
			<div className="container site-header__inner">
				<a href={homePath} className="site-header__brand">
					<img
						src="/images/logo_forest.png"
						alt="ClearOrigin"
						width={173}
						height={27}
					/>
				</a>
				<nav className="site-header__nav" aria-label="Language">
					<ul className="lang-switch">
						{LANGS.map((l) => (
							<li key={l.code}>
								<a
									href={pagePath(l.code, page)}
									hrefLang={l.code}
									aria-current={l.code === lang ? 'page' : undefined}
								>
									{l.label}
								</a>
							</li>
						))}
					</ul>
					<a href={ctaHref} className="btn btn--primary site-header__cta">
						{chrome.cta}
					</a>
				</nav>
			</div>
		</header>
	);
}
