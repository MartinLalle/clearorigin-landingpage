'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LangCode } from '@/lib/i18n';
import {
	getDemoStrings,
	type DemoStrings,
} from '@/content/importer-demo/strings';
import { LINKS, NODES, PRODUCERS } from '@/content/importer-demo/data';
import { PARCELS } from '@/content/importer-demo/parcels';
import type { CountryCode, DemoParcel } from '@/content/importer-demo/types';
import { RiskChip } from './DemoApp';

// Langage visuel de la carte de l'app (TraceabilityDeforestationMap/visuals.tsx).
const PRODUCER_LINK_COLOR = '#f59e0b';
const INTERMEDIARY_LINK_COLOR = '#16a34a';
const IMPORTER_COLOR = '#b45309';
const PARCEL_COLOR = '#d97706';

type LegendItem = {
	id: string;
	kind: 'parcel' | 'intermediary' | 'importer';
	label: string;
	sublabel?: string;
	parcel?: DemoParcel;
};

type LegendSection = { key: string; title: string; items: LegendItem[] };

const producerById = new Map(PRODUCERS.map((p) => [p.id, p]));
const nodeById = new Map(NODES.map((n) => [n.id, n]));

/** Centre approximatif d'un anneau [lng, lat] → [lat, lng]. */
function ringCenter(ring: number[][]): [number, number] {
	const pts = ring.slice(0, -1);
	const lng = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
	const lat = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
	return [lat, lng];
}

/** Liens mis en avant pour une sélection : le chemin de l'élément jusqu'à l'importateur. */
function pathFor(selectedId: string | null): Set<string> | null {
	if (!selectedId) return null;
	const linkId = (from: string, to: string) => `${from}->${to}`;
	const next = (from: string) => LINKS.find((link) => link.from === from);
	const result = new Set<string>();
	let start: string | undefined;
	if (selectedId.startsWith('parcel-')) {
		start = PARCELS.find((p) => p.id === selectedId)?.producerId;
	} else if (selectedId === 'importer') {
		LINKS.forEach((link) => result.add(linkId(link.from, link.to)));
		return result;
	} else {
		start = selectedId;
	}
	let link = start ? next(start) : undefined;
	while (link) {
		result.add(linkId(link.from, link.to));
		link = next(link.to);
	}
	return result;
}

/** Arc courbé entre deux points, échantillonné dans le plan de Mercator (comme les arcs de l'app). */
function curvedArc(
	L: typeof Leaflet,
	from: [number, number],
	to: [number, number],
) {
	const crs = L.CRS.EPSG3857;
	const a = crs.project(L.latLng(from));
	const b = crs.project(L.latLng(to));
	const mid = a.add(b).divideBy(2);
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const curvature = 0.3;
	const control = L.point(mid.x - dy * curvature, mid.y + dx * curvature);
	const points: Leaflet.LatLng[] = [];
	for (let i = 0; i <= 48; i++) {
		const t = i / 48;
		const x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * control.x + t ** 2 * b.x;
		const y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * control.y + t ** 2 * b.y;
		points.push(crs.unproject(L.point(x, y)));
	}
	// Direction de la flèche au milieu de l'arc (dérivée de la courbe en t = 0,5), en degrés écran.
	const tx = b.x - a.x;
	const ty = b.y - a.y;
	// y projeté croît vers le nord, y écran vers le bas : d'où le signe.
	const angle = (Math.atan2(-ty, tx) * 180) / Math.PI;
	return { points, arrowAt: points[24], angle };
}

export default function TraceabilityPanel({ lang }: { lang: LangCode }) {
	const strings = getDemoStrings(lang);
	const { t, sim } = strings;
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [legendOpen, setLegendOpen] = useState(true);

	const sections = useMemo<LegendSection[]>(() => {
		const parcels: LegendItem[] = PARCELS.map((parcel, index) => {
			const producer = producerById.get(parcel.producerId);
			return {
				id: parcel.id,
				kind: 'parcel',
				label: t('publicLot.parcelOrdinal', { n: index + 1 }),
				sublabel: producer
					? `${producer.name} · ${sim.countries[producer.country]}`
					: undefined,
				parcel,
			};
		});
		const byCountry = new Map<CountryCode, LegendItem[]>();
		for (const node of NODES) {
			if (node.kind !== 'intermediary') continue;
			const list = byCountry.get(node.country) ?? [];
			list.push({
				id: node.id,
				kind: 'intermediary',
				label: t('publicLot.intermediaryOrdinal', { n: node.ordinal ?? 0 }),
			});
			byCountry.set(node.country, list);
		}
		return [
			{
				key: 'parcels',
				title: t('publicLot.producerParcelsCount', { count: parcels.length }),
				items: parcels,
			},
			...[...byCountry.entries()].map(([country, items]) => ({
				key: `int-${country}`,
				title: t('publicLot.intermediariesByCountry', {
					country: sim.countries[country],
					count: items.length,
				}),
				items,
			})),
			{
				key: 'importer',
				title: t('publicLot.importer'),
				items: [
					{
						id: 'importer',
						kind: 'importer',
						label: t('publicLot.importer'),
						sublabel: sim.countries.BE,
					},
				],
			},
		];
	}, [t, sim]);

	const itemCount = sections.reduce((sum, s) => sum + s.items.length, 0);
	const parcelItems = sections[0].items;
	const selectedItem = sections
		.flatMap((s) => s.items)
		.find((i) => i.id === selectedId);
	const selectedParcelItem =
		selectedItem?.kind === 'parcel' ? selectedItem : undefined;

	const toggle = useCallback(
		(id: string) => setSelectedId((current) => (current === id ? null : id)),
		[],
	);

	// --- Carte Leaflet -------------------------------------------------------------------------
	const mapEl = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Leaflet.Map | null>(null);
	const leafletRef = useRef<typeof Leaflet | null>(null);
	const layersRef = useRef<{
		arcs: {
			id: string;
			line: Leaflet.Polyline;
			arrow: Leaflet.Marker;
			fromIsProducer: boolean;
		}[];
		parcels: {
			id: string;
			polygon: Leaflet.Polygon;
			dot: Leaflet.CircleMarker;
		}[];
		nodes: { id: string; marker: Leaflet.Marker }[];
		bounds: Leaflet.LatLngBounds | null;
	}>({ arcs: [], parcels: [], nodes: [], bounds: null });
	const toggleRef = useRef(toggle);
	toggleRef.current = toggle;

	useEffect(() => {
		let disposed = false;
		(async () => {
			const L = (await import('leaflet')).default;
			if (disposed || !mapEl.current || mapRef.current) return;
			leafletRef.current = L;

			const map = L.map(mapEl.current, {
				scrollWheelZoom: false,
				zoomControl: true,
				attributionControl: true,
				worldCopyJump: true,
			});
			mapRef.current = map;

			L.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{
					maxZoom: 18,
					attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
				},
			).addTo(map);
			L.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
				{ maxZoom: 18, opacity: 0.85 },
			).addTo(map);

			const layers = layersRef.current;
			const allPoints: Leaflet.LatLngExpression[] = [];

			// Parcelles : polygone + point visible aux petites échelles.
			for (const parcel of PARCELS) {
				const latlngs = parcel.ring.map(([lng, lat]) => L.latLng(lat, lng));
				const polygon = L.polygon(latlngs, {
					color: PARCEL_COLOR,
					weight: 2,
					fillColor: PARCEL_COLOR,
					fillOpacity: 0.22,
				}).addTo(map);
				const center = ringCenter(parcel.ring as number[][]);
				const dot = L.circleMarker(center, {
					radius: 5,
					color: '#fff',
					weight: 1.5,
					fillColor: PARCEL_COLOR,
					fillOpacity: 1,
				}).addTo(map);
				polygon.on('click', () => toggleRef.current(parcel.id));
				dot.on('click', () => toggleRef.current(parcel.id));
				layers.parcels.push({ id: parcel.id, polygon, dot });
				allPoints.push(center);
			}

			// Arcs orientés : producteur (centre de ses parcelles) → coopérative → exportateur → importateur.
			const producerCenter = (producerId: string): [number, number] => {
				const centers = PARCELS.filter((p) => p.producerId === producerId).map(
					(p) => ringCenter(p.ring as number[][]),
				);
				return [
					centers.reduce((s, c) => s + c[0], 0) / centers.length,
					centers.reduce((s, c) => s + c[1], 0) / centers.length,
				];
			};
			for (const link of LINKS) {
				const from = link.fromIsProducer
					? producerCenter(link.from)
					: (nodeById.get(link.from)?.position as [number, number]);
				const to = nodeById.get(link.to)?.position as [number, number];
				const color = link.fromIsProducer
					? PRODUCER_LINK_COLOR
					: INTERMEDIARY_LINK_COLOR;
				const { points, arrowAt, angle } = curvedArc(L, from, to);
				const line = L.polyline(points, {
					color,
					weight: 3,
					opacity: 0.95,
				}).addTo(map);
				const arrow = L.marker(arrowAt, {
					interactive: false,
					keyboard: false,
					icon: L.divIcon({
						className: 'demo-map-arrow',
						html: `<span style="transform:rotate(${angle}deg);color:${color}">➤</span>`,
						iconSize: [16, 16],
						iconAnchor: [8, 8],
					}),
				}).addTo(map);
				layers.arcs.push({
					id: `${link.from}->${link.to}`,
					line,
					arrow,
					fromIsProducer: link.fromIsProducer,
				});
			}

			// Nœuds : intermédiaires (pastille verte) et importateur (épingle).
			for (const node of NODES) {
				const icon =
					node.kind === 'importer'
						? L.divIcon({
								className: 'demo-map-pin',
								html: `<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path fill="${IMPORTER_COLOR}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>`,
								iconSize: [32, 32],
								iconAnchor: [16, 30],
							})
						: L.divIcon({
								className: 'demo-map-node',
								html: '<span></span>',
								iconSize: [18, 18],
								iconAnchor: [9, 9],
							});
				const marker = L.marker(node.position, { icon, keyboard: false }).addTo(
					map,
				);
				marker.on('click', () => toggleRef.current(node.id));
				layers.nodes.push({ id: node.id, marker });
				allPoints.push(node.position);
			}

			layers.bounds = L.latLngBounds(allPoints);
			map.fitBounds(layers.bounds, { padding: [40, 40] });
		})();

		return () => {
			disposed = true;
			mapRef.current?.remove();
			mapRef.current = null;
			layersRef.current = { arcs: [], parcels: [], nodes: [], bounds: null };
		};
	}, []);

	// Mise en avant du chemin sélectionné, le reste est atténué.
	useEffect(() => {
		const layers = layersRef.current;
		const path = pathFor(selectedId);
		for (const arc of layers.arcs) {
			const on = !path || path.has(arc.id);
			arc.line.setStyle({
				opacity: on ? 0.95 : 0.18,
				weight: on && path ? 4 : 3,
			});
			arc.arrow.setOpacity(on ? 1 : 0.2);
		}
		for (const { id, polygon, dot } of layers.parcels) {
			const on = !selectedId || id === selectedId || selectedId === 'importer';
			polygon.setStyle({
				opacity: on ? 1 : 0.35,
				fillOpacity: on ? (id === selectedId ? 0.4 : 0.22) : 0.08,
			});
			dot.setStyle({ opacity: on ? 1 : 0.35, fillOpacity: on ? 1 : 0.35 });
		}
		for (const { id, marker } of layers.nodes) {
			const on =
				!path ||
				id === selectedId ||
				[...path].some(
					(linkId) =>
						linkId.endsWith(`->${id}`) || linkId.startsWith(`${id}->`),
				);
			marker.setOpacity(on ? 1 : 0.3);
		}
	}, [selectedId]);

	const zoomTo = useCallback((item: LegendItem) => {
		const map = mapRef.current;
		const L = leafletRef.current;
		if (!map || !L) return;
		if (item.parcel) {
			const latlngs = item.parcel.ring.map(([lng, lat]) => L.latLng(lat, lng));
			map.flyToBounds(L.latLngBounds(latlngs), { maxZoom: 16, duration: 1.2 });
		} else {
			const node = nodeById.get(item.id);
			if (node) map.flyTo(node.position, 6, { duration: 1.2 });
		}
	}, []);

	const resetView = useCallback(() => {
		const bounds = layersRef.current.bounds;
		if (bounds)
			mapRef.current?.flyToBounds(bounds, { padding: [40, 40], duration: 1 });
	}, []);

	useEffect(() => {
		if (!selectedId) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setSelectedId(null);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [selectedId]);

	const selectedIndex = selectedParcelItem
		? parcelItems.findIndex((item) => item.id === selectedParcelItem.id)
		: -1;
	const step = (offset: number) => {
		const next = parcelItems[selectedIndex + offset];
		if (next) setSelectedId(next.id);
	};

	const legendList = (
		<LegendList
			sections={sections}
			selectedId={selectedId}
			onSelect={toggle}
			onZoom={zoomTo}
			strings={strings}
		/>
	);

	return (
		<section className="demo-panel">
			<header className="demo-panel__head">
				<h2 className="demo-h6">{t('publicLot.traceability')}</h2>
				<p className="demo-muted demo-small">
					{t('publicLot.traceabilityIntro')}
				</p>
			</header>

			<div className="demo-map">
				<div ref={mapEl} className="demo-map__canvas" />
				<button
					type="button"
					className="demo-map__reset"
					aria-label={t('publicLot.resetView')}
					title={t('publicLot.resetView')}
					onClick={resetView}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6" />
					</svg>
				</button>

				{legendOpen ? (
					<div
						className="demo-legend"
						role="region"
						aria-label={t('publicLot.legend', { count: itemCount })}
					>
						<div className="demo-legend__head">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								aria-hidden="true"
							>
								<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
							</svg>
							<strong>{t('publicLot.legend', { count: itemCount })}</strong>
							{selectedId && (
								<button
									type="button"
									className="demo-link"
									onClick={() => setSelectedId(null)}
								>
									{t('publicLot.showAll')}
								</button>
							)}
							<button
								type="button"
								className="demo-icon-btn"
								aria-label={t('publicLot.closeLegend')}
								onClick={() => setLegendOpen(false)}
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									aria-hidden="true"
								>
									<path d="M6 6l12 12M18 6L6 18" />
								</svg>
							</button>
						</div>
						<div className="demo-legend__body">{legendList}</div>
					</div>
				) : (
					<button
						type="button"
						className="demo-legend-toggle"
						onClick={() => setLegendOpen(true)}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							aria-hidden="true"
						>
							<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
						</svg>
						{t('publicLot.legend', { count: itemCount })}
					</button>
				)}
			</div>

			<div className="demo-keys">
				<span>
					<i className="demo-key demo-key--parcel" />
					{t('publicLot.producerParcels')}
				</span>
				<span>
					<i className="demo-key demo-key--producer-link" />
					{t('publicLot.producerLink')}
				</span>
				<span>
					<i className="demo-key demo-key--node" />
					{t('publicLot.intermediaryAnonymized')}
				</span>
				<span>
					<i className="demo-key demo-key--int-link" />
					{t('publicLot.intermediaryLink')}
				</span>
				<span>
					<i className="demo-key demo-key--pin" />
					{t('publicLot.importerArrivalCountry')}
				</span>
			</div>

			{/* Sur téléphone, la carte est basse : la légende cliquable passe dessous. */}
			<div className="demo-legend-mobile">
				{selectedId && (
					<div className="demo-legend-mobile__clear">
						<button
							type="button"
							className="demo-link"
							onClick={() => setSelectedId(null)}
						>
							{t('publicLot.showAll')}
						</button>
					</div>
				)}
				{legendList}
			</div>

			<div className="demo-deforestation">
				<h3 className="demo-h6">{t('deforestation.title')}</h3>
				<div className="demo-deforestation__overall">
					<strong>{t('deforestation.overallRisk')}</strong>
					<RiskChip risk="low" strings={strings} />
					<span className="demo-muted demo-caption">
						{t(
							PARCELS.length === 1
								? 'publicLot.parcelCount_one'
								: 'publicLot.parcelCount_other',
							{
								count: PARCELS.length,
							},
						)}
					</span>
				</div>

				{selectedParcelItem?.parcel ? (
					<ParcelReport
						item={selectedParcelItem}
						parcel={selectedParcelItem.parcel}
						canPrev={selectedIndex > 0}
						canNext={selectedIndex < parcelItems.length - 1}
						onStep={step}
						strings={strings}
					/>
				) : (
					<p className="demo-muted demo-small">
						{t('publicLot.selectParcelHint')}
					</p>
				)}
			</div>
		</section>
	);
}

function LegendList({
	sections,
	selectedId,
	onSelect,
	onZoom,
	strings,
}: {
	sections: LegendSection[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	onZoom: (item: LegendItem) => void;
	strings: DemoStrings;
}) {
	const { t } = strings;
	return (
		<>
			{sections.map((section) => (
				<div key={section.key} className="demo-legend__section">
					<p className="demo-legend__title">{section.title}</p>
					<ul>
						{section.items.map((item) => (
							<li
								key={item.id}
								className={item.id === selectedId ? 'is-selected' : undefined}
							>
								<button
									type="button"
									className="demo-legend__item"
									aria-pressed={item.id === selectedId}
									onClick={() => {
										onSelect(item.id);
										if (item.id !== selectedId) onZoom(item);
									}}
								>
									<i
										className={`demo-key demo-key--${item.kind === 'parcel' ? 'parcel' : item.kind === 'importer' ? 'pin' : 'node'}`}
									/>
									<span className="demo-legend__text">
										<span className="demo-legend__label">{item.label}</span>
										{item.sublabel && (
											<span className="demo-legend__sub">{item.sublabel}</span>
										)}
									</span>
									{item.parcel && (
										<RiskChip risk={item.parcel.risk} strings={strings} />
									)}
								</button>
								{item.parcel && (
									<button
										type="button"
										className="demo-icon-btn"
										aria-label={t('publicLot.zoomToParcel')}
										title={t('publicLot.zoomToParcel')}
										onClick={() => onZoom(item)}
									>
										<svg
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
										>
											<circle cx="12" cy="5.5" r="1.8" />
											<circle cx="12" cy="12" r="1.8" />
											<circle cx="12" cy="18.5" r="1.8" />
										</svg>
									</button>
								)}
							</li>
						))}
					</ul>
				</div>
			))}
		</>
	);
}

/** `disturbance_after_2020` → `Disturbance after 2020`, comme dans l'app. */
const humanize = (key: string) => {
	const text = key.replace(/_/g, ' ').trim();
	return text.charAt(0).toUpperCase() + text.slice(1);
};

const RISK_FILL: Record<string, number> = {
	unknown: 0.08,
	low: 0.25,
	medium: 0.6,
	high: 1,
};

function ParcelReport({
	item,
	parcel,
	canPrev,
	canNext,
	onStep,
	strings,
}: {
	item: LegendItem;
	parcel: DemoParcel;
	canPrev: boolean;
	canNext: boolean;
	onStep: (offset: number) => void;
	strings: DemoStrings;
}) {
	const { t } = strings;
	const categoryKey = (category: string) =>
		`category.${category}` as Parameters<typeof t>[0];

	return (
		<div className="demo-report">
			<div className="demo-report__head">
				<button
					type="button"
					className="demo-icon-btn"
					aria-label={t('deforestation.previousParcel')}
					disabled={!canPrev}
					onClick={() => onStep(-1)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M15 6l-6 6 6 6" />
					</svg>
				</button>
				<div className="demo-report__title">
					<strong>{item.label}</strong>
					<span className="demo-muted demo-caption">
						{[item.sublabel, `${parcel.areaHectares.toFixed(1)} ha`]
							.filter(Boolean)
							.join(' · ')}
					</span>
				</div>
				<RiskChip risk={parcel.risk} strings={strings} />
				<button
					type="button"
					className="demo-icon-btn"
					aria-label={t('deforestation.nextParcel')}
					disabled={!canNext}
					onClick={() => onStep(1)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M9 6l6 6-6 6" />
					</svg>
				</button>
			</div>

			<p className="demo-eyebrow">{t('deforestation.byCategory')}</p>
			{parcel.riskByCategory.map((category) => (
				<div key={category.category} className="demo-riskbar">
					<span className="demo-riskbar__label">
						{t(categoryKey(category.category))}
					</span>
					<span className="demo-riskbar__track">
						<span
							className={`demo-riskbar__fill demo-riskbar__fill--${category.risk}`}
							style={{ width: `${(RISK_FILL[category.risk] ?? 0.08) * 100}%` }}
						/>
					</span>
					<RiskChip risk={category.risk} strings={strings} />
				</div>
			))}

			<p className="demo-eyebrow">{t('deforestation.indicators')}</p>
			<ul className="demo-indicators">
				{parcel.indicators.map((indicator) => (
					<li key={indicator.key}>
						<span>{humanize(indicator.key)}</span>
						<span
							className={`demo-chip demo-chip--sm ${indicator.present ? 'demo-chip--warn' : 'demo-chip--neutral'}`}
						>
							{indicator.present
								? t('deforestation.yes')
								: t('deforestation.no')}
						</span>
					</li>
				))}
			</ul>
			<p className="demo-muted demo-caption demo-report__disclaimer">
				{t('deforestation.disclaimer')}
			</p>
		</div>
	);
}
