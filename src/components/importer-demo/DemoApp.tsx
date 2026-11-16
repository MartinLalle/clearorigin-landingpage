'use client';

import { useEffect, useRef, useState } from 'react';
import type { LangCode } from '@/lib/i18n';
import {
	getDemoStrings,
	type DemoStrings,
} from '@/content/importer-demo/strings';
import { LOT, PRODUCERS } from '@/content/importer-demo/data';
import type {
	DemoPrinciple,
	DemoProducer,
	Risk,
} from '@/content/importer-demo/types';
import TraceabilityPanel from './TraceabilityPanel';

type Decision = 'approved' | 'refused';

/** Reproduction de la page publique d'un lot de l'app (ImporterLotDetail), sur données fictives. */
export default function DemoApp({ lang }: { lang: LangCode }) {
	const strings = getDemoStrings(lang);
	const { t, sim } = strings;
	const [decision, setDecision] = useState<Decision | null>(null);

	return (
		<div className="demo-app">
			<div className="demo-app__bar">
				<div className="demo-app__bar-inner">
					<img
						src="/images/logo_white.png"
						alt="ClearOrigin"
						width={128}
						height={20}
						className="demo-app__logo"
					/>
					<span className="demo-app__suffix">{t('publicLot.brandSuffix')}</span>
				</div>
			</div>

			<div className="demo-app__body">
				{decision ? (
					<div className="demo-panel demo-confirmation" role="status">
						<span
							className={`demo-confirmation__icon demo-confirmation__icon--${decision}`}
							aria-hidden="true"
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.4"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								{decision === 'approved' ? (
									<path d="M5 12.5l4.5 4.5L19 7.5" />
								) : (
									<path d="M7 7l10 10M17 7L7 17" />
								)}
							</svg>
						</span>
						<h2 className="demo-confirmation__title">
							{decision === 'approved'
								? t('publicLot.approvedTitle')
								: t('publicLot.refusedTitle')}
						</h2>
						<p className="demo-muted">
							{decision === 'approved'
								? t('publicLot.approvedDescription')
								: t('publicLot.refusedDescription')}
						</p>
						<button
							type="button"
							className="demo-btn demo-btn--outlined"
							onClick={() => setDecision(null)}
						>
							{sim.restart}
						</button>
					</div>
				) : (
					<>
						<DecisionBar strings={strings} onDecided={setDecision} />
						<LotInfo strings={strings} />
						<Producers strings={strings} />
						<TraceabilityPanel lang={lang} />
					</>
				)}
			</div>
		</div>
	);
}

function DecisionBar({
	strings: { t },
	onDecided,
}: {
	strings: DemoStrings;
	onDecided: (decision: Decision) => void;
}) {
	const [pending, setPending] = useState<'approve' | 'refuse' | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (pending && !dialog.open) dialog.showModal();
		if (!pending && dialog.open) dialog.close();
	}, [pending]);

	return (
		<div className="demo-panel demo-decision">
			<p className="demo-decision__text">{t('publicLot.awaitingDecision')}</p>
			<div className="demo-decision__actions">
				<button
					type="button"
					className="demo-btn demo-btn--danger-outlined"
					onClick={() => setPending('refuse')}
				>
					{t('publicLot.refuse')}
				</button>
				<button
					type="button"
					className="demo-btn demo-btn--success"
					onClick={() => setPending('approve')}
				>
					{t('publicLot.approve')}
				</button>
			</div>

			<dialog
				ref={dialogRef}
				className="demo-dialog"
				aria-labelledby="demo-dialog-title"
				onClose={() => setPending(null)}
			>
				<h2 id="demo-dialog-title" className="demo-dialog__title">
					{pending === 'refuse'
						? t('publicLot.confirmRefuseTitle')
						: t('publicLot.confirmApproveTitle')}
				</h2>
				<p className="demo-muted">
					{pending === 'refuse'
						? t('publicLot.confirmRefuseBody')
						: t('publicLot.confirmApproveBody')}
				</p>
				<div className="demo-dialog__actions">
					<button
						type="button"
						className="demo-btn demo-btn--text"
						onClick={() => setPending(null)}
					>
						{t('common.cancel')}
					</button>
					<button
						type="button"
						className={`demo-btn ${pending === 'refuse' ? 'demo-btn--danger' : 'demo-btn--success'}`}
						onClick={() => {
							const choice = pending;
							setPending(null);
							if (choice)
								onDecided(choice === 'approve' ? 'approved' : 'refused');
						}}
					>
						{t('common.confirm')}
					</button>
				</div>
			</dialog>
		</div>
	);
}

function LotInfo({ strings: { t, sim } }: { strings: DemoStrings }) {
	const fields: [string, string, boolean?][] = [
		[t('publicLot.exporter'), LOT.exporter, true],
		[t('publicLot.reference'), LOT.reference],
		[t('publicLot.quantity'), LOT.quantity],
		[t('publicLot.price'), LOT.price],
	];

	return (
		<section className="demo-panel demo-panel--padded">
			<h2 className="demo-h6">{t('publicLot.batchInformation')}</h2>
			<dl className="demo-fields">
				{fields.map(([label, value, strong]) => (
					<div key={label}>
						<dt className="demo-caption">{label}</dt>
						<dd className={strong ? 'demo-strong' : undefined}>{value}</dd>
					</div>
				))}
			</dl>
			<div className="demo-chips">
				<span className="demo-chip">{sim.cocoa}</span>
			</div>
		</section>
	);
}

function Producers({ strings }: { strings: DemoStrings }) {
	const { t } = strings;

	return (
		<section className="demo-panel">
			<header className="demo-panel__head">
				<h2 className="demo-h6">
					{t('publicLot.producers', { count: PRODUCERS.length })}
				</h2>
			</header>
			{PRODUCERS.map((producer) => (
				<ProducerRow key={producer.id} producer={producer} strings={strings} />
			))}
		</section>
	);
}

function ProducerRow({
	producer,
	strings,
}: {
	producer: DemoProducer;
	strings: DemoStrings;
}) {
	const { sim } = strings;

	return (
		<details className="demo-producer">
			<summary className="demo-producer__summary">
				<span className="demo-producer__main">
					<span className="demo-producer__line">
						<strong className="demo-producer__name">{producer.name}</strong>
						<span className="demo-muted">
							{sim.countries[producer.country]}
						</span>
					</span>
					<span className="demo-chip demo-chip--outlined demo-chip--sm">
						{sim.cocoa}
					</span>
				</span>
				<Chevron />
			</summary>
			<div className="demo-producer__body">
				{producer.principles.map((principle) => (
					<PrincipleRow
						key={principle.title}
						principle={principle}
						strings={strings}
					/>
				))}
			</div>
		</details>
	);
}

function PrincipleRow({
	principle,
	strings,
}: {
	principle: DemoPrinciple;
	strings: DemoStrings;
}) {
	const { t, sim } = strings;
	const applicable = principle.verifiers.filter((v) => v.status !== 'na');
	const missing = applicable.filter((v) => v.status === 'missing').length;
	const expired = applicable.filter((v) => v.status === 'expired').length;
	const provided = applicable.length - missing;
	const fullyValid = applicable.length > 0 && missing === 0 && expired === 0;

	return (
		<details className="demo-principle">
			<summary className="demo-principle__summary">
				<span className="demo-principle__main">
					<span className="demo-principle__title">{principle.title}</span>
					<span className="demo-principle__meta">
						<span>
							{provided}/{applicable.length} {t('documents.documents')}
						</span>
						{missing > 0 && (
							<span className="demo-chip demo-chip--sm demo-chip--neutral">
								{t('documents.principleIncomplete')}
							</span>
						)}
						{expired > 0 && (
							<span className="demo-chip demo-chip--sm demo-chip--danger">
								{expired} {sim.status.expired.toLowerCase()}
							</span>
						)}
						{fullyValid && (
							<span className="demo-chip demo-chip--sm demo-chip--success">
								{t('documents.valid')}
							</span>
						)}
					</span>
				</span>
				<Chevron />
			</summary>
			{principle.verifiers.length === 0 ? (
				<p className="demo-muted demo-principle__empty">—</p>
			) : (
				<div className="demo-table-wrap">
					<table className="demo-table">
						<thead>
							<tr>
								<th>{t('documents.verifiersTitle')}</th>
								<th>{t('documents.fileName')}</th>
								<th>{t('documents.ValidityEnd')}</th>
								<th>{t('common.status')}</th>
							</tr>
						</thead>
						<tbody>
							{principle.verifiers.map((verifier) => {
								const na = verifier.status === 'na';
								return (
									<tr key={verifier.label}>
										<td className={na ? 'demo-table__na' : undefined}>
											{verifier.label}
										</td>
										<td className="demo-table__file">{verifier.file ?? '—'}</td>
										<td className="demo-table__nowrap">
											{verifier.status === 'permanent'
												? t('documents.permanent')
												: (verifier.validUntil ?? '—')}
										</td>
										<td>
											<span
												className={`demo-status demo-status--${verifier.status}`}
											>
												{sim.status[verifier.status]}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</details>
	);
}

export function Chevron() {
	return (
		<svg
			className="demo-chevron"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M6 9l6 6 6-6" />
		</svg>
	);
}

export function RiskChip({
	risk,
	strings,
}: {
	risk: Risk;
	strings: DemoStrings;
}) {
	const { t } = strings;
	const label =
		risk === 'high'
			? t('deforestation.riskHigh')
			: risk === 'medium'
				? t('deforestation.riskMedium')
				: risk === 'low'
					? t('deforestation.riskLow')
					: t('deforestation.riskUnknown');
	return (
		<span className={`demo-chip demo-chip--sm demo-risk demo-risk--${risk}`}>
			{label}
		</span>
	);
}
