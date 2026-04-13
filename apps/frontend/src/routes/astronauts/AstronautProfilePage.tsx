import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAstronaut } from "@/api/astronauts";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarUrl } from "@/lib/apiClient";
import type { PointAttribution } from "@/api/types";
import { useMergedPlanets } from "@/api/useMergedPlanets";

import canardPng from "../../../img/blasons/Canard.png";
import chatPng from "../../../img/blasons/Chat.png";
import pandaPng from "../../../img/blasons/Panda.png";
import raccoonPng from "../../../img/blasons/Raccoon.png";
import genericPng from "../../../img/blasons/Generic.png";

const BLASONS: Record<string, string> = {
  duck: canardPng,
  cats: chatPng,
  donut: pandaPng,
  raccoon: raccoonPng,
  hq: genericPng,
};

type Tab = "contributions" | "trophees";

function StatCard({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        padding: "12px 18px",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontSize: 20,
          fontWeight: 800,
          fontFamily: "'Arial Black', Arial, sans-serif",
        }}
      >
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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#040812",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 48 }}>🚀</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Astronaute introuvable</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>
        Cet astronaute n'existe pas ou a quitté la galaxie.
      </p>
      <button
        onClick={() => {
          navigate("/astronauts");
        }}
        style={{
          marginTop: 8,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8,
          color: "white",
          fontSize: 13,
          padding: "8px 20px",
          cursor: "pointer",
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

  const astronautId = Number(id);
  const { user } = useAuth();
  const isOwnProfile = user?.astronaut_id === astronautId;
  const { data: astronaut, isLoading, isError } = useAstronaut(astronautId);
  const { planets } = useMergedPlanets();

  const { data: contributions = [] } = useQuery({
    queryKey: ["point-attributions", "astronaut", astronautId],
    queryFn: () =>
      apiClient.get<PointAttribution[]>(`/point-attributions?astronaut_id=${astronautId}`),
    enabled: !isNaN(astronautId),
  });

  if (isLoading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#040812",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        Chargement…
      </div>
    );
  }

  if (isError || !astronaut) return <ProfileNotFound />;

  const planet = planets.find((p) => p.apiId === astronaut.planet_id) ?? null;
  const color = planet?.color ?? "#b8c8e8";
  const blason = planet ? (BLASONS[planet.id] ?? genericPng) : genericPng;
  const initials = `${astronaut.first_name.charAt(0)}${astronaut.last_name.charAt(0)}`;
  const years = astronaut.hire_date ? yearsAt(astronaut.hire_date) : 0;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "contributions", label: "Contributions", count: contributions.length },
    { key: "trophees", label: "Trophées", count: 0 },
  ];

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#040812",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blason oversized background */}
      <img
        src={blason}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "fixed",
          right: -180,
          bottom: -180,
          width: 700,
          height: 700,
          objectFit: "contain",
          opacity: 0.05,
          pointerEvents: "none",
          filter: `drop-shadow(0 0 40px ${color}30)`,
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          isolation: "isolate",
          background: "rgba(4, 8, 18, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          onClick={() => {
            navigate("/astronauts");
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")
          }
        >
          ← Astronautes
        </button>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
          {astronaut.first_name} {astronaut.last_name}
        </span>

        {isOwnProfile && (
          <>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => { navigate("/profile/edit"); }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "rgba(255,255,255,0.75)",
                fontSize: 12,
                letterSpacing: "0.08em",
                padding: "6px 14px",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
              }}
            >
              ✏ Modifier mon profil
            </button>
          </>
        )}
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 40px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Hero card */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "32px 36px",
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", position: "relative" }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                flexShrink: 0,
                background: `linear-gradient(135deg, ${color}50, ${color}18)`,
                border: `3px solid ${color}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color,
                boxShadow: `0 0 30px ${color}30`,
                overflow: "hidden",
              }}
            >
              {getAvatarUrl(astronaut.photo_url) ? (
                <img
                  src={getAvatarUrl(astronaut.photo_url)!}
                  alt={initials}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h1
                style={{
                  color: "white",
                  fontSize: 26,
                  fontWeight: 900,
                  margin: "0 0 4px",
                  fontFamily: "'Arial Black', Arial, sans-serif",
                }}
              >
                {astronaut.first_name} {astronaut.last_name}
              </h1>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 12 }}>
                {astronaut.email}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {planet && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                      borderRadius: 20,
                      padding: "4px 12px",
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                    <span style={{ color, fontSize: 11, fontWeight: 600 }}>{planet.name}</span>
                  </div>
                )}
                {astronaut.grade_name && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: "4px 12px",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 11,
                    }}
                  >
                    {astronaut.grade_name}
                  </div>
                )}
                {years > 0 && (
                  <div
                    style={{
                      background: "rgba(251,191,36,0.1)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      borderRadius: 20,
                      padding: "4px 12px",
                      color: "#fbbf24",
                      fontSize: 11,
                    }}
                  >
                    {years} an{years > 1 ? "s" : ""} chez E11
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <StatCard
              label="Total points"
              value={astronaut.total_points.toLocaleString() + " pts"}
              color={color}
            />
            <StatCard label="Contributions" value={contributions.length.toString()} />
            <StatCard label="Trophées" value="0" color="#fbbf24" />
            {astronaut.client && astronaut.client !== "—" && (
              <StatCard label="Client" value={astronaut.client} />
            )}
          </div>
        </div>

        {/* Hobbies */}
        {astronaut.hobbies && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 24,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 16 }}>🎲</span>
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Hobbies
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                {astronaut.hobbies}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: 8,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "12px 20px",
                color: tab === t.key ? "white" : "rgba(255,255,255,0.4)",
                fontSize: 13,
                fontWeight: tab === t.key ? 600 : 400,
                borderBottom: tab === t.key ? `2px solid ${color}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t.label}
              <span
                style={{
                  background: tab === t.key ? `${color}25` : "rgba(255,255,255,0.08)",
                  color: tab === t.key ? color : "rgba(255,255,255,0.35)",
                  fontSize: 10,
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontWeight: 600,
                }}
              >
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
                contributions.map((c) => {
                  const bonus = c.first_ever_multiplier_applied
                    ? "×2 first ever"
                    : c.first_season_bonus_applied
                      ? "+25 first season"
                      : null;
                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>
                            {c.activity_name ?? `Activité #${c.activity_id}`}
                          </div>
                          <div
                            style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}
                          >
                            {c.awarded_at.slice(0, 10)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700 }}>
                            +{c.points}
                          </span>
                          <span
                            style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 3 }}
                          >
                            pts
                          </span>
                        </div>
                      </div>
                      {bonus && (
                        <div
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            background: "rgba(251,191,36,0.12)",
                            border: "1px solid rgba(251,191,36,0.25)",
                            borderRadius: 4,
                            padding: "1px 7px",
                            color: "#fbbf24",
                            fontSize: 10,
                          }}
                        >
                          {bonus}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {tab === "trophees" && (
            <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40 }}>
              Aucun trophée pour l'instant
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
