// NOTE: Les styles inline sont intentionnels ici — les valeurs (couleurs API, rayons d'orbite,
// angles, durées d'animation) sont calculées dynamiquement depuis les données serveur et ne
// peuvent pas être exprimées avec des classes Tailwind statiques.
import { type ReactNode, useEffect, useRef, useState } from "react";
import { PUNCHLINES, type Punchline } from "./punchlines";
import { Sun } from "./planets/Sun";
import { HQPlanet } from "./planets/HQPlanet";
import { DuckPlanet } from "./planets/DuckPlanet";
import { SchizoCatsPlanet } from "./planets/SchizoCatsPlanet";
import { DonutPlanet } from "./planets/DonutPlanet";
import { RaccoonPlanet } from "./planets/RaccoonPlanet";

// ── Planet data type ─────────────────────────────────────────────────────────
export type PlanetData = {
  id: string; // slug visuel ("duck", "raccoon", …)
  apiId: number | null; // ID base de données (null tant que l'API n'a pas répondu)
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

// Config visuelle statique — fusionnée avec l'API dans useMergedPlanets()
export const PLANET_CONFIG: PlanetData[] = [
  {
    id: "hq",
    apiId: null,
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
    apiId: null,
    name: "Duck Invaders",
    score: 0,
    orbitRadius: 245,
    period: 15,
    startAngle: 130,
    size: 38,
    color: "#22c55e",
    isCompeting: true,
    Component: DuckPlanet,
  },
  {
    id: "cats",
    apiId: null,
    name: "SchizoCats",
    score: 0,
    orbitRadius: 365,
    period: 23,
    startAngle: 215,
    size: 51,
    color: "#3b82f6",
    isCompeting: true,
    Component: SchizoCatsPlanet,
  },
  {
    id: "donut",
    apiId: null,
    name: "Donut Factory",
    score: 0,
    orbitRadius: 480,
    period: 32,
    startAngle: 290,
    size: 48,
    color: "#ec4899",
    isCompeting: true,
    Component: DonutPlanet,
  },
  {
    id: "raccoon",
    apiId: null,
    name: "Raccoons of Asgard",
    score: 0,
    orbitRadius: 595,
    period: 41,
    startAngle: 355,
    size: 72,
    color: "#eab308",
    isCompeting: true,
    Component: RaccoonPlanet,
  },
];

// Rétrocompatibilité — utilisé par les composants qui n'ont pas encore migré
export const PLANETS = PLANET_CONFIG;

// Asteroid belt pre-computed positions (between SchizoCats and Donut orbits)
const ASTEROIDS = [
  { angle: 0, r: 424, s: 3.2 },
  { angle: 18, r: 432, s: 2.0 },
  { angle: 36, r: 418, s: 2.8 },
  { angle: 54, r: 436, s: 1.8 },
  { angle: 72, r: 422, s: 3.5 },
  { angle: 90, r: 428, s: 2.2 },
  { angle: 108, r: 416, s: 2.6 },
  { angle: 126, r: 434, s: 1.5 },
  { angle: 144, r: 426, s: 3.0 },
  { angle: 162, r: 420, s: 2.4 },
  { angle: 180, r: 430, s: 1.8 },
  { angle: 198, r: 418, s: 3.3 },
  { angle: 216, r: 436, s: 2.1 },
  { angle: 234, r: 422, s: 2.7 },
  { angle: 252, r: 428, s: 1.6 },
  { angle: 270, r: 424, s: 3.0 },
  { angle: 288, r: 432, s: 2.3 },
  { angle: 306, r: 416, s: 2.8 },
  { angle: 324, r: 434, s: 1.9 },
  { angle: 342, r: 426, s: 2.5 },
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

// ── CrownOrbit ───────────────────────────────────────────────────────────────
function CrownOrbit({ planetSize }: { planetSize: number }) {
  const r = planetSize * 1.2; // rayon orbital autour de la planète
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        animation: "orbitSpin 3.5s linear infinite",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -r,
          left: 0,
          transform: "translate(-50%, -50%)",
          animation: "orbitSpin 3.5s linear infinite reverse",
          fontSize: Math.max(12, planetSize * 0.38),
          lineHeight: 1,
          filter: "drop-shadow(0 0 6px rgba(255,210,0,0.9))",
          userSelect: "none",
        }}
      >
        👑
      </div>
    </div>
  );
}

// ── SpeechBubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ punchline, color, visible }: { punchline: Punchline; color: string; visible: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: 180,
        pointerEvents: "none",
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transition: visible ? "opacity 0.25s ease" : "opacity 0.4s ease",
      }}
    >
      {/* Bulle */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: "8px 12px",
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 2px ${color}, 0 0 14px ${color}60`,
          position: "relative",
          border: `2px solid ${color}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            color: "#111",
            lineHeight: 1.4,
            textAlign: "center",
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
          }}
        >
          {punchline.text}
        </p>
      </div>
      {/* Queue de la bulle */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: `10px solid ${color}`,
          margin: "0 auto",
          position: "relative",
          top: -2,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "8px solid white",
          margin: "0 auto",
          position: "relative",
          top: -12,
        }}
      />
    </div>
  );
}

// ── OrbitingPlanet ───────────────────────────────────────────────────────────
function OrbitingPlanet({
  planet,
  billboard = false,
  isLeader = false,
  activePunchline,
  onPlanetClick,
  children,
}: {
  planet: PlanetData;
  billboard?: boolean;
  isLeader?: boolean;
  activePunchline?: { punchline: Punchline; visible: boolean } | null;
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
            <div
              className="planet-wrapper"
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => onPlanetClick?.(planet)}
            >
              {activePunchline && (
                <SpeechBubble
                  punchline={activePunchline.punchline}
                  color={planet.color}
                  visible={activePunchline.visible}
                />
              )}
              {children}
              {isLeader && <CrownOrbit planetSize={planet.size} />}
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
type ActiveBubble = {
  planetId: string;
  punchline: Punchline;
  visible: boolean;
};

const COMPETING_IDS = ["duck", "cats", "donut", "raccoon"];

export function SolarSystem({
  planets = PLANET_CONFIG,
  onPlanetClick,
}: {
  planets?: PlanetData[];
  onPlanetClick?: (planet: PlanetData) => void;
}) {
  const competing = planets.filter((p) => p.isCompeting);
  const maxScore = Math.max(0, ...competing.map((p) => p.score));
  const leaderId = maxScore > 0 ? (competing.find((p) => p.score === maxScore)?.id ?? null) : null;

  const [activeBubble, setActiveBubble] = useState<ActiveBubble | null>(null);
  const usedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const fire = () => {
      // Choisir une planète compétitrice au hasard
      const fromId = COMPETING_IDS[Math.floor(Math.random() * COMPETING_IDS.length)]!;
      // Filtrer les punchlines de cette planète
      const pool = PUNCHLINES.filter((p) => p.from === fromId);
      // Éviter de répéter trop vite
      const available = pool.filter((_, i) => !usedRef.current.has(i + fromId.length * 100));
      const list = available.length > 0 ? available : pool;
      const idx = Math.floor(Math.random() * list.length);
      const chosen = list[idx]!;

      // Marquer comme utilisé (reset après 20 tirages)
      const key = PUNCHLINES.indexOf(chosen);
      usedRef.current.add(key);
      if (usedRef.current.size > 20) usedRef.current.clear();

      // Afficher (visible=true)
      setActiveBubble({ planetId: fromId, punchline: chosen, visible: true });

      // Après 4.5s, fade out
      setTimeout(() => {
        setActiveBubble((prev) => prev ? { ...prev, visible: false } : null);
      }, 4500);
      // Après 5s, effacer
      setTimeout(() => {
        setActiveBubble(null);
      }, 5200);
    };

    // Premier tir après 5s, puis toutes les 30s
    const initialTimer = setTimeout(fire, 5000);
    const interval = setInterval(fire, 15000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

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
        {planets.map((p) => (
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
        {planets.map((planet) => (
          <OrbitingPlanet
            key={planet.id}
            planet={planet}
            billboard
            isLeader={planet.id === leaderId}
            activePunchline={
              activeBubble?.planetId === planet.id
                ? { punchline: activeBubble.punchline, visible: activeBubble.visible }
                : null
            }
            onPlanetClick={onPlanetClick}
          >
            <planet.Component size={planet.size} />
          </OrbitingPlanet>
        ))}
      </div>
    </div>
  );
}
