import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAstronauts, useActivities, useCreateAttribution, type ActivityOut } from "@/api/astronauts";

function pointsPreview(activity: ActivityOut, customPoints: number | null, isFirstEver: boolean, isFirstSeason: boolean): {
  base: number; multiplier: number; bonus: number; total: number;
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
      const result = await createAttribution.mutateAsync({
        astronaut_ids: selectedAstronautIds,
        activity_id: activityId,
        ...(parsed ? { points: parsed } : {}),
        ...(comment ? { comment } : {}),
      });
      const totalPoints = result.reduce((s, a) => s + a.points, 0);
      setSuccess({ count: result.length, points: totalPoints });
      setSelectedAstronautIds([]);
      setActivityId(null);
      setCustomPoints("");
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Attribuer des points</h1>

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✓ {success.count} attribution{success.count > 1 ? "s" : ""} créée{success.count > 1 ? "s" : ""} — {success.points} points attribués.
          <button onClick={() => setSuccess(null)} className="ml-3 underline">Nouvelle attribution</button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-6">

        {/* Sélection activité */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Activité *</label>
          <select
            value={activityId ?? ""}
            onChange={(e) => {
              setActivityId(e.target.value ? parseInt(e.target.value, 10) : null);
              setSelectedAstronautIds([]);
              setCustomPoints("");
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Choisir une activité…</option>
            {activities.filter((a) => a.is_active).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.base_points} pts){a.is_collaborative ? " — collaborative" : ""}
              </option>
            ))}
          </select>
          {activity && (
            <p className="mt-1 text-xs text-gray-500">
              Catégorie : {activity.category} · {activity.allow_multiple_assignees ? "Multi-assignees autorisé" : "Un seul astronaute"}
            </p>
          )}
        </div>

        {/* Sélection astronaute(s) */}
        {activity && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Astronaute{isCollaborative ? "s" : ""} *
              {selectedAstronautIds.length > 0 && (
                <span className="ml-2 text-xs font-normal text-blue-600">
                  {selectedAstronautIds.length} sélectionné{selectedAstronautIds.length > 1 ? "s" : ""}
                </span>
              )}
            </label>
            <input
              type="search"
              placeholder="Rechercher…"
              value={astronautSearch}
              onChange={(e) => setAstronautSearch(e.target.value)}
              className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200">
              {filteredAstronauts.map((a) => {
                const selected = selectedAstronautIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAstronaut(a.id)}
                    className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-gray-50 ${selected ? "bg-blue-50" : ""}`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs ${selected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"}`}>
                      {selected ? "✓" : ""}
                    </span>
                    <span className="font-medium text-gray-900">{a.first_name} {a.last_name}</span>
                    <span className="ml-auto text-xs text-gray-400">{a.total_points} pts</span>
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Points personnalisés
                  <span className="ml-1 text-xs font-normal text-gray-400">(laisser vide = {activity.base_points} pts)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  placeholder={activity.base_points.toString()}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  <span className="text-xs text-blue-500">Points estimés par astronaute</span>
                  <div className="mt-0.5 font-bold">
                    {(() => {
                      const p = pointsPreview(activity, customPoints ? parseInt(customPoints, 10) : null, false, false);
                      return `${p.base} pts`;
                    })()}
                  </div>
                  <div className="text-xs text-blue-400">×2 si 1ère contribution ever · +25 si 1ère de saison</div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Commentaire</label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Contexte, lien, détails…"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void navigate("/")}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createAttribution.isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
