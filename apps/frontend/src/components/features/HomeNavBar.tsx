/**
 * Barre de navigation flottante de la homepage.
 *
 * Note: ce composant utilise des inline styles pour les effets visuels
 * qui nécessitent des valeurs dynamiques (box-shadow layering, backdrop-filter).
 * Les couleurs statiques sont en Tailwind quand possible.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAstronaut } from "@/api/astronauts";
import { apiClient } from "@/lib/apiClient";
import type { PointAttribution } from "@/api/types";

function NavLink({ children, to }: { children: React.ReactNode; to?: string }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { if (to) navigate(to); }}
      disabled={!to}
      style={{
        color: hovered ? "white" : "rgba(255,255,255,0.75)",
        background: hovered ? "rgba(255,255,255,0.07)" : "transparent",
        fontSize: 13,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: to ? "pointer" : "default",
        padding: "6px 12px",
        borderRadius: 6,
        transition: "color 0.2s, background 0.2s",
        whiteSpace: "nowrap",
        border: "none",
      }}
      onMouseEnter={() => { setHovered(true); }}
      onMouseLeave={() => { setHovered(false); }}
    >
      {children}
    </button>
  );
}

export function HomeNavBar() {
  const { user } = useAuth();
  const astronautId = user?.astronaut_id;
  const { data: astronaut } = useAstronaut(astronautId ?? 0);
  const { data: contributions = [] } = useQuery({
    queryKey: ["point-attributions", "astronaut", astronautId],
    queryFn: () =>
      apiClient.get<PointAttribution[]>(`/point-attributions?astronaut_id=${astronautId!}`),
    enabled: !!astronautId,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "rgba(2, 5, 14, 0.75)",
        backdropFilter: "blur(16px)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: [
          "0 8px 32px rgba(0,0,0,0.6)",
          "inset 0 1px 0 rgba(255,255,255,0.06)",
          "inset 0 -1px 0 rgba(0,0,0,0.4)",
          "inset 2px 0 8px rgba(0,0,0,0.3)",
        ].join(", "),
        padding: "4px 6px",
      }}
    >
      <NavLink to="/astronauts">Astronautes</NavLink>

      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

      <NavLink to={user ? `/astronauts/${user.astronaut_id}` : undefined}>Mon Profil</NavLink>

      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

      {/* My points counter */}
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
          boxShadow: ["inset 0 2px 6px rgba(0,0,0,0.6)", "inset 0 1px 0 rgba(0,0,0,0.8)"].join(", "),
          cursor: "pointer",
        }}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1 }}>
            Mes points
          </span>
          <span style={{ color: "#fbbf24", fontSize: 15, fontWeight: 800, lineHeight: 1, fontFamily: "'Arial Black', Arial, sans-serif" }}>
            {(astronaut?.total_points ?? 0).toLocaleString()}
          </span>
        </div>

        <div style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 4, padding: "2px 6px" }}>
          <span style={{ color: "#fbbf24", fontSize: 10, opacity: 0.8 }}>
            {contributions.length} contrib.
          </span>
        </div>
      </div>
    </div>
  );
}
