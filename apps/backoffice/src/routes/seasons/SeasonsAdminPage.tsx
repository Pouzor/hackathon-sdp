import { useState } from "react";
import { Calendar, Plus, Play, Square } from "lucide-react";
import {
  useSeasons,
  useCreateSeason,
  useActivateSeason,
  useCloseSeason,
  type SeasonOut,
} from "@/api/astronauts";

function SeasonRow({
  season,
  onActivate,
  onClose,
}: {
  season: SeasonOut;
  onActivate: (id: number) => void;
  onClose: (id: number) => void;
}) {
  const [confirmClose, setConfirmClose] = useState(false);

  return (
    <tr className="border-b border-space-600 hover:bg-space-700/40 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              season.is_active ? "bg-neon-green" : "bg-space-400"
            }`}
            style={season.is_active ? { boxShadow: "0 0 6px #00e87a80" } : {}}
          />
          <span className="text-sm font-semibold text-white">{season.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-space-300">{season.start_date}</td>
      <td className="px-4 py-3 font-mono text-xs text-space-300">{season.end_date ?? "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold border ${
            season.is_active
              ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
              : "bg-space-600 border-space-500 text-space-300"
          }`}
        >
          {season.is_active ? "Active" : "Terminée"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {season.is_active ? (
          confirmClose ? (
            <div className="flex justify-end items-center gap-2">
              <span className="text-xs text-neon-red">Confirmer la clôture ?</span>
              <button
                onClick={() => { onClose(season.id); setConfirmClose(false); }}
                className="px-2.5 py-1 rounded text-xs font-semibold bg-neon-red/10 border border-neon-red/40 text-neon-red hover:bg-neon-red/20 transition-colors"
              >
                Clôturer
              </button>
              <button
                onClick={() => { setConfirmClose(false); }}
                className="px-2 py-1 rounded text-xs text-space-300 hover:text-white border border-space-500 transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setConfirmClose(true); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-neon-red border border-neon-red/30 hover:bg-neon-red/10 transition-colors ml-auto"
            >
              <Square size={10} /> Clôturer
            </button>
          )
        ) : (
          <button
            onClick={() => { onActivate(season.id); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-neon-green border border-neon-green/30 hover:bg-neon-green/10 transition-colors ml-auto"
          >
            <Play size={10} /> Activer
          </button>
        )}
      </td>
    </tr>
  );
}

export function SeasonsAdminPage() {
  const { data: seasons = [], isLoading } = useSeasons();
  const createSeason = useCreateSeason();
  const activateSeason = useActivateSeason();
  const closeSeason = useCloseSeason();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");

  const sorted = [...seasons].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate) return;
    createSeason.mutate(
      { name: name.trim(), start_date: startDate },
      {
        onSuccess: () => {
          setName("");
          setStartDate("");
          setShowForm(false);
        },
      },
    );
  }

  const anyError = createSeason.isError || activateSeason.isError || closeSeason.isError;
  const errorMsg = [createSeason.error, activateSeason.error, closeSeason.error]
    .find((e) => e instanceof Error)
    ?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-neon-cyan" />
          <h1 className="font-orbitron text-sm font-semibold tracking-widest text-slate-100 uppercase">
            Saisons
          </h1>
          <span className="ml-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 px-2.5 py-0.5 text-xs font-semibold text-neon-cyan">
            {seasons.length}
          </span>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
        >
          <Plus size={12} /> Nouvelle saison
        </button>
      </div>

      {anyError && (
        <div className="rounded-lg border border-neon-red/30 bg-neon-red/10 px-4 py-2.5 text-sm text-neon-red">
          {errorMsg ?? "Une erreur est survenue"}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-neon-cyan/20 bg-space-800 p-5 flex flex-col gap-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-space-300">
            Nouvelle saison
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Nom</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); }}
                placeholder="Saison 2025-2026"
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white placeholder:text-space-400 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); }}
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); }}
              className="px-4 py-1.5 rounded text-xs text-space-300 border border-space-500 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createSeason.isPending}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 transition-colors"
            >
              {createSeason.isPending ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-space-500 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-space-700 border-b border-space-500">
              {["Saison", "Début", "Fin", "Statut", ""].map((h) => (
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
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-space-300">
                  Chargement…
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-space-300">
                  Aucune saison — créez-en une pour commencer.
                </td>
              </tr>
            ) : (
              sorted.map((s) => (
                <SeasonRow
                  key={s.id}
                  season={s}
                  onActivate={(id) => { activateSeason.mutate(id); }}
                  onClose={(id) => { closeSeason.mutate(id); }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
