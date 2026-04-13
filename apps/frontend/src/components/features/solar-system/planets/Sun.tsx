import { useId } from "react";

export function Sun() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      width="90"
      height="90"
      viewBox="-45 -45 90 90"
      style={{ animation: "sunPulse 3s ease-in-out infinite", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`sunGrad-${uid}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="75%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#e63000" />
        </radialGradient>
        <radialGradient id={`sunGlow-${uid}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
        </radialGradient>
        <filter id={`sunBlur-${uid}`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Outer glow */}
      <circle r="44" fill={`url(#sunGlow-${uid})`} filter={`url(#sunBlur-${uid})`} />

      {/* Corona rays — slow spin */}
      <g style={{ animation: "coronaSpin 20s linear infinite", transformOrigin: "0 0" }}>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const inner = 36;
          const outer = 42 + (i % 3 === 0 ? 6 : 2);
          const x1 = Math.cos(angle) * inner;
          const y1 = Math.sin(angle) * inner;
          const x2 = Math.cos(angle) * outer;
          const y2 = Math.sin(angle) * outer;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ffd700"
              strokeWidth={i % 3 === 0 ? "2.5" : "1.5"}
              strokeOpacity="0.7"
            />
          );
        })}
      </g>

      {/* Reverse corona — different speed */}
      <g style={{ animation: "coronaSpinReverse 35s linear infinite", transformOrigin: "0 0" }}>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const x1 = Math.cos(angle) * 33;
          const y1 = Math.sin(angle) * 33;
          const x2 = Math.cos(angle) * 38;
          const y2 = Math.sin(angle) * 38;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ff6000"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
          );
        })}
      </g>

      {/* Sun body */}
      <circle r="32" fill={`url(#sunGrad-${uid})`} />

      {/* Surface texture — subtle darker spots */}
      <circle cx="-8" cy="-10" r="5" fill="#e07000" opacity="0.3" />
      <circle cx="10" cy="8" r="4" fill="#e07000" opacity="0.2" />
      <circle cx="-5" cy="14" r="3" fill="#c05000" opacity="0.25" />

      {/* Highlight */}
      <ellipse cx="-10" cy="-12" rx="9" ry="7" fill="white" opacity="0.15" />

      {/* E11 label */}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="13"
        fill="white"
        opacity="0.95"
        style={{ letterSpacing: "-0.5px" }}
      >
        E11
      </text>
    </svg>
  );
}
