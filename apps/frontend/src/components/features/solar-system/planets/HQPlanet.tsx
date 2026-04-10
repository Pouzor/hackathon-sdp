export function HQPlanet({ size }: { size: number }) {
  const r = size / 2;
  return (
    <svg
      width={size + 20}
      height={size + 20}
      viewBox={`${-r - 10} ${-r - 10} ${size + 20} ${size + 20}`}
      overflow="visible"
    >
      <defs>
        <radialGradient id="hqGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#f0f4ff" />
          <stop offset="50%" stopColor="#b8c8e8" />
          <stop offset="100%" stopColor="#6080a8" />
        </radialGradient>
        <filter id="hqGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Equatorial ring */}
      <ellipse
        cx="0" cy="0"
        rx={r + 8} ry={4}
        fill="none"
        stroke="#c0d0f0"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Planet */}
      <circle r={r} fill="url(#hqGrad)" filter="url(#hqGlow)" />

      {/* Cloud bands */}
      <ellipse cx="0" cy={-r * 0.3} rx={r * 0.7} ry={r * 0.12} fill="white" opacity="0.12" />
      <ellipse cx="0" cy={r * 0.2}  rx={r * 0.55} ry={r * 0.1}  fill="white" opacity="0.08" />

      {/* Highlight */}
      <ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.28} ry={r * 0.2} fill="white" opacity="0.25" />

      {/* HQ text */}
      <text
        x="0" y="1"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize={r * 0.65}
        fill="#2a4070"
        opacity="0.8"
      >
        HQ
      </text>
    </svg>
  );
}
