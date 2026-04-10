import { type ReactNode } from "react";
import { Sun } from "./planets/Sun";
import { HQPlanet } from "./planets/HQPlanet";
import { DuckPlanet } from "./planets/DuckPlanet";
import { SchizoCatsPlanet } from "./planets/SchizoCatsPlanet";
import { DonutPlanet } from "./planets/DonutPlanet";
import { RaccoonPlanet } from "./planets/RaccoonPlanet";

// ── Mock data ────────────────────────────────────────────────────────────────
export type PlanetData = {
  id: string;
  name: string;
  score: number;
  orbitRadius: number;
  period: number;
  startAngle: number;
  size: number;
  color: string;
  isCompeting: boolean;
  Component: React.FC<{ size: number }>;
};

export const PLANETS: PlanetData[] = [
  {
    id: "hq",
    name: "HQ",
    score: 0,
    orbitRadius: 145,
    period: 9,
    startAngle: 45,
    size: 32,
    color: "#b8c8e8",
    isCompeting: false,
    Component: HQPlanet,
  },
  {
    id: "duck",
    name: "Duck Invaders",
    score: 1100,
    orbitRadius: 245,
    period: 15,
    startAngle: 130,
    size: 52,
    color: "#22c55e",
    isCompeting: true,
    Component: DuckPlanet,
  },
  {
    id: "cats",
    name: "SchizoCats",
    score: 750,
    orbitRadius: 365,
    period: 23,
    startAngle: 215,
    size: 60,
    color: "#3b82f6",
    isCompeting: true,
    Component: SchizoCatsPlanet,
  },
  {
    id: "donut",
    name: "Donut Factory",
    score: 980,
    orbitRadius: 480,
    period: 32,
    startAngle: 290,
    size: 66,
    color: "#ec4899",
    isCompeting: true,
    Component: DonutPlanet,
  },
  {
    id: "raccoon",
    name: "Raccoons of Asgard",
    score: 1250,
    orbitRadius: 595,
    period: 41,
    startAngle: 355,
    size: 72,
    color: "#eab308",
    isCompeting: true,
    Component: RaccoonPlanet,
  },
];

// Asteroid belt pre-computed positions (between SchizoCats and Donut orbits)
const ASTEROIDS = [
  { angle: 0,   r: 424, s: 3.2 }, { angle: 18,  r: 432, s: 2.0 },
  { angle: 36,  r: 418, s: 2.8 }, { angle: 54,  r: 436, s: 1.8 },
  { angle: 72,  r: 422, s: 3.5 }, { angle: 90,  r: 428, s: 2.2 },
  { angle: 108, r: 416, s: 2.6 }, { angle: 126, r: 434, s: 1.5 },
  { angle: 144, r: 426, s: 3.0 }, { angle: 162, r: 420, s: 2.4 },
  { angle: 180, r: 430, s: 1.8 }, { angle: 198, r: 418, s: 3.3 },
  { angle: 216, r: 436, s: 2.1 }, { angle: 234, r: 422, s: 2.7 },
  { angle: 252, r: 428, s: 1.6 }, { angle: 270, r: 424, s: 3.0 },
  { angle: 288, r: 432, s: 2.3 }, { angle: 306, r: 416, s: 2.8 },
  { angle: 324, r: 434, s: 1.9 }, { angle: 342, r: 426, s: 2.5 },
];

// ── System constants ─────────────────────────────────────────────────────────
const SIZE = 1320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const TILT = 55; // degrees — must match rotateX on the solar plane

// ── OrbitRing ────────────────────────────────────────────────────────────────
function OrbitRing({
  radius,
  dashed = false,
  color = "rgba(255,255,255,0.1)",
}: {
  radius: number;
  dashed?: boolean;
  color?: string;
}) {
  const d = radius * 2;
  return (
    <div
      style={{
        position: "absolute",
        width: d,
        height: d,
        top: CX - radius,
        left: CY - radius,
        borderRadius: "50%",
        border: `1px ${dashed ? "dashed" : "solid"} ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

// ── OrbitingPlanet ───────────────────────────────────────────────────────────
function OrbitingPlanet({
  planet,
  billboard = false,
  onPlanetClick,
  children,
}: {
  planet: PlanetData;
  billboard?: boolean;
  onPlanetClick?: (planet: PlanetData) => void;
  children: ReactNode;
}) {
  const { orbitRadius, period, startAngle, name, score, color, isCompeting } = planet;
  const delay = -((startAngle / 360) * period);

  return (
    <div
      style={{
        position: "absolute",
        top: CY,
        left: CX,
        width: 0,
        height: 0,
        transformOrigin: "0 0",
        transformStyle: "preserve-3d",
        animation: `orbitSpin ${period}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Extend arm to orbit radius */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: orbitRadius,
          transform: "translate(-50%, -50%)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Counter-rotate Z so planet stays upright as it orbits */}
        <div
          style={{
            transformStyle: "preserve-3d",
            animation: `orbitSpin ${period}s linear infinite reverse`,
            animationDelay: `${delay}s`,
          }}
        >
          {/* Billboard: counter-tilt X so planet faces the viewer */}
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: billboard ? `rotateX(-${TILT}deg)` : undefined,
            }}
          >
            {/* Hover wrapper for tooltip */}
            <div className="planet-wrapper" style={{ position: "relative", cursor: "pointer" }} onClick={() => onPlanetClick?.(planet)}>
              {children}
              <div className="planet-tooltip">
                <span style={{ color }}>{name}</span>
                {isCompeting && (
                  <span style={{ color: "#94a3b8", marginLeft: 6 }}>
                    {score.toLocaleString()} pts
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AsteroidBelt ─────────────────────────────────────────────────────────────
function AsteroidBelt() {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  return (
    <div
      style={{
        position: "absolute",
        top: CY,
        left: CX,
        width: 0,
        height: 0,
        transformOrigin: "0 0",
        animation: "asteroidDrift 180s linear infinite",
      }}
    >
      {ASTEROIDS.map((ast, i) => {
        const x = ast.r * Math.cos(toRad(ast.angle));
        const y = ast.r * Math.sin(toRad(ast.angle));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: ast.s,
              height: ast.s * 0.65,
              borderRadius: "40%",
              background: `hsl(${25 + i * 4}, 15%, ${45 + (i % 3) * 8}%)`,
              transform: `translate(-50%, -50%) rotate(${i * 37}deg)`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ── SolarSystem ───────────────────────────────────────────────────────────────
export function SolarSystem({ onPlanetClick }: { onPlanetClick?: (planet: PlanetData) => void }) {
  return (
    <div
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          width: SIZE,
          height: SIZE,
          position: "relative",
          transform: "rotateX(55deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Orbit rings */}
        {PLANETS.map((p) => (
          <OrbitRing key={p.id} radius={p.orbitRadius} />
        ))}

        {/* Asteroid belt ring */}
        <OrbitRing radius={425} dashed color="rgba(255,255,255,0.07)" />

        {/* Asteroids */}
        <AsteroidBelt />

        {/* Sun — counter-tilt so it faces the viewer in the 3D plane */}
        <div
          style={{
            position: "absolute",
            top: CY,
            left: CX,
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) rotateX(-${TILT}deg)`,
            zIndex: 10,
          }}
        >
          <Sun />
        </div>

        {/* Planets */}
        {PLANETS.map((planet) => (
          <OrbitingPlanet key={planet.id} planet={planet} billboard onPlanetClick={onPlanetClick}>
            <planet.Component size={planet.size} />
          </OrbitingPlanet>
        ))}
      </div>
    </div>
  );
}
