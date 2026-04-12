import { useState, useMemo } from "react";
import { useAstronauts, usePlanets, useUpdateAstronaut, type AstronautOut, type PlanetOut } from "@/api/astronauts";

function PlanetSelect({ astronaut, planets, onSave }: {
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
        onClick={() => setEditing(true)}
        className="rounded px-2 py-0.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
      >
        {planet?.name ?? "—"}
      </button>
    );
  }

  return (
    <select
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const parsed = value === "" ? null : parseInt(value, 10);
        if (parsed !== astronaut.planet_id) onSave(parsed);
      }}
      className="rounded border border-white/20 bg-gray-800 px-2 py-0.5 text-xs text-white outline-none"
    >
      <option value="">— Aucune —</option>
      {planets.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
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

  if (isLoading) return <div className="p-8 text-sm text-gray-400">Chargement…</div>;
  if (isError) return <div className="p-8 text-sm text-red-400">Erreur lors du chargement.</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Astronautes ({astronauts.length})</h1>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-3">
        <input
          type="search"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <select
          value={filterPlanet}
          onChange={(e) => setFilterPlanet(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">Toutes les planètes</option>
          {planets.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Astronaute</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Planète</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3 text-right">Points</th>
              <th className="px-4 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {a.first_name} {a.last_name}
                </td>
                <td className="px-4 py-3 text-gray-500">{a.email}</td>
                <td className="px-4 py-3">
                  <PlanetSelect
                    astronaut={a}
                    planets={planets}
                    onSave={(planetId) => {
                      void updateAstronaut.mutate({ id: a.id, planet_id: planetId });
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{a.grade_name ?? "—"}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">{a.total_points}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    a.roles.includes("admin")
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {a.roles.includes("admin") ? "Admin" : "Astronaute"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
