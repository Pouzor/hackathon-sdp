import { useState, useMemo } from "react";
import {
  useAstronauts,
  usePlanets,
  useUpdateAstronaut,
  type AstronautOut,
  type PlanetOut,
} from "@/api/astronauts";

function PlanetSelect({
  astronaut,
  planets,
  onSave,
}: {
  astronaut: AstronautOut;
  planets: PlanetOut[];
  onSave: (planetId: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(astronaut.planet_id?.toString() ?? "");

  if (!editing) {
    const planet = planets.find((p) => p.id === astronaut.planet_id);
    return (
      <button
        onClick={() => {
          setEditing(true);
        }}
        className="px-2 py-0.5 text-xs text-space-300 hover:bg-space-500 hover:text-neon-cyan transition-colors"
      >
        {planet?.name ?? "—"}
      </button>
    );
  }

  return (
    <select
      autoFocus
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={() => {
        setEditing(false);
        const parsed = value === "" ? null : parseInt(value, 10);
        if (parsed !== astronaut.planet_id) onSave(parsed);
      }}
      className="border border-neon-cyan/40 bg-space-800 px-2 py-0.5 text-xs text-slate-200 outline-none"
    >
      <option value="">— Aucune —</option>
      {planets.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function AstronautsAdminPage() {
  const { data: astronauts = [], isLoading, isError } = useAstronauts();
  const { data: planets = [] } = usePlanets();
  const updateAstronaut = useUpdateAstronaut();
  const [search, setSearch] = useState("");
  const [filterPlanet, setFilterPlanet] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = astronauts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(q),
      );
    }
    if (filterPlanet !== "all") {
      const pid = parseInt(filterPlanet, 10);
      list = list.filter((a) => a.planet_id === pid);
    }
    return list;
  }, [astronauts, search, filterPlanet]);

  if (isLoading)
    return <div className="p-8 text-sm text-space-300">Chargement…</div>;
  if (isError)
    return <div className="p-8 text-sm text-neon-red">Erreur lors du chargement.</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-orbitron text-base font-semibold tracking-wide text-slate-100">
          ASTRONAUTES{" "}
          <span className="text-neon-cyan">({astronauts.length})</span>
        </h1>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-3">
        <input
          type="search"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="flex-1 border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 placeholder:text-space-300 outline-none focus:border-neon-cyan/50 transition-colors"
        />
        <select
          value={filterPlanet}
          onChange={(e) => {
            setFilterPlanet(e.target.value);
          }}
          className="border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
        >
          <option value="all">Toutes les planètes</option>
          {planets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden border border-space-500 cyber-corner">
        <table className="w-full text-sm">
          <thead className="bg-space-800 text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                Astronaute
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                Planète
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                Grade
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-space-300">
                Points
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                Rôle
              </th>
            </tr>
          </thead>
          <tbody className="bg-space-700">
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-t border-space-600 hover:bg-space-600 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-100">
                  {a.first_name} {a.last_name}
                </td>
                <td className="px-4 py-3 text-space-300">{a.email}</td>
                <td className="px-4 py-3">
                  <PlanetSelect
                    astronaut={a}
                    planets={planets}
                    onSave={(planetId) => {
                      updateAstronaut.mutate({ id: a.id, planet_id: planetId });
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-space-300">{a.grade_name ?? "—"}</td>
                <td className="px-4 py-3 text-right font-mono text-neon-cyan">
                  {a.total_points}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium border ${
                      a.roles.includes("admin")
                        ? "border-neon-gold/30 bg-neon-gold/10 text-neon-gold"
                        : "border-space-400 bg-space-600 text-space-200"
                    }`}
                  >
                    {a.roles.includes("admin") ? "Admin" : "Astronaute"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-space-300">
                  Aucun astronaute trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
