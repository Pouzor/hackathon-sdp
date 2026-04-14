/**
 * Carte de progression de grade — affichée à droite de la homepage.
 * Montre le grade actuel, les points, et la progression vers le grade suivant.
 */
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAstronaut } from "@/api/astronauts";
import { useGrades } from "@/api/grades";
import type { Grade } from "@/api/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveGrades(points: number, grades: Grade[]): {
  current: Grade | null;
  next: Grade | null;
  pct: number;
  toNext: number;
} {
  const sorted = [...grades].sort((a, b) => a.threshold_points - b.threshold_points);
  let current: Grade | null = null;
  let next: Grade | null = null;

  for (const g of sorted) {
    if (points >= g.threshold_points) current = g;
    else if (next === null) next = g;
  }

  const from = current?.threshold_points ?? 0;
  const to = next?.threshold_points ?? null;
  const pct = to !== null ? Math.min(100, ((points - from) / (to - from)) * 100) : 100;
  const toNext = to !== null ? Math.max(0, to - points) : 0;

  return { current, next, pct, toNext };
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function RankCard() {
  const { user } = useAuth();
  const astronautId = user?.astronaut_id ?? 0;
  const { data: astronaut } = useAstronaut(astronautId);
  const { data: grades = [] } = useGrades();

  const { current, next, pct, toNext } = useMemo(
    () => resolveGrades(astronaut?.total_points ?? 0, grades),
    [astronaut, grades],
  );

  const points = astronaut?.total_points ?? 0;
  const isMaxGrade = next === null && current !== null;

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        top: 90,
        width: 240,
        zIndex: 20,
        background: "rgba(2, 5, 14, 0.78)",
        backdropFilter: "blur(18px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: [
          "0 8px 40px rgba(0,0,0,0.7)",
          "inset 0 1px 0 rgba(255,255,255,0.06)",
          "inset 0 -1px 0 rgba(0,0,0,0.5)",
          "inset 2px 0 10px rgba(0,0,0,0.3)",
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
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Hexagon icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(99,210,255,0.8)" strokeWidth="2">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        </svg>
        <div>
          <span
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Mon Grade
          </span>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "2px 0 0", letterSpacing: "0.1em" }}>
            Progression personnelle
          </p>
        </div>
      </div>

      {/* Grade actuel */}
      <div style={{ padding: "16px 16px 4px" }}>
        {/* Badge grade */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              Grade actuel
            </p>
            <p
              style={{
                color: current ? "rgba(99,210,255,1)" : "rgba(255,255,255,0.4)",
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "3px 0 0",
                fontFamily: "'Arial Black', Arial, sans-serif",
                textShadow: current ? "0 0 16px rgba(99,210,255,0.5)" : "none",
              }}
            >
              {current?.name ?? "Recrue"}
            </p>
          </div>
          {isMaxGrade && (
            <span style={{ fontSize: 20, filter: "drop-shadow(0 0 6px rgba(255,210,0,0.8))" }}>
              🏆
            </span>
          )}
        </div>

        {/* Points total */}
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              Points totaux
            </p>
            <p
              style={{
                color: "#fbbf24",
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1,
                margin: "4px 0 0",
                fontFamily: "'Arial Black', Arial, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {points.toLocaleString("fr-FR")}
            </p>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fbbf24" opacity="0.6">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        {/* Barre de progression */}
        {!isMaxGrade && next && (
          <div style={{ marginBottom: 14 }}>
            {/* Labels */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {current?.name ?? "Recrue"}
              </span>
              <span style={{ color: "rgba(99,210,255,0.7)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {next.name}
              </span>
            </div>

            {/* Track */}
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Glow fill */}
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, rgba(0,160,220,0.6), rgba(99,210,255,1))",
                  borderRadius: 3,
                  transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: "0 0 8px rgba(99,210,255,0.7), 0 0 16px rgba(99,210,255,0.3)",
                  position: "relative",
                }}
              >
                {/* Shimmer sweep */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                    animation: "shimmer 2.2s ease-in-out infinite",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            </div>

            {/* Pct label */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <span
                style={{
                  color: "rgba(99,210,255,0.6)",
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {Math.round(pct)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer — points manquants */}
      <div
        style={{
          padding: "10px 16px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        {isMaxGrade ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.1em", textAlign: "center", margin: 0, textTransform: "uppercase" }}>
            Grade maximum atteint 🌟
          </p>
        ) : next ? (
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Prochain grade
            </span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700 }}>
              <span
                style={{
                  color: "#fbbf24",
                  fontFamily: "monospace",
                  fontSize: 13,
                  textShadow: "0 0 8px rgba(251,191,36,0.5)",
                }}
              >
                -{toNext.toLocaleString("fr-FR")}
              </span>{" "}
              pts
            </span>
          </div>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textAlign: "center", margin: 0 }}>
            Aucun grade configuré
          </p>
        )}
      </div>
    </div>
  );
}
