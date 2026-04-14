import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Users } from "lucide-react";
import { useAstronauts, usePlanets, type AstronautOut, type PlanetOut } from "@/api/astronauts";
import { useEvents, useRecordAttendance, useEventAttendances, type AttendanceResult } from "@/api/events";
import { getAvatarUrl } from "@/lib/apiClient";

// ── Tuile astronaute ──────────────────────────────────────────────────────────

function AstronautTile({
  astronaut,
  planet,
  selected,
  onToggle,
}: {
  astronaut: AstronautOut;
  planet?: PlanetOut;
  selected: boolean;
  onToggle: () => void;
}) {
  const initials =
    `${astronaut.first_name[0] ?? ""}${astronaut.last_name[0] ?? ""}`.toUpperCase();
  const color = planet?.color_hex ?? "#64748b";

  return (
    <button
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-2 rounded p-3 text-center transition-all border-2 ${
        selected
          ? "border-neon-cyan bg-neon-cyan/10 shadow-[0_0_12px_rgba(0,200,255,0.2)]"
          : "border-space-500 bg-space-800 hover:border-space-400 hover:bg-space-700"
      }`}
    >
      {/* Checkmark */}
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neon-cyan">
          <Check size={10} className="text-space-900" />
        </span>
      )}

      {/* Avatar */}
      {getAvatarUrl(astronaut.photo_url) ? (
        <img
          src={getAvatarUrl(astronaut.photo_url)!}
          alt={`${astronaut.first_name} ${astronaut.last_name}`}
          draggable={false}
          className="h-12 w-12 rounded-full object-cover"
          style={{ border: `2px solid ${color}` }}
        />
      ) : (
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-space-900"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      )}

      {/* Nom */}
      <div className="w-full">
        <p className={`text-xs font-medium leading-tight ${selected ? "text-neon-cyan" : "text-slate-200"}`}>
          {astronaut.first_name}
        </p>
        <p className={`text-xs leading-tight ${selected ? "text-neon-cyan/70" : "text-space-300"}`}>
          {astronaut.last_name}
        </p>
      </div>

      {/* Planète */}
      {planet && (
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-space-900"
          style={{ backgroundColor: color }}
        >
          {planet.name}
        </span>
      )}
    </button>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export function EventAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id ?? "0", 10);
  const navigate = useNavigate();

  const { data: events = [] } = useEvents();
  const { data: astronauts = [], isLoading } = useAstronauts();
  const { data: planets = [] } = usePlanets();
  const { data: existingAttendances = [] } = useEventAttendances(eventId);
  const recordAttendance = useRecordAttendance(eventId);

  const event = events.find((e) => e.id === eventId);

  // ── Filtres ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterPlanet, setFilterPlanet] = useState<string>("all");

  // ── Sélection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Pré-sélectionner les astronautes déjà présents au chargement
  useEffect(() => {
    if (existingAttendances.length > 0) {
      setSelected(new Set(existingAttendances));
    }
  }, [existingAttendances]);
  const [points, setPoints] = useState<string>("0");
  const [comment, setComment] = useState("");
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const planetMap = useMemo(
    () => new Map(planets.map((p) => [p.id, p])),
    [planets],
  );

  const filtered = useMemo(() => {
    let list = astronauts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q),
      );
    }
    if (filterPlanet === "none") {
      list = list.filter((a) => a.planet_id === null);
    } else if (filterPlanet !== "all") {
      const pid = parseInt(filterPlanet, 10);
      list = list.filter((a) => a.planet_id === pid);
    }
    return list;
  }, [astronauts, search, filterPlanet]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(filtered.map((a) => a.id)));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const handleSubmit = () => {
    setSubmitError(null);
    if (selected.size === 0) {
      setSubmitError("Sélectionnez au moins un astronaute.");
      return;
    }
    const pts = parseInt(points, 10);
    recordAttendance.mutate(
      {
        astronaut_ids: [...selected],
        points: isNaN(pts) ? 0 : pts,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setSelected(new Set());
          setPoints("0");
          setComment("");
        },
        onError: (err) => {
          setSubmitError(err instanceof Error ? err.message : "Erreur");
        },
      },
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => { navigate("/events"); }}
          className="mb-3 flex items-center gap-1.5 text-xs text-space-300 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={12} />
          Retour aux événements
        </button>
        <h1 className="font-orbitron text-base font-semibold tracking-wide text-slate-100">
          {event ? event.name.toUpperCase() : "ÉVÉNEMENT"}
          {event && (
            <span className="ml-3 font-sans text-xs font-normal text-space-300">
              {new Date(event.event_date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </h1>
      </div>

      {/* Bannière résultat */}
      {result && (
        <div className="mb-5 flex items-start justify-between gap-4 border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-3 text-sm">
          <span className="text-slate-200">
            ✓ Présence enregistrée —{" "}
            <span className="font-mono text-neon-cyan">{result.recorded}</span> nouvel(le)(s),{" "}
            <span className="font-mono text-neon-cyan">{result.already_present}</span> déjà présent(s)
            {result.attributions_created > 0 && (
              <>
                ,{" "}
                <span className="font-mono text-neon-gold">{result.attributions_created}</span>{" "}
                attribution(s) créée(s)
              </>
            )}
          </span>
          <button
            onClick={() => { setResult(null); }}
            className="shrink-0 text-space-300 hover:text-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Colonne principale — sélection astronautes */}
        <div className="flex-1 min-w-0">
          {/* Filtres */}
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Rechercher par nom, prénom…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              className="flex-1 min-w-48 border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
            />
            <select
              value={filterPlanet}
              onChange={(e) => { setFilterPlanet(e.target.value); }}
              className="border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
            >
              <option value="all">Toutes les planètes</option>
              <option value="none">— Sans planète</option>
              {planets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="flex gap-1.5">
              <button
                onClick={selectAll}
                className="border border-space-500 bg-space-800 px-3 py-2 text-xs text-space-300 hover:text-slate-200 hover:bg-space-700 transition-colors"
              >
                Tout sélectionner
              </button>
              {selected.size > 0 && (
                <button
                  onClick={clearAll}
                  className="border border-space-500 bg-space-800 px-3 py-2 text-xs text-space-300 hover:text-slate-200 hover:bg-space-700 transition-colors"
                >
                  Tout désélectionner
                </button>
              )}
            </div>
          </div>

          {/* Compteur sélection */}
          <p className="mb-3 text-xs text-space-300">
            {filtered.length} astronaute{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
            {selected.size > 0 && (
              <span className="ml-2 font-medium text-neon-cyan">
                · {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
              </span>
            )}
          </p>

          {/* Grille de tuiles */}
          {isLoading ? (
            <div className="text-sm text-space-300">Chargement…</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {filtered.map((a) => (
                <AstronautTile
                  key={a.id}
                  astronaut={a}
                  planet={a.planet_id ? planetMap.get(a.planet_id) : undefined}
                  selected={selected.has(a.id)}
                  onToggle={() => { toggleSelect(a.id); }}
                />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-sm text-space-300">Aucun astronaute trouvé.</p>
              )}
            </div>
          )}
        </div>

        {/* Panneau latéral — paramètres & submit */}
        <div className="w-64 shrink-0">
          <div className="sticky top-6 border border-space-500 bg-space-800 p-4 cyber-corner">
            <div className="mb-4 flex items-center gap-2">
              <Users size={13} className="text-neon-cyan" />
              <span className="font-orbitron text-[10px] font-semibold tracking-widest text-neon-cyan uppercase">
                Enregistrement
              </span>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-space-300">
                Points par astronaute{" "}
                <span className="text-space-400">(0 = présence sans points)</span>
              </label>
              <input
                type="number"
                min={0}
                value={points}
                onChange={(e) => { setPoints(e.target.value); }}
                className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm font-mono text-neon-cyan outline-none focus:border-neon-cyan/50 transition-colors text-center"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs text-space-300">
                Commentaire <span className="text-space-400">(optionnel)</span>
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => { setComment(e.target.value); }}
                placeholder={`Présence : ${event?.name ?? "événement"}`}
                className="w-full resize-none border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>

            {submitError && (
              <p className="mb-3 text-xs text-red-400">{submitError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={recordAttendance.isPending || selected.size === 0}
              className="w-full border border-neon-cyan/40 bg-neon-cyan/5 py-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-40"
            >
              {recordAttendance.isPending
                ? "Enregistrement…"
                : `Enregistrer (${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
