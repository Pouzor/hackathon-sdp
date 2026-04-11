import { useId } from "react";

// Raccoons of Asgard — gold/amber planet with Norse runes + orbiting Mjölnir
export function RaccoonPlanet({ size }: { size: number }) {
  const uid = useId().replace(/:/g, "");
  const r = size / 2;

  return (
    <svg
      width={size + 60}
      height={size + 60}
      viewBox={`${-r - 30} ${-r - 30} ${size + 60} ${size + 60}`}
      overflow="visible"
    >
      <defs>
        <radialGradient id={`raccoonGrad-${uid}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <radialGradient id={`raccoonAtmos-${uid}`} cx="50%" cy="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.15" />
        </radialGradient>
        <filter id={`raccoonGlow-${uid}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`mjolnirGlow-${uid}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Atmosphere glow */}
      <circle r={r + 8} fill={`url(#raccoonAtmos-${uid})`} />

      {/* Planet body */}
      <circle r={r} fill={`url(#raccoonGrad-${uid})`} filter={`url(#raccoonGlow-${uid})`} />

      {/* Planet surface — darker amber bands */}
      <ellipse cx="0" cy={-r * 0.25} rx={r * 0.7} ry={r * 0.12} fill="#92400e" opacity="0.4" />
      <ellipse cx="0" cy={r * 0.2}   rx={r * 0.55} ry={r * 0.1}  fill="#78350f" opacity="0.35" />

      {/* Crater / dark spots */}
      <circle cx={r * 0.4} cy={-r * 0.3} r={r * 0.12} fill="#78350f" opacity="0.5" />
      <circle cx={-r * 0.45} cy={r * 0.2} r={r * 0.08} fill="#78350f" opacity="0.4" />

      {/* Norse rune marks on surface */}
      {/* Rune 1 — Tiwaz ↑ */}
      <g transform={`translate(${-r * 0.2}, ${-r * 0.45})`} opacity="0.65">
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="-4" y1="-2" x2="0" y2="-6" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="4" y1="-2" x2="0" y2="-6" stroke="#fde68a" strokeWidth="1.5" />
      </g>

      {/* Rune 2 — Othala ◇ */}
      <g transform={`translate(${r * 0.3}, ${r * 0.35})`} opacity="0.6">
        <line x1="0" y1="-6" x2="4" y2="0" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="0" y1="-6" x2="-4" y2="0" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="4" y1="0" x2="0" y2="6" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="-4" y1="0" x2="0" y2="6" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="-4" y1="4" x2="-6" y2="7" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="4" y1="4" x2="6" y2="7" stroke="#fde68a" strokeWidth="1.5" />
      </g>

      {/* Rune 3 — Hagalaz */}
      <g transform={`translate(${-r * 0.5}, ${r * 0.05})`} opacity="0.55">
        <line x1="-3" y1="-6" x2="-3" y2="6" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="3" y1="-6" x2="3" y2="6" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="-3" y1="0" x2="3" y2="0" stroke="#fde68a" strokeWidth="1.5" />
      </g>

      {/* Raccoon mask — subtle dark band across planet equator */}
      <ellipse cx="0" cy="0" rx={r} ry={r * 0.22} fill="#3d1f00" opacity="0.18" />
      <circle cx={-r * 0.25} cy={-r * 0.05} r={r * 0.14} fill="#3d1f00" opacity="0.15" />
      <circle cx={r * 0.25}  cy={-r * 0.05} r={r * 0.14} fill="#3d1f00" opacity="0.15" />

      {/* Highlight */}
      <ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.3} ry={r * 0.22} fill="white" opacity="0.18" />

      {/* Mjölnir orbiting the planet */}
      <g style={{ animation: "mjolnirOrbit 6s linear infinite", transformOrigin: "0 0" }}
         filter={`url(#mjolnirGlow-${uid})`}>
        {/* Mjolnir shape at the orbit point */}
        <g transform={`translate(${r + 18}, 0)`}>
          {/* Hammerhead */}
          <rect x="-7" y="-4" width="14" height="8" rx="2" fill="#fde68a" />
          {/* Handle */}
          <rect x="-2" y="4" width="4" height="10" rx="1" fill="#d97706" />
          {/* Handle grip */}
          <rect x="-2.5" y="11" width="5" height="2.5" rx="1" fill="#92400e" />
          {/* Hammer highlight */}
          <rect x="-5" y="-3" width="4" height="3" rx="1" fill="white" opacity="0.3" />
        </g>
      </g>
    </svg>
  );
}
