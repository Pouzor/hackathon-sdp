import { useState } from "react";
import { type PlanetData, PLANET_CONFIG } from "@/components/features/solar-system/SolarSystem";
import { useAstronauts } from "@/api/astronauts";
import { usePlanetContributions } from "@/api/planets";
import type { Astronaut, PointAttribution } from "@/api/types";
import { type Trophy } from "./mockData";

// Blason images
import canardPng  from "../../../../img/blasons/Canard.png";
import chatPng    from "../../../../img/blasons/Chat.png";
import pandaPng   from "../../../../img/blasons/Panda.png";
import raccoonPng from "../../../../img/blasons/Raccoon.png";
import genericPng from "../../../../img/blasons/Generic.png";

const BLASONS: Record<string, string> = {
  duck:    canardPng,
  cats:    chatPng,
  donut:   pandaPng,
  raccoon: raccoonPng,
  hq:      genericPng,
};

type Tab = "membres" | "contributions" | "trophees";

// ── Sub-components ────────────────────────────────────────────────────────────

function MemberRow({ member, rank, color }: { member: Astronaut; rank: number; color: string }) {
  const initials = `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, width: 18, textAlign: "right" }}>
        {rank}
      </span>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}60, ${color}20)`,
        border: `1px solid ${color}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color, flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
          {member.first_name} {member.last_name}
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{member.grade_name ?? "—"}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{ color, fontSize: 14, fontWeight: 700 }}>{member.total_points.toLocaleString()}</span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 3 }}>pts</span>
      </div>
    </div>
  );
}

function ContributionRow({ c }: { c: PointAttribution }) {
  const astronautName = c.astronaut_first_name
    ? `${c.astronaut_first_name} ${c.astronaut_last_name ?? ""}`.trim()
    : `Astronaute #${c.astronaut_id}`;
  const bonus = c.first_ever_multiplier_applied
    ? "×2 first ever"
    : c.first_season_bonus_applied
    ? "+25 first season"
    : null;
  const date = c.awarded_at.slice(0, 10);

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{c.activity_name ?? `Activité #${c.activity_id}`}</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>
            {astronautName} · {date}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700 }}>+{c.points}</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 3 }}>pts</span>
        </div>
      </div>
      {bonus && (
        <div style={{
          display: "inline-block", marginTop: 4,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
          borderRadius: 4, padding: "1px 7px", color: "#fbbf24", fontSize: 10,
        }}>
          {bonus}
        </div>
      )}
    </div>
  );
}

function TrophyCard({ trophy }: { trophy: Trophy }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
      marginBottom: 8,
    }}>
      <span style={{ fontSize: 28 }}>{trophy.icon}</span>
      <div>
        <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{trophy.name}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{trophy.description}</div>
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 3 }}>{trophy.date}</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PlanetDetail({
  planet,
  onClose,
  visible,
}: {
  planet: PlanetData;
  onClose: () => void;
  visible: boolean;
}) {
  const [tab, setTab] = useState<Tab>("contributions");
  const blason = BLASONS[planet.id] ?? genericPng;
  const planetEntry = PLANET_CONFIG.find((p) => p.id === planet.id);

  const { data: members = [] } = useAstronauts(planet.apiId ?? undefined);
  const { data: contributions = [] } = usePlanetContributions(planet.apiId);
  // Trophées : pas encore d'API — liste vide en attendant
  const trophies: Trophy[] = [];

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "membres",       label: "Membres",       count: members.length },
    { key: "contributions", label: "Contributions", count: contributions.length },
    { key: "trophees",      label: "Trophées",      count: trophies.length },
  ];

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 30,
          background: "rgba(2, 5, 14, 0.55)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Left panel — planet visual */}
      <div
        style={{
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          width: "38%",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-60px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          pointerEvents: "none",
        }}
      >
        {/* Color glow behind blason */}
        <div style={{
          position: "absolute",
          width: 320, height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${planet.color}30 0%, transparent 70%)`,
          filter: "blur(40px)",
          top: "12%",
        }} />

        {/* Blason image — smaller, higher up */}
        <img
          src={blason}
          alt={planet.name}
          style={{
            width: 220, height: 220,
            objectFit: "contain",
            position: "relative",
            marginTop: -40,
            filter: `drop-shadow(0 0 24px ${planet.color}60)`,
            animation: visible ? "planetFloat 4s ease-in-out infinite" : "none",
          }}
          draggable={false}
        />

        {/* Planet name */}
        <div style={{ position: "relative", textAlign: "center", marginTop: 10 }}>
          <h2 style={{
            color: "white", fontSize: 20, fontWeight: 900,
            letterSpacing: "0.1em", textTransform: "uppercase", margin: 0,
            fontFamily: "'Arial Black', Arial, sans-serif",
            textShadow: `0 0 20px ${planet.color}80`,
          }}>
            {planet.name}
          </h2>
          <p style={{
            color: planet.color, fontSize: 24, fontWeight: 800, margin: "4px 0 0",
            fontFamily: "'Arial Black', Arial, sans-serif",
          }}>
            {planet.score.toLocaleString()} <span style={{ fontSize: 13, opacity: 0.7 }}>pts</span>
          </p>
        </div>

        {/* Planet 3D component — pulsing scale */}
        {planetEntry && (
          <div style={{
            position: "relative",
            marginTop: 28,
            animation: visible ? "planetPulse 3s ease-in-out infinite" : "none",
            filter: `drop-shadow(0 0 20px ${planet.color}70)`,
          }}>
            <planetEntry.Component size={planetEntry.size * 1.6} />
          </div>
        )}
      </div>

      {/* Right panel — content */}
      <div
        style={{
          position: "fixed",
          right: 0, top: 0, bottom: 0,
          width: "58%",
          zIndex: 40,
          background: "rgba(2, 5, 14, 0.92)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.6), inset 1px 0 0 rgba(255,255,255,0.04)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(80px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "28px 32px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
          flexShrink: 0,
        }}>
          {/* Back button */}
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              color: "rgba(255,255,255,0.45)", fontSize: 12,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: 0, marginBottom: 16,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
          >
            ← Retour au système
          </button>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Score saison",  value: planet.score.toLocaleString() + " pts", color: planet.color },
              { label: "Membres",       value: members.length.toString(),              color: "white" },
              { label: "Contributions", value: contributions.length.toString(),        color: "white" },
              { label: "Trophées",      value: trophies.length.toString(),             color: "#fbbf24" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8, padding: "10px 16px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ color: stat.color, fontSize: 18, fontWeight: 700, fontFamily: "'Arial Black', Arial, sans-serif" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 32px",
          flexShrink: 0,
        }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "14px 20px",
                color: tab === t.key ? "white" : "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                letterSpacing: "0.05em",
                borderBottom: tab === t.key ? `2px solid ${planet.color}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.2s, border-color 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: tab === t.key ? `${planet.color}25` : "rgba(255,255,255,0.08)",
                  color: tab === t.key ? planet.color : "rgba(255,255,255,0.35)",
                  fontSize: 10, borderRadius: 10, padding: "1px 7px", fontWeight: 600,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 32px 32px" }}>

          {tab === "membres" && (
            <div style={{ paddingTop: 8 }}>
              {members.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40 }}>
                  Aucun membre pour l'instant
                </p>
              ) : (
                [...members]
                  .sort((a, b) => b.total_points - a.total_points)
                  .map((m, i) => <MemberRow key={m.id} member={m} rank={i + 1} color={planet.color} />)
              )}
            </div>
          )}

          {tab === "contributions" && (
            <div style={{ paddingTop: 8 }}>
              {contributions.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40 }}>
                  Aucune contribution cette saison
                </p>
              ) : (
                contributions.map((c) => <ContributionRow key={c.id} c={c} />)
              )}
            </div>
          )}

          {tab === "trophees" && (
            <div style={{ paddingTop: 12 }}>
              {trophies.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40 }}>
                  Aucun trophée pour l'instant
                </p>
              ) : (
                trophies.map((t) => <TrophyCard key={t.id} trophy={t} />)
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
