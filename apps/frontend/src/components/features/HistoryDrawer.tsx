/**
 * Panneau latéral d'historique — contributions + trophées de l'astronaute connecté.
 * S'ouvre depuis le badge "X contrib." de la HomeNavBar.
 */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useTrophyAttributions } from "@/api/astronauts";
import { apiClient } from "@/lib/apiClient";
import type { PointAttribution, TrophyAttribution } from "@/api/types";

// ── Types internes ─────────────────────────────────────────────────────────────

type HistoryEntry =
  | { kind: "contribution"; date: string; data: PointAttribution }
  | { kind: "trophy"; date: string; data: TrophyAttribution };

// ── Sous-composants ────────────────────────────────────────────────────────────

function ContribRow({ item }: { item: PointAttribution }) {
  const label = item.activity_name ?? "Contribution";
  const pts = item.points;
  const date = new Date(item.awarded_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "rgba(251,191,36,0.10)",
          border: "1px solid rgba(251,191,36,0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
          <span style={{ color: "#fbbf24", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
            +{pts} pts
          </span>
        </div>
        {item.comment && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.comment}
          </p>
        )}
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 2, display: "block" }}>
          {date}
        </span>
      </div>
    </div>
  );
}

function TrophyRow({ item }: { item: TrophyAttribution }) {
  const label = item.trophy_name ?? "Trophée";
  const date = new Date(item.awarded_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "rgba(167,139,250,0.10)",
          border: "1px solid rgba(167,139,250,0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
          fontSize: 14,
        }}
      >
        {item.trophy_icon_url ? (
          <img src={item.trophy_icon_url} alt="" width={14} height={14} style={{ objectFit: "contain" }} />
        ) : (
          "🏆"
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
          <span style={{ color: "#a78bfa", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
            Trophée
          </span>
        </div>
        {item.comment && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.comment}
          </p>
        )}
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 2, display: "block" }}>
          {date}
        </span>
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

export function HistoryDrawer({
  astronautId,
  onClose,
}: {
  astronautId: number;
  onClose: () => void;
}) {
  const { data: contributions = [] } = useQuery({
    queryKey: ["point-attributions", "astronaut", astronautId],
    queryFn: () => apiClient.get<PointAttribution[]>(`/point-attributions?astronaut_id=${astronautId}`),
    enabled: astronautId > 0,
  });
  const { data: trophies = [] } = useTrophyAttributions(astronautId);

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); };
  }, [onClose]);

  // Fusionner et trier par date desc
  const entries: HistoryEntry[] = [
    ...contributions.map((c): HistoryEntry => ({ kind: "contribution", date: c.awarded_at, data: c })),
    ...trophies.map((t): HistoryEntry => ({ kind: "trophy", date: t.awarded_at, data: t })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          zIndex: 50,
          background: "rgba(4, 8, 20, 0.97)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Mon Historique
            </h2>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 3 }}>
              {contributions.length} contribution{contributions.length > 1 ? "s" : ""} · {trophies.length} trophée{trophies.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {entries.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", marginTop: 40 }}>
              Aucun historique pour le moment.
            </p>
          ) : (
            entries.map((entry) =>
              entry.kind === "contribution" ? (
                <ContribRow key={`c-${entry.data.id}`} item={entry.data} />
              ) : (
                <TrophyRow key={`t-${entry.data.id}`} item={entry.data} />
              )
            )
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
