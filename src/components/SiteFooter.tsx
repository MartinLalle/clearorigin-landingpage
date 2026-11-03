import './site-footer.css';
import { CHROME, type LangCode } from '@/lib/i18n';

export default function SiteFooter({ lang }: { lang: LangCode }) {
	const chrome = CHROME[lang] ?? CHROME.fr;
	const currentYear = new Date().getFullYear();

	return (
		<footer className="site-footer">
			<div className="container site-footer__inner">
				<img
					src="/images/logo_orange.png"
					alt="ClearOrigin"
					width={150}
					height={24}
					className="site-footer__logo"
				/>
				<p className="site-footer__by">
					{chrome.developedBy} <strong>BFConsult</strong>
				</p>
				<p className="geo-tag">
					© {currentYear} — {chrome.legal}
				</p>
			</div>
		</footer>
	);
}
