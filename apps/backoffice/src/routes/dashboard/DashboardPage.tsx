import { useNavigate } from "react-router-dom";
import {
  Users,
  Zap,
  Globe,
  Calendar,
  Activity,
  Award,
  AlertTriangle,
  TrendingUp,
  UserX,
  Clock,
  Trophy,
} from "lucide-react";
import {
  useAstronauts,
  usePlanets,
  useSeasons,
  useActivities,
  useRecentAttributions,
} from "@/api/astronauts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysSince(isoDate: string) {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

function daysUntil(isoDate: string | null) {
  if (!isoDate) return null;
  return Math.floor((new Date(isoDate).getTime() - Date.now()) / 86_400_000);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "cyan",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "cyan" | "green" | "gold" | "red";
}) {
  const colors = {
    cyan: "text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5",
    green: "text-neon-green border-neon-green/20 bg-neon-green/5",
    gold: "text-neon-gold border-neon-gold/20 bg-neon-gold/5",
    red: "text-neon-red border-neon-red/20 bg-neon-red/5",
  };
  const iconColors = {
    cyan: "text-neon-cyan",
    green: "text-neon-green",
    gold: "text-neon-gold",
    red: "text-neon-red",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[accent]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-space-300">{label}</p>
          <p className={`mt-1.5 font-orbitron text-2xl font-bold ${iconColors[accent]}`}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-space-300">{sub}</p>}
        </div>
        <Icon size={18} className={`shrink-0 ${iconColors[accent]}`} />
      </div>
    </div>
  );
}

function ShortcutButton({
  icon: Icon,
  label,
  to,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  to?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg border border-space-500 bg-space-800 px-4 py-3 text-sm font-medium text-space-200 transition-all hover:border-neon-cyan/40 hover:bg-neon-cyan/5 hover:text-neon-cyan"
    >
      <Icon size={14} className="text-neon-cyan" />
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: astronauts = [] } = useAstronauts();
  const { data: planets = [] } = usePlanets();
  const { data: seasons = [] } = useSeasons();
  const { data: activities = [] } = useActivities();
  const { data: recentAttributions = [] } = useRecentAttributions(10);

  // Derived data
  const activeSeason = seasons.find((s) => s.is_active) ?? null;
  const competingPlanets = [...planets]
    .filter((p) => p.is_competing)
    .sort((a, b) => b.season_score - a.season_score);
  const maxScore = competingPlanets[0]?.season_score ?? 1;

  const totalAstronauts = astronauts.length;
  const unassigned = astronauts.filter((a) => a.planet_id === null).length;
  const withPoints = new Set(recentAttributions.map((a) => a.astronaut_id)).size;

  // Lookup maps for attributions table
  const astronautMap = new Map(astronauts.map((a) => [a.id, `${a.first_name} ${a.last_name}`]));
  const activityMap = new Map(activities.map((a) => [a.id, a.name]));
  const planetMap = new Map(planets.map((p) => [p.id, p]));

  // Total season points
  const totalSeasonPoints = competingPlanets.reduce((s, p) => s + p.season_score, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-base font-semibold tracking-widest text-slate-100 uppercase">
          Tableau de bord
        </h1>
        <p className="mt-1 text-xs text-space-300">Vue d'ensemble · Mission Control</p>
      </div>

      {/* Season banner */}
      {!activeSeason ? (
        <div className="flex items-center gap-3 rounded-lg border border-neon-red/40 bg-neon-red/10 px-4 py-3">
          <AlertTriangle size={16} className="shrink-0 text-neon-red" />
          <div>
            <p className="text-sm font-semibold text-neon-red">Aucune saison active</p>
            <p className="text-xs text-space-300">
              Les attributions de points sont désactivées.{" "}
              <button
                type="button"
                onClick={() => { navigate("/seasons"); }}
                className="underline hover:text-slate-200"
              >
                Gérer les saisons →
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-neon-green/30 bg-neon-green/5 px-4 py-3">
          <div className="h-2 w-2 shrink-0 rounded-full bg-neon-green shadow-[0_0_6px_theme(colors.neon-green)]" />
          <div className="flex flex-1 flex-wrap items-baseline gap-x-4 gap-y-0.5">
            <p className="text-sm font-semibold text-neon-green">{activeSeason.name}</p>
            <span className="text-xs text-space-300">
              Démarrée il y a {daysSince(activeSeason.start_date)} j · depuis le{" "}
              {formatDate(activeSeason.start_date)}
            </span>
            {activeSeason.end_date && (
              <span className="text-xs text-space-300">
                {daysUntil(activeSeason.end_date) !== null && daysUntil(activeSeason.end_date)! >= 0
                  ? `Se termine dans ${daysUntil(activeSeason.end_date)!} j`
                  : "Terminée"}
              </span>
            )}
            <span className="ml-auto font-orbitron text-sm font-bold text-neon-gold">
              {totalSeasonPoints.toLocaleString()} pts
            </span>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Astronautes"
          value={totalAstronauts}
          sub={unassigned > 0 ? `${unassigned} sans planète` : "Tous assignés"}
          accent={unassigned > 0 ? "gold" : "cyan"}
        />
        <StatCard
          icon={Globe}
          label="Planètes en compétition"
          value={competingPlanets.length}
          sub={`${planets.length} planètes au total`}
          accent="cyan"
        />
        <StatCard
          icon={Activity}
          label="Activités"
          value={activities.filter((a) => a.is_active).length}
          sub={`${activities.length} au total`}
          accent="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total saison"
          value={`${totalSeasonPoints.toLocaleString()} pts`}
          sub={activeSeason?.name ?? "Aucune saison"}
          accent="gold"
        />
      </div>

      {/* Leaderboard + Recent attributions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leaderboard */}
        <div className="rounded-lg border border-space-500 bg-space-800">
          <div className="flex items-center gap-2 border-b border-space-500 px-4 py-3">
            <Trophy size={13} className="text-neon-gold" />
            <h2 className="font-orbitron text-xs font-semibold uppercase tracking-widest text-slate-200">
              Classement Saison
            </h2>
          </div>
          <div className="divide-y divide-space-500">
            {competingPlanets.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-space-300">
                Aucune planète en compétition
              </p>
            ) : (
              competingPlanets.map((planet, i) => {
                const pct = maxScore > 0 ? (planet.season_score / maxScore) * 100 : 0;
                const color = planet.color_hex ?? "#64748b";
                const rankEmoji = ["👑", "🥈", "🥉"][i] ?? `${i + 1}.`;
                return (
                  <div key={planet.id} className="px-4 py-3">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="w-5 text-center text-sm leading-none">{rankEmoji}</span>
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="flex-1 text-sm font-medium text-slate-200">
                        {planet.name}
                      </span>
                      <span
                        className="font-orbitron text-sm font-bold"
                        style={{ color }}
                      >
                        {planet.season_score.toLocaleString()}
                      </span>
                    </div>
                    <div className="ml-8 h-1 overflow-hidden rounded-full bg-space-600">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {competingPlanets.length > 0 && (
            <div className="flex items-center justify-between border-t border-space-500 px-4 py-2.5">
              <span className="text-xs text-space-300">Total saison</span>
              <span className="font-orbitron text-xs font-semibold text-neon-gold">
                {totalSeasonPoints.toLocaleString()} pts
              </span>
            </div>
          )}
        </div>

        {/* Recent attributions */}
        <div className="rounded-lg border border-space-500 bg-space-800">
          <div className="flex items-center gap-2 border-b border-space-500 px-4 py-3">
            <Clock size={13} className="text-neon-cyan" />
            <h2 className="font-orbitron text-xs font-semibold uppercase tracking-widest text-slate-200">
              Dernières attributions
            </h2>
          </div>
          <div className="divide-y divide-space-500">
            {recentAttributions.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-space-300">
                Aucune attribution pour l'instant
              </p>
            ) : (
              recentAttributions.slice(0, 10).map((attr) => {
                const planet = planetMap.get(attr.planet_id);
                const color = planet?.color_hex ?? "#64748b";
                return (
                  <div key={attr.id} className="flex items-start gap-3 px-4 py-2.5">
                    {/* Planet color dot */}
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-200">
                        {astronautMap.get(attr.astronaut_id) ?? `#${attr.astronaut_id}`}
                        <span className="ml-1.5 text-space-300">·</span>
                        <span className="ml-1.5 text-space-300">
                          {activityMap.get(attr.activity_id) ?? `activité #${attr.activity_id}`}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-space-400">
                        {formatDateTime(attr.awarded_at)}
                        {attr.comment && (
                          <span className="ml-2 italic text-space-300">"{attr.comment}"</span>
                        )}
                      </p>
                    </div>
                    <span className="font-orbitron text-xs font-bold text-neon-gold shrink-0">
                      +{attr.points}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {recentAttributions.length > 0 && (
            <div className="border-t border-space-500 px-4 py-2.5">
              <button
                type="button"
                onClick={() => { navigate("/attributions/new"); }}
                className="text-xs text-neon-cyan hover:underline"
              >
                Nouvelle attribution →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fleet status */}
      <div className="rounded-lg border border-space-500 bg-space-800">
        <div className="flex items-center gap-2 border-b border-space-500 px-4 py-3">
          <Users size={13} className="text-neon-cyan" />
          <h2 className="font-orbitron text-xs font-semibold uppercase tracking-widest text-slate-200">
            État de la flotte
          </h2>
        </div>
        <div className="grid grid-cols-2 divide-x divide-space-500 sm:grid-cols-4">
          {[
            {
              label: "Total",
              value: totalAstronauts,
              icon: Users,
              accent: "text-slate-200",
            },
            {
              label: "Sans planète",
              value: unassigned,
              icon: UserX,
              accent: unassigned > 0 ? "text-neon-gold" : "text-space-300",
            },
            {
              label: "Actifs (30j)",
              value: withPoints,
              icon: Zap,
              accent: "text-neon-green",
            },
            {
              label: "Dormants",
              value: totalAstronauts - withPoints,
              icon: Activity,
              accent: totalAstronauts - withPoints > 0 ? "text-neon-red" : "text-space-300",
            },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4 py-4">
              <Icon size={14} className={accent} />
              <span className={`font-orbitron text-xl font-bold ${accent}`}>{value}</span>
              <span className="text-xs text-space-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 font-orbitron text-xs font-semibold uppercase tracking-widest text-space-300">
          Accès rapides
        </h2>
        <div className="flex flex-wrap gap-2">
          <ShortcutButton icon={Zap} label="Attribuer des points" onClick={() => { navigate("/attributions/new"); }} />
          <ShortcutButton icon={Users} label="Astronautes" onClick={() => { navigate("/astronauts"); }} />
          <ShortcutButton icon={Globe} label="Planètes" onClick={() => { navigate("/planets"); }} />
          <ShortcutButton icon={Activity} label="Activités" onClick={() => { navigate("/activities"); }} />
          <ShortcutButton icon={Award} label="Grades" onClick={() => { navigate("/grades"); }} />
          <ShortcutButton icon={Calendar} label="Saisons" onClick={() => { navigate("/seasons"); }} />
          <ShortcutButton icon={Trophy} label="Trophées" onClick={() => { navigate("/trophies"); }} />
        </div>
      </div>
    </div>
  );
}
