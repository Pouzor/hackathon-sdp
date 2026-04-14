import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAstronauts,
  useActivities,
  useCreateAttribution,
  type ActivityOut,
} from "@/api/astronauts";

function pointsPreview(
  activity: ActivityOut,
  customPoints: number | null,
  isFirstEver: boolean,
  isFirstSeason: boolean,
): {
  base: number;
  multiplier: number;
  bonus: number;
  total: number;
} {
  const base = customPoints ?? activity.base_points;
  const multiplier = isFirstEver ? 2 : 1;
  const bonus = isFirstSeason && !isFirstEver ? 25 : 0;
  return { base, multiplier, bonus, total: base * multiplier + bonus };
}

export function AttributionPage() {
  const navigate = useNavigate();
  const { data: astronauts = [] } = useAstronauts();
  const { data: activities = [] } = useActivities();
  const createAttribution = useCreateAttribution();

  const [selectedAstronautIds, setSelectedAstronautIds] = useState<number[]>([]);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [customPoints, setCustomPoints] = useState<string>("");
  const [comment, setComment] = useState("");
  const [awardedAt, setAwardedAt] = useState<string>(
    new Date().toISOString().slice(0, 10), // YYYY-MM-DD, défaut = aujourd'hui
  );
  const [astronautSearch, setAstronautSearch] = useState("");
  const [success, setSuccess] = useState<{ count: number; points: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activity = activities.find((a) => a.id === activityId) ?? null;
  const isCollaborative = activity?.allow_multiple_assignees ?? false;

  const filteredAstronauts = useMemo(() => {
    if (!astronautSearch) return astronauts;
    const q = astronautSearch.toLowerCase();
    return astronauts.filter((a) => `${a.first_name} ${a.last_name}`.toLowerCase().includes(q));
  }, [astronauts, astronautSearch]);

  function toggleAstronaut(id: number) {
    if (!isCollaborative) {
      setSelectedAstronautIds([id]);
      return;
    }
    setSelectedAstronautIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activityId || selectedAstronautIds.length === 0) return;
    setError(null);
    try {
      const parsed = customPoints ? parseInt(customPoints, 10) : undefined;
      // Construire la date ISO en UTC à minuit du jour sélectionné
      const awardedAtIso = awardedAt ? new Date(awardedAt + "T12:00:00").toISOString() : undefined;
      const result = await createAttribution.mutateAsync({
        astronaut_ids: selectedAstronautIds,
        activity_id: activityId,
        ...(parsed ? { points: parsed } : {}),
        ...(comment ? { comment } : {}),
        ...(awardedAtIso ? { awarded_at: awardedAtIso } : {}),
      });
      const totalPoints = result.reduce((s, a) => s + a.points, 0);
      setSuccess({ count: result.length, points: totalPoints });
      setSelectedAstronautIds([]);
      setActivityId(null);
      setCustomPoints("");
      setComment("");
      setAwardedAt(new Date().toISOString().slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-orbitron text-base font-semibold tracking-wide text-slate-100">
        ATTRIBUTION DE POINTS
      </h1>

      {success && (
        <div className="mb-6 border border-neon-green/30 bg-neon-green/10 px-4 py-3 text-sm text-neon-green">
          ✓ {success.count} attribution{success.count > 1 ? "s" : ""} créée
          {success.count > 1 ? "s" : ""} — {success.points} points attribués.
          <button
            onClick={() => {
              setSuccess(null);
            }}
            className="ml-3 underline hover:no-underline"
          >
            Nouvelle attribution
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 border border-neon-red/30 bg-neon-red/10 px-4 py-3 text-sm text-neon-red">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="flex flex-col gap-6"
      >
        {/* Sélection activité */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
            Activité *
          </label>
          <select
            value={activityId ?? ""}
            onChange={(e) => {
              setActivityId(e.target.value ? parseInt(e.target.value, 10) : null);
              setSelectedAstronautIds([]);
              setCustomPoints("");
            }}
            className="w-full border border-space-500 bg-space-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
          >
            <option value="">Choisir une activité…</option>
            {activities
              .filter((a) => a.is_active)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.base_points} pts){a.is_collaborative ? " — collaborative" : ""}
                </option>
              ))}
          </select>
          {activity && (
            <p className="mt-1 text-xs text-space-300">
              Catégorie : {activity.category} ·{" "}
              {activity.allow_multiple_assignees
                ? "Multi-assignees autorisé"
                : "Un seul astronaute"}
            </p>
          )}
        </div>

        {/* Sélection astronaute(s) */}
        {activity && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
              Astronaute{isCollaborative ? "s" : ""} *
              {selectedAstronautIds.length > 0 && (
                <span className="ml-2 text-xs font-normal normal-case text-neon-cyan">
                  {selectedAstronautIds.length} sélectionné
                  {selectedAstronautIds.length > 1 ? "s" : ""}
                </span>
              )}
            </label>
            <input
              type="search"
              placeholder="Rechercher…"
              value={astronautSearch}
              onChange={(e) => {
                setAstronautSearch(e.target.value);
              }}
              className="mb-2 w-full border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 placeholder:text-space-300 outline-none focus:border-neon-cyan/50 transition-colors"
            />
            <div className="max-h-52 overflow-y-auto border border-space-500">
              {filteredAstronauts.map((a) => {
                const selected = selectedAstronautIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      toggleAstronaut(a.id);
                    }}
                    className={`flex w-full items-center gap-3 border-b border-space-600 px-3 py-2.5 text-left text-sm last:border-0 transition-colors ${
                      selected
                        ? "bg-neon-cyan/10 hover:bg-neon-cyan/15"
                        : "bg-space-800 hover:bg-space-700"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center border text-xs ${
                        selected
                          ? "border-neon-cyan bg-neon-cyan text-space-900"
                          : "border-space-400 bg-transparent"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <span className={`font-medium ${selected ? "text-neon-cyan" : "text-slate-200"}`}>
                      {a.first_name} {a.last_name}
                    </span>
                    <span className="ml-auto font-mono text-xs text-space-300">
                      {a.total_points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Points + commentaire */}
        {activity && selectedAstronautIds.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
                  Points personnalisés
                  <span className="ml-1 text-xs font-normal normal-case text-space-300">
                    (défaut : {activity.base_points} pts)
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={customPoints}
                  onChange={(e) => {
                    setCustomPoints(e.target.value);
                  }}
                  placeholder={activity.base_points.toString()}
                  className="w-full border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-2 text-sm">
                  <span className="text-xs text-space-300">Points estimés / astronaute</span>
                  <div className="mt-0.5 font-orbitron font-bold text-neon-cyan">
                    {(() => {
                      const p = pointsPreview(
                        activity,
                        customPoints ? parseInt(customPoints, 10) : null,
                        false,
                        false,
                      );
                      return `${p.base} pts`;
                    })()}
                  </div>
                  <div className="text-xs text-space-300">
                    ×2 si 1ère ever · +25 si 1ère saison
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="awarded-at"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300"
              >
                Date d'attribution
              </label>
              <input
                id="awarded-at"
                type="date"
                value={awardedAt}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setAwardedAt(e.target.value); }}
                className="w-full border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors [color-scheme:dark]"
              />
              {awardedAt !== new Date().toISOString().slice(0, 10) && (
                <p className="mt-1 text-xs text-neon-gold">
                  Attribution backdatée au {new Date(awardedAt + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
                Commentaire
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
                placeholder="Contexte, lien, détails…"
                className="w-full resize-none border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 placeholder:text-space-300 outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigate("/");
                }}
                className="border border-space-500 px-4 py-2 text-sm text-space-300 hover:border-space-400 hover:text-slate-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createAttribution.isPending}
                className="flex-1 border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 transition-colors"
              >
                {createAttribution.isPending
                  ? "Attribution en cours…"
                  : `Attribuer à ${selectedAstronautIds.length} astronaute${selectedAstronautIds.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
