import './canopy-motif.css';

/**
 * Motif de marque, repris des écrans d'authentification de l'app (AuthShell/CanopyTrace) :
 * courbes de niveau d'une canopée, traversées par le fil latérite de la traçabilité
 * (parcelle → lot → acheteur). Purement décoratif.
 */
const BLOB =
	'M 0 -100 C 60 -105 110 -50 100 5 C 92 60 50 105 -5 100 C -65 95 -108 55 -100 -5 C -94 -60 -55 -96 0 -100 Z';

const RINGS_A = [0.45, 0.85, 1.25, 1.65, 2.05, 2.45, 2.85];
const RINGS_B = [0.4, 0.75, 1.1, 1.45, 1.8];

const TRACE =
	'M -20 790 C 120 720 110 610 230 560 S 430 500 410 400 S 330 250 470 200 S 600 110 640 40';

const NODES = [
	{ x: 230, y: 560 },
	{ x: 410, y: 400 },
	{ x: 470, y: 200 },
];

export default function CanopyMotif({
	className = '',
	trace = true,
}: {
	className?: string;
	trace?: boolean;
}) {
	return (
		<svg
			className={`canopy-motif ${className}`}
			viewBox="0 0 600 800"
			preserveAspectRatio="xMidYMid slice"
			aria-hidden="true"
		>
			<g className="canopy-motif__contours">
				{RINGS_A.map((scale, index) => (
					<path
						key={`a-${scale}`}
						d={BLOB}
						vectorEffect="non-scaling-stroke"
						transform={`translate(400 300) rotate(${index * 9}) scale(${scale})`}
					/>
				))}
				{RINGS_B.map((scale, index) => (
					<path
						key={`b-${scale}`}
						d={BLOB}
						vectorEffect="non-scaling-stroke"
						transform={`translate(110 690) rotate(${-20 - index * 11}) scale(${scale} ${scale * 0.8})`}
					/>
				))}
			</g>
			{trace && (
				<>
					<path className="canopy-motif__halo" d={TRACE} />
					<path className="canopy-motif__line" d={TRACE} pathLength={1} />
					{NODES.map((node, index) => (
						<g
							key={`${node.x}-${node.y}`}
							className="canopy-motif__node"
							style={{ animationDelay: `${900 + index * 260}ms` }}
						>
							<circle
								cx={node.x}
								cy={node.y}
								r={13}
								className="canopy-motif__ring"
							/>
							<circle
								cx={node.x}
								cy={node.y}
								r={5.5}
								className="canopy-motif__dot"
							/>
						</g>
					))}
				</>
			)}
		</svg>
	);
}
