import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/features/solar-system/StarField";
import { SolarSystem, PLANETS, type PlanetData } from "@/components/features/solar-system/SolarSystem";
import { PlanetDetail } from "@/components/features/planet-detail/PlanetDetail";

// ── Mock current user ────────────────────────────────────────────────────────
const ME = { name: "Jean Dupont", points: 420, contributions: 8 };

// ── NavBar ───────────────────────────────────────────────────────────────────
const NAV_LINK: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  fontSize: 13,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  padding: "6px 12px",
  borderRadius: 6,
  transition: "color 0.2s, background 0.2s",
  whiteSpace: "nowrap" as const,
  textDecoration: "none",
};

function NavLink({ children, to }: { children: React.ReactNode; to?: string }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); if (to) navigate(to); }}
      style={{
        ...NAV_LINK,
        color: hovered ? "white" : "rgba(255,255,255,0.75)",
        background: hovered ? "rgba(255,255,255,0.07)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

function NavBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        // Inset depth effect: outer shadow pushes it back, inner shadow adds bevel
        background: "rgba(2, 5, 14, 0.75)",
        backdropFilter: "blur(16px)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: [
          "0 8px 32px rgba(0,0,0,0.6)",          // outer depth
          "inset 0 1px 0 rgba(255,255,255,0.06)", // top bevel highlight
          "inset 0 -1px 0 rgba(0,0,0,0.4)",       // bottom inner shadow
          "inset 2px 0 8px rgba(0,0,0,0.3)",      // left inner depth
        ].join(", "),
        padding: "4px 6px",
      }}
    >
      {/* Nav links */}
      <NavLink to="/astronauts">Astronautes</NavLink>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

      <NavLink>Mon Profil</NavLink>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

      {/* My points — distinct inset counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "0 2px",
          padding: "5px 12px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: [
            "inset 0 2px 6px rgba(0,0,0,0.6)",
            "inset 0 1px 0 rgba(0,0,0,0.8)",
          ].join(", "),
          cursor: "pointer",
        }}
      >
        {/* Star icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1 }}>
            Mes points
          </span>
          <span style={{ color: "#fbbf24", fontSize: 15, fontWeight: 800, lineHeight: 1, fontFamily: "'Arial Black', Arial, sans-serif" }}>
            {ME.points.toLocaleString()}
          </span>
        </div>

        {/* Contributions badge */}
        <div
          style={{
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: 4,
            padding: "2px 6px",
          }}
        >
          <span style={{ color: "#fbbf24", fontSize: 10, opacity: 0.8 }}>
            {ME.contributions} contrib.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
const RANK_ICONS = ["👑", "🥈", "🥉", "4"];

function Leaderboard() {
  const competing = [...PLANETS]
    .filter((p) => p.isCompeting)
    .sort((a, b) => b.score - a.score);

  const max = competing[0]?.score ?? 1;

  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        top: 90,
        width: 230,
        zIndex: 20,
        background: "rgba(2, 5, 14, 0.78)",
        backdropFilter: "blur(18px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: [
          "0 8px 40px rgba(0,0,0,0.7)",
          "inset 0 1px 0 rgba(255,255,255,0.06)",
          "inset 0 -1px 0 rgba(0,0,0,0.5)",
          "inset -2px 0 10px rgba(0,0,0,0.3)",
        ].join(", "),
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Classement
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "4px 0 0", letterSpacing: "0.1em" }}>
          Saison 2026
        </p>
      </div>

      {/* Rows */}
      <div style={{ padding: "8px 0" }}>
        {competing.map((planet, i) => {
          const pct = (planet.score / max) * 100;
          const isFirst = i === 0;
          return (
            <div
              key={planet.id}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                transition: "background 0.2s",
                background: isFirst ? `rgba(${hexToRgb(planet.color)}, 0.06)` : "transparent",
                borderLeft: isFirst ? `2px solid ${planet.color}` : "2px solid transparent",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = `rgba(${hexToRgb(planet.color)}, 0.08)`)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  isFirst ? `rgba(${hexToRgb(planet.color)}, 0.06)` : "transparent")
              }
            >
              {/* Rank + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: i === 0 ? 16 : 12, lineHeight: 1, minWidth: 18, textAlign: "center" }}>
                  {RANK_ICONS[i]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: isFirst ? "white" : "rgba(255,255,255,0.75)",
                      fontSize: 12,
                      fontWeight: isFirst ? 700 : 500,
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {planet.name}
                  </div>
                </div>
                <span
                  style={{
                    color: isFirst ? planet.color : "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Arial Black', Arial, sans-serif",
                  }}
                >
                  {planet.score.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 3,
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${planet.color}88, ${planet.color})`,
                    borderRadius: 2,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — total pts this season */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Total saison
        </span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>
          {competing.reduce((s, p) => s + p.score, 0).toLocaleString()} pts
        </span>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export function HomePage() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const planetSelected = selectedPlanet !== null;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: "100vw", height: "100vh", background: "#040812" }}
    >
      {/* Animated star field */}
      <StarField />

      {/* Nebula glow blobs — purely decorative */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30,60,120,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "8%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(80,20,100,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
          background: "linear-gradient(to bottom, rgba(4,8,18,0.7) 0%, transparent 100%)",
        }}
      >
        <div>
          <h1
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
              fontFamily: "'Arial Black', Arial, sans-serif",
              textShadow: "0 0 20px rgba(255,200,0,0.4)",
            }}
          >
            Site des Planètes
          </h1>
          <p
            style={{
              color: "#fbbf24",
              fontSize: 12,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              margin: "4px 0 0",
              opacity: 0.8,
            }}
          >
            Eleven Labs · Saison 2026
          </p>
        </div>

        <NavBar />
      </div>

      {/* Leaderboard — left side */}
      <Leaderboard />

      {/* Solar System — centered, fades + shifts left when planet selected */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          opacity: planetSelected ? 0.15 : 1,
          transform: planetSelected ? "scale(0.82) translateX(-12%)" : "scale(1) translateX(0)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          pointerEvents: planetSelected ? "none" : "auto",
        }}
      >
        <SolarSystem onPlanetClick={setSelectedPlanet} />
      </div>

      {/* Planet Detail overlay */}
      {selectedPlanet && (
        <PlanetDetail
          planet={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
          visible={planetSelected}
        />
      )}

      {/* Subtle bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        To infinity and beyond
      </div>
    </div>
  );
}
