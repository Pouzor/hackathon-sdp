import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAstronauts } from "@/api/astronauts";
import { useMergedPlanets } from "@/api/useMergedPlanets";
import type { Astronaut } from "@/api/types";
import { type PlanetData } from "@/components/features/solar-system/SolarSystem";

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

function findPlanetByApiId(planets: PlanetData[], planetId: number | null) {
  return planets.find((p) => p.apiId === planetId) ?? null;
}

const PLANET_FILTERS = [
  { id: "all", label: "Toutes les planètes", color: undefined },
  { id: "raccoon", label: "Raccoons of Asgard", color: "#eab308" },
  { id: "duck", label: "Duck Invaders", color: "#22c55e" },
  { id: "donut", label: "Donut Factory", color: "#ec4899" },
  { id: "cats", label: "SchizoCats", color: "#3b82f6" },
  { id: "hq", label: "HQ", color: "#b8c8e8" },
];

function AstronautCard({ astronaut, planets }: { astronaut: Astronaut; planets: PlanetData[] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const planet = findPlanetByApiId(planets, astronaut.planet_id);
  const color = planet?.color ?? "#b8c8e8";
  const blason = planet ? (BLASONS[planet.id] ?? genericPng) : genericPng;
  const initials = `${astronaut.first_name.charAt(0)}${astronaut.last_name.charAt(0)}`;

  return (
    <div
      onClick={() => {
        navigate(`/astronauts/${astronaut.id}`);
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={{
        position: "relative",
        overflow: "hidden",
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? color + "50" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 14,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Blason oversized background */}
      <img
        src={blason}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "absolute",
          right: -50,
          bottom: -55,
          width: 190,
          height: 190,
          objectFit: "contain",
          opacity: hovered ? 0.12 : 0.07,
          transition: "opacity 0.3s, transform 0.3s",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          pointerEvents: "none",
          filter: `drop-shadow(0 0 12px ${color}40)`,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            flexShrink: 0,
            background: `linear-gradient(135deg, ${color}50, ${color}18)`,
            border: `2px solid ${color}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>
            {astronaut.first_name} {astronaut.last_name}
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>
            {astronaut.grade_name ?? "—"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              color,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Arial Black', Arial, sans-serif",
            }}
          >
            {astronaut.total_points.toLocaleString()}
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>pts</div>
        </div>
      </div>

      {/* Planet badge */}
      {planet && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: `${color}12`,
            border: `1px solid ${color}30`,
            borderRadius: 6,
            padding: "4px 10px",
            width: "fit-content",
          }}
        >
          <div
            style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }}
          />
          <span style={{ color, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>
            {planet.name}
          </span>
        </div>
      )}
    </div>
  );
}

export function AstronautsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [planetSlugFilter, setPlanetSlugFilter] = useState("all");

  const { data: allAstronauts = [], isLoading } = useAstronauts();
  const { planets } = useMergedPlanets();

  const filtered = useMemo(() => {
    const targetPlanet = planets.find((p) => p.id === planetSlugFilter);
    return allAstronauts.filter((a) => {
      const matchName = `${a.first_name} ${a.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchPlanet =
        planetSlugFilter === "all" || (targetPlanet != null && a.planet_id === targetPlanet.apiId);
      return matchName && matchPlanet;
    });
  }, [allAstronauts, planets, search, planetSlugFilter]);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#040812", color: "white" }}>
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(4, 8, 18, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <button
          onClick={() => {
            navigate("/");
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
          ← Système solaire
        </button>

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />

        <h1
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: 0,
            fontFamily: "'Arial Black', Arial, sans-serif",
          }}
        >
          Astronautes
        </h1>

        <span
          style={{
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: 20,
            padding: "2px 10px",
            color: "#fbbf24",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {filtered.length}
        </span>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.35,
            }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un astronaute…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "white",
              padding: "7px 14px 7px 32px",
              fontSize: 13,
              width: 240,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Planet filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {PLANET_FILTERS.map((f) => {
            const active = planetSlugFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setPlanetSlugFilter(f.id);
                }}
                style={{
                  background: active
                    ? f.color
                      ? `${f.color}20`
                      : "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? (f.color ?? "rgba(255,255,255,0.3)") + "60" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 20,
                  padding: "6px 16px",
                  color: active ? (f.color ?? "white") : "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {f.color && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: f.color,
                      opacity: active ? 1 : 0.5,
                    }}
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              marginTop: 80,
              fontSize: 14,
            }}
          >
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              marginTop: 80,
              fontSize: 14,
            }}
          >
            Aucun astronaute trouvé
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((a) => (
              <AstronautCard key={a.id} astronaut={a} planets={planets} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
