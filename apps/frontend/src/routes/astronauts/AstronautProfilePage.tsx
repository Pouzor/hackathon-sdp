import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAstronaut, type Astronaut } from "@/components/features/astronauts/mockAstronauts";

type Tab = "contributions" | "trophees";

function StatCard({ label, value, color = "white" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, padding: "12px 18px",
    }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color, fontSize: 20, fontWeight: 800, fontFamily: "'Arial Black', Arial, sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

function yearsAt(hireDate: string): number {
  const hire = new Date(hireDate);
  const now = new Date();
  return Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365));
}

function ProfileNotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#040812",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "white", gap: 16,
    }}>
      <div style={{ fontSize: 48 }}>🚀</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Astronaute introuvable</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>Cet astronaute n'existe pas ou a quitté la galaxie.</p>
      <button
        onClick={() => navigate("/astronauts")}
        style={{
          marginTop: 8, background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
          color: "white", fontSize: 13, padding: "8px 20px", cursor: "pointer",
        }}
      >
        ← Retour aux astronautes
      </button>
    </div>
  );
}

export function AstronautProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("contributions");

  const astronaut: Astronaut | undefined = getAstronaut(Number(id));
  if (!astronaut) return <ProfileNotFound />;

  const { firstName, lastName, email, planet, grade, totalPoints, hireDate, hobbies, client, contributions, trophies } = astronaut;
  const initials = `${firstName[0]}${lastName[0]}`;
  const color = planet.color;
  const years = yearsAt(hireDate);

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "contributions", label: "Contributions", count: contributions.length },
    { key: "trophees",      label: "Trophées",      count: trophies.length },
  ];

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#040812", color: "white" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(4, 8, 18, 0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "18px 40px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <button
          onClick={() => navigate("/astronauts")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.45)", fontSize: 12,
            letterSpacing: "0.1em", textTransform: "uppercase", padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
        >
          ← Astronautes
        </button>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
          {firstName} {lastName}
        </span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px 60px" }}>

        {/* Hero card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "32px 36px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Color glow */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 260, height: 260, borderRadius: "50%",
            background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
            filter: "blur(30px)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", position: "relative" }}>
            {/* Avatar */}
            <div style={{
              width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${color}50, ${color}18)`,
              border: `3px solid ${color}60`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color,
              boxShadow: `0 0 30px ${color}30`,
            }}>
              {initials}
            </div>

            {/* Identity */}
            <div style={{ flex: 1 }}>
              <h1 style={{ color: "white", fontSize: 26, fontWeight: 900, margin: "0 0 4px", fontFamily: "'Arial Black', Arial, sans-serif" }}>
                {firstName} {lastName}
              </h1>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 12 }}>{email}</div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* Planet badge */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: `${color}18`, border: `1px solid ${color}40`,
                  borderRadius: 20, padding: "4px 12px",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  <span style={{ color, fontSize: 11, fontWeight: 600 }}>{planet.name}</span>
                </div>
                {/* Grade badge */}
                <div style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20, padding: "4px 12px",
                  color: "rgba(255,255,255,0.7)", fontSize: 11,
                }}>
                  {grade}
                </div>
                {/* Seniority badge */}
                {years > 0 && (
                  <div style={{
                    background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)",
                    borderRadius: 20, padding: "4px 12px",
                    color: "#fbbf24", fontSize: 11,
                  }}>
                    {years} an{years > 1 ? "s" : ""} chez E11
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <StatCard label="Total points" value={totalPoints.toLocaleString() + " pts"} color={color} />
            <StatCard label="Contributions" value={contributions.length.toString()} />
            <StatCard label="Trophées" value={trophies.length.toString()} color="#fbbf24" />
            {client !== "—" && <StatCard label="Client" value={client} />}
          </div>
        </div>

        {/* Hobbies */}
        {hobbies && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "14px 20px",
            marginBottom: 24,
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: 16 }}>🎲</span>
            <div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>Hobbies</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{hobbies}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 8,
        }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "12px 20px",
                color: tab === t.key ? "white" : "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                borderBottom: tab === t.key ? `2px solid ${color}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {t.label}
              <span style={{
                background: tab === t.key ? `${color}25` : "rgba(255,255,255,0.08)",
                color: tab === t.key ? color : "rgba(255,255,255,0.35)",
                fontSize: 10, borderRadius: 10, padding: "1px 7px", fontWeight: 600,
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ paddingTop: 12 }}>
          {tab === "contributions" && (
            <>
              {contributions.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40 }}>
                  Aucune contribution cette saison
                </p>
              ) : (
                contributions.map((c) => (
                  <div key={c.id} style={{
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{c.activity}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>{c.date}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700 }}>+{c.points}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 3 }}>pts</span>
                      </div>
                    </div>
                    {c.bonus && (
                      <div style={{
                        display: "inline-block", marginTop: 4,
                        background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
                        borderRadius: 4, padding: "1px 7px",
                        color: "#fbbf24", fontSize: 10,
                      }}>
                        {c.bonus}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {tab === "trophees" && (
            <>
              {trophies.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40 }}>
                  Aucun trophée pour l'instant
                </p>
              ) : (
                trophies.map((t) => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 28 }}>{t.icon}</span>
                    <div>
                      <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{t.description}</div>
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 3 }}>{t.date}</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
