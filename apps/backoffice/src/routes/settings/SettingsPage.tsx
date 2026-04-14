import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useSeniorityConfig, useUpdateSeniorityConfig } from "@/api/events";

export function SettingsPage() {
  const { data: config, isLoading } = useSeniorityConfig();
  const updateConfig = useUpdateSeniorityConfig();

  const [pointsPerYear, setPointsPerYear] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setPointsPerYear(String(config.points_per_year));
  }, [config]);

  const handleSave = () => {
    const val = parseInt(pointsPerYear, 10);
    if (isNaN(val) || val < 0) return;
    updateConfig.mutate(
      { points_per_year: val },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => { setSaved(false); }, 2500);
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="font-orbitron text-base font-semibold tracking-wide text-slate-100">
          PARAMÈTRES
        </h1>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Ancienneté */}
        <section className="border border-space-500 bg-space-800 p-6 cyber-corner">
          <div className="mb-4 flex items-center gap-2">
            <Settings size={14} className="text-neon-cyan" />
            <h2 className="font-orbitron text-xs font-semibold tracking-widest text-neon-cyan uppercase">
              Points d&apos;ancienneté
            </h2>
          </div>
          <p className="mb-4 text-xs text-space-300 leading-relaxed">
            Nombre de points attribués automatiquement chaque année à la date d&apos;anniversaire
            d&apos;entrée dans la société.
            <br />
            <span className="text-slate-400">
              Formule : <code className="text-neon-cyan">années × points_par_an</code>
            </span>
          </p>

          {isLoading ? (
            <div className="text-sm text-space-300">Chargement…</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={pointsPerYear}
                  onChange={(e) => {
                    setPointsPerYear(e.target.value);
                    setSaved(false);
                  }}
                  className="w-24 border border-space-500 bg-space-700 px-3 py-2 text-sm font-mono text-neon-cyan outline-none focus:border-neon-cyan/50 transition-colors text-center"
                />
                <span className="text-sm text-space-300">pts / an</span>
              </div>
              <button
                onClick={handleSave}
                disabled={updateConfig.isPending}
                className="border border-neon-cyan/40 bg-neon-cyan/5 px-4 py-2 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-50"
              >
                {updateConfig.isPending ? "Sauvegarde…" : "Sauvegarder"}
              </button>
              {saved && (
                <span className="text-xs text-green-400">✓ Sauvegardé</span>
              )}
              {updateConfig.isError && (
                <span className="text-xs text-red-400">Erreur</span>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
