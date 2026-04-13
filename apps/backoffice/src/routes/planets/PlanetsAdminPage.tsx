import { useState } from "react";
import { Globe, Pencil, Check, X } from "lucide-react";
import { usePlanets, useUpdatePlanet, type PlanetOut } from "@/api/astronauts";

function PlanetRow({
  planet,
  onSave,
}: {
  planet: PlanetOut;
  onSave: (id: number, fields: Partial<PlanetOut>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(planet.name);
  const [mantra, setMantra] = useState(planet.mantra ?? "");
  const [colorHex, setColorHex] = useState(planet.color_hex ?? "#ffffff");
  const [isCompeting, setIsCompeting] = useState(planet.is_competing);

  function handleSave() {
    onSave(planet.id, {
      name: name.trim() || undefined,
      mantra: mantra.trim() || null,
      color_hex: colorHex,
      is_competing: isCompeting,
    });
    setEditing(false);
  }

  function handleCancel() {
    setName(planet.name);
    setMantra(planet.mantra ?? "");
    setColorHex(planet.color_hex ?? "#ffffff");
    setIsCompeting(planet.is_competing);
    setEditing(false);
  }

  const color = planet.color_hex ?? "#7a9ab5";

  return (
    <tr className="border-b border-space-600 hover:bg-space-700/40 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
          />
          {editing ? (
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); }}
              className="bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white w-36 focus:outline-none focus:border-neon-cyan/60"
            />
          ) : (
            <span className="text-sm font-semibold text-white">{planet.name}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            value={mantra}
            onChange={(e) => { setMantra(e.target.value); }}
            placeholder="Mantra…"
            className="bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white w-full focus:outline-none focus:border-neon-cyan/60"
          />
        ) : (
          <span className="text-sm text-space-300 italic">{planet.mantra ?? "—"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="color"
            value={colorHex}
            onChange={(e) => { setColorHex(e.target.value); }}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
        ) : (
          <span className="font-mono text-xs text-space-300">{planet.color_hex ?? "—"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <button
            onClick={() => { setIsCompeting((v) => !v); }}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
              isCompeting
                ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                : "bg-space-600 border-space-400 text-space-300"
            }`}
          >
            {isCompeting ? "En compétition" : "Hors compétition"}
          </button>
        ) : (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold border ${
              planet.is_competing
                ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                : "bg-space-600 border-space-500 text-space-300"
            }`}
          >
            {planet.is_competing ? "Compétition" : "Hors compétition"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right font-mono text-neon-cyan text-sm">
        {planet.season_score.toLocaleString()} pts
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
            >
              <Check size={11} /> Sauver
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-space-300 hover:text-white border border-space-500 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-space-300 hover:text-neon-cyan border border-transparent hover:border-space-500 transition-colors ml-auto"
          >
            <Pencil size={11} /> Éditer
          </button>
        )}
      </td>
    </tr>
  );
}

export function PlanetsAdminPage() {
  const { data: planets = [], isLoading } = usePlanets();
  const updatePlanet = useUpdatePlanet();

  function handleSave(id: number, fields: Partial<PlanetOut>) {
    updatePlanet.mutate({ id, ...fields });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Globe size={16} className="text-neon-cyan" />
        <h1 className="font-orbitron text-sm font-semibold tracking-widest text-slate-100 uppercase">
          Planètes
        </h1>
        <span className="ml-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 px-2.5 py-0.5 text-xs font-semibold text-neon-cyan">
          {planets.length}
        </span>
      </div>

      {updatePlanet.isError && (
        <div className="rounded-lg border border-neon-red/30 bg-neon-red/10 px-4 py-2.5 text-sm text-neon-red">
          {updatePlanet.error instanceof Error ? updatePlanet.error.message : "Erreur lors de la mise à jour"}
        </div>
      )}

      <div className="rounded-lg border border-space-500 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-space-700 border-b border-space-500">
              {["Planète", "Mantra", "Couleur", "Statut", "Score saison", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-space-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-space-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-space-300">
                  Chargement…
                </td>
              </tr>
            ) : (
              planets.map((p) => <PlanetRow key={p.id} planet={p} onSave={handleSave} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
