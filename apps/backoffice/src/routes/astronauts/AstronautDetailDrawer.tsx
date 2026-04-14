import { useEffect } from "react";
import { X, Star, Trophy, Calendar, Briefcase, Mail, Globe, Award, Zap } from "lucide-react";
import {
  useAstronautAttributions,
  type AstronautOut,
  type PlanetOut,
  type PointAttributionOut,
} from "@/api/astronauts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function initials(a: AstronautOut) {
  return `${a.first_name.charAt(0)}${a.last_name.charAt(0)}`.toUpperCase();
}

// ── Attribution row ───────────────────────────────────────────────────────────

function AttributionRow({ attr }: { attr: PointAttributionOut }) {
  return (
    <div className="flex items-start gap-3 border-b border-space-600 px-5 py-3 last:border-0 hover:bg-space-700 transition-colors">
      {/* Date */}
      <span className="w-16 shrink-0 text-xs text-space-300 pt-0.5">{fmtShort(attr.awarded_at)}</span>

      {/* Activity + comment */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">
          {attr.activity_name ?? `Activité #${attr.activity_id}`}
        </p>
        {attr.comment && (
          <p className="mt-0.5 truncate text-xs italic text-space-300">"{attr.comment}"</p>
        )}
        {/* Bonus badges */}
        {(attr.first_ever_multiplier_applied || attr.first_season_bonus_applied) && (
          <div className="mt-1 flex gap-1">
            {attr.first_ever_multiplier_applied && (
              <span className="rounded-sm border border-neon-gold/30 bg-neon-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-neon-gold">
                ×2 1ÈRE EVER
              </span>
            )}
            {attr.first_season_bonus_applied && (
              <span className="rounded-sm border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold text-neon-cyan">
                +25 1ÈRE SAISON
              </span>
            )}
          </div>
        )}
      </div>

      {/* Points */}
      <span className="font-orbitron text-sm font-bold text-neon-gold shrink-0">
        +{attr.points}
      </span>
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  label,
  value,
  accent = "cyan",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: "cyan" | "gold" | "green";
}) {
  const colors = { cyan: "text-neon-cyan", gold: "text-neon-gold", green: "text-neon-green" };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={13} className={colors[accent]} />
      <span className={`font-orbitron text-base font-bold ${colors[accent]}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-space-300">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  astronaut: AstronautOut | null;
  planets: PlanetOut[];
  onClose: () => void;
}

export function AstronautDetailDrawer({ astronaut, planets, onClose }: Props) {
  const { data: attributions = [], isLoading } = useAstronautAttributions(
    astronaut?.id ?? null,
  );

  // Close on Escape
  useEffect(() => {
    if (!astronaut) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [astronaut, onClose]);

  const visible = astronaut !== null;
  const planet = planets.find((p) => p.id === astronaut?.planet_id);
  const color = planet?.color_hex ?? "#64748b";

  // Group attributions by season
  const totalContribs = attributions.length;
  const bonusEver = attributions.filter((a) => a.first_ever_multiplier_applied).length;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={astronaut ? `Fiche de ${astronaut.first_name} ${astronaut.last_name}` : "Fiche astronaute"}
        className={`fixed right-0 top-0 z-40 flex h-full w-[480px] max-w-full flex-col bg-space-900 border-l border-space-500 shadow-2xl transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {astronaut && (
          <>
            {/* Header */}
            <div
              className="relative flex items-start gap-4 p-6 pb-5"
              style={{
                background: `linear-gradient(135deg, ${color}18 0%, transparent 60%)`,
                borderBottom: `1px solid ${color}30`,
              }}
            >
              {/* Avatar */}
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-black"
                style={{
                  background: `linear-gradient(135deg, ${color}40, ${color}18)`,
                  border: `2px solid ${color}60`,
                  color,
                }}
              >
                {initials(astronaut)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h2 className="font-orbitron text-sm font-bold tracking-wide text-slate-100">
                  {astronaut.first_name} {astronaut.last_name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {planet && (
                    <span
                      className="rounded-sm px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: `${color}20`,
                        border: `1px solid ${color}40`,
                        color,
                      }}
                    >
                      {planet.name}
                    </span>
                  )}
                  {astronaut.grade_name && (
                    <span className="flex items-center gap-1 text-xs text-space-300">
                      <Award size={10} />
                      {astronaut.grade_name}
                    </span>
                  )}
                  {astronaut.roles.includes("admin") && (
                    <span className="rounded-sm border border-neon-gold/30 bg-neon-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-neon-gold">
                      ADMIN
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-space-300">
                    <Mail size={10} />
                    {astronaut.email}
                  </div>
                  {astronaut.hire_date && (
                    <div className="flex items-center gap-1.5 text-xs text-space-300">
                      <Calendar size={10} />
                      Depuis le {fmt(astronaut.hire_date)}
                    </div>
                  )}
                  {astronaut.client && (
                    <div className="flex items-center gap-1.5 text-xs text-space-300">
                      <Briefcase size={10} />
                      {astronaut.client}
                    </div>
                  )}
                </div>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="shrink-0 text-space-300 hover:text-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-space-600 border-b border-space-600 bg-space-800">
              <div className="flex justify-center py-4">
                <StatPill icon={Star} label="Points" value={astronaut.total_points.toLocaleString()} accent="gold" />
              </div>
              <div className="flex justify-center py-4">
                <StatPill icon={Zap} label="Contribs" value={totalContribs} accent="cyan" />
              </div>
              <div className="flex justify-center py-4">
                <StatPill icon={Globe} label="Planète" value={planet?.name ?? "—"} accent="green" />
              </div>
            </div>

            {/* Hobbies */}
            {astronaut.hobbies && (
              <div className="border-b border-space-600 bg-space-800/50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-space-300 mb-1">Hobbies</p>
                <p className="text-xs text-slate-300 leading-relaxed">{astronaut.hobbies}</p>
              </div>
            )}

            {/* History header */}
            <div className="flex items-center justify-between border-b border-space-600 bg-space-800 px-5 py-3">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-neon-cyan" />
                <span className="font-orbitron text-xs font-semibold uppercase tracking-widest text-slate-200">
                  Historique des points
                </span>
                {!isLoading && (
                  <span className="rounded-sm bg-neon-cyan/10 px-1.5 py-0.5 font-orbitron text-[10px] font-bold text-neon-cyan">
                    {totalContribs}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={11} className="text-space-400" />
                <span className="text-xs text-space-400">Trophées — bientôt</span>
              </div>
            </div>

            {/* Attribution list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-xs text-space-300">
                  Chargement…
                </div>
              ) : attributions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Zap size={24} className="text-space-500" />
                  <p className="text-sm text-space-300">Aucune contribution pour l'instant</p>
                </div>
              ) : (
                <>
                  {[...attributions]
                    .sort((a, b) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime())
                    .map((attr) => (
                      <AttributionRow key={attr.id} attr={attr} />
                    ))}
                  {bonusEver > 0 && (
                    <div className="px-5 py-3 text-center text-xs text-space-400">
                      {bonusEver} attribution{bonusEver > 1 ? "s" : ""} avec multiplicateur ×2 (1ère ever)
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
