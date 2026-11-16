import './site-footer.css';
import { CHROME, type LangCode } from '@/lib/i18n';

export default function SiteFooter({ lang }: { lang: LangCode }) {
	const chrome = CHROME[lang] ?? CHROME.fr;
	const currentYear = new Date().getFullYear();

	return (
		<footer className="site-footer">
			<div className="container site-footer__inner">
				<img
					src="/images/logo_white.png"
					alt="ClearOrigin"
					width={154}
					height={24}
					className="site-footer__logo"
				/>
				<p className="site-footer__by">
					{chrome.developedBy} <strong>BFConsult</strong>
				</p>
				<p className="site-footer__legal">
					© {currentYear} — {chrome.legal}
				</p>
			</div>
		</footer>
	);
}
