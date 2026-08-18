import './site-header.css';
import { CHROME, LANGS, type LangCode } from '@/lib/i18n';

export default function SiteHeader({ lang }: { lang: LangCode }) {
	const chrome = CHROME[lang] ?? CHROME.fr;
	const homePath = LANGS.find((l) => l.code === lang)?.path ?? '/';

	return (
		<header className="site-header">
			<div className="container site-header__inner">
				<a href={homePath} className="site-header__brand">
					<img
						src="/images/logo_orange.png"
						alt="ClearOrigin"
						width={170}
						height={27}
					/>
				</a>
				<nav className="site-header__nav" aria-label="Language">
					<ul className="lang-switch">
						{LANGS.map((l) => (
							<li key={l.code}>
								<a
									href={l.path}
									aria-current={l.code === lang ? 'page' : undefined}
								>
									{l.label}
								</a>
							</li>
						))}
					</ul>
					<a href="#cta" className="btn btn--primary site-header__cta">
						{chrome.cta}
					</a>
				</nav>
			</div>
		</header>
	);
}
