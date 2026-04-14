import { useState, useMemo } from "react";
import { UserX, RefreshCw, UserPlus } from "lucide-react";
import {
  useAstronauts,
  usePlanets,
  useCreateAstronaut,
  useUpdateAstronaut,
  useSyncGoogleUsers,
  type AstronautOut,
  type PlanetOut,
  type SyncResult,
} from "@/api/astronauts";
import { AstronautDetailDrawer } from "./AstronautDetailDrawer";

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
        onClick={() => { setEditing(true); }}
        title="Cliquer pour modifier la planète"
        className={`flex items-center gap-1.5 px-2 py-0.5 text-xs rounded border transition-colors ${
          planet
            ? "border-transparent text-space-300 hover:bg-space-500 hover:text-neon-cyan"
            : "border-neon-gold/30 bg-neon-gold/10 text-neon-gold hover:bg-neon-gold/20"
        }`}
      >
        {planet ? (
          planet.name
        ) : (
          <>
            <UserX size={11} />
            Non assigné
          </>
        )}
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

function AddAstronautForm({
  planets,
  onClose,
}: {
  planets: PlanetOut[];
  onClose: () => void;
}) {
  const createAstronaut = useCreateAstronaut();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [planetId, setPlanetId] = useState<string>("");
  const [hireDate, setHireDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!email.trim()) { setError("L'email est obligatoire."); return; }
    if (!firstName.trim()) { setError("Le prénom est obligatoire."); return; }
    if (!lastName.trim()) { setError("Le nom est obligatoire."); return; }

    createAstronaut.mutate(
      {
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        planet_id: planetId ? parseInt(planetId, 10) : null,
        hire_date: hireDate || null,
      },
      {
        onSuccess: () => { onClose(); },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Erreur lors de la création.");
        },
      },
    );
  };

  return (
    <div className="mb-5 border border-neon-cyan/20 bg-space-800 p-5 cyber-corner">
      <h2 className="mb-4 font-orbitron text-xs font-semibold tracking-widest text-neon-cyan uppercase">
        Nouvel astronaute
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Prénom */}
        <div>
          <label className="mb-1 block text-xs text-space-300">Prénom <span className="text-neon-red">*</span></label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); }}
            placeholder="Jean"
            className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="mb-1 block text-xs text-space-300">Nom <span className="text-neon-red">*</span></label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); }}
            placeholder="Dupont"
            className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs text-space-300">Email <span className="text-neon-red">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            placeholder="jean.dupont@eleven-labs.com"
            className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>

        {/* Planète (optionnel) */}
        <div>
          <label className="mb-1 block text-xs text-space-300">
            Planète <span className="text-space-400">(optionnel)</span>
          </label>
          <select
            value={planetId}
            onChange={(e) => { setPlanetId(e.target.value); }}
            className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
          >
            <option value="">— Aucune —</option>
            {planets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Date d'entrée (optionnel) */}
        <div>
          <label className="mb-1 block text-xs text-space-300">
            Date d&apos;entrée <span className="text-space-400">(optionnel)</span>
          </label>
          <input
            type="date"
            value={hireDate}
            onChange={(e) => { setHireDate(e.target.value); }}
            className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-neon-red">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={createAstronaut.isPending}
          className="flex items-center gap-2 border border-neon-cyan/40 bg-neon-cyan/5 px-4 py-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-40"
        >
          <UserPlus size={13} />
          {createAstronaut.isPending ? "Création…" : "Créer l'astronaute"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs text-space-300 border border-space-500 hover:bg-space-600 hover:text-slate-200 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

function SyncDialog({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md border border-neon-cyan/30 bg-space-800 p-6 cyber-corner">
        <h2 className="mb-2 font-orbitron text-sm font-semibold tracking-wide text-slate-100">
          SYNCHRONISER AVEC GOOGLE WORKSPACE
        </h2>
        <p className="mb-4 text-sm text-space-300 leading-relaxed">
          Cette opération va importer tous les utilisateurs{" "}
          <span className="text-slate-200">@eleven-labs.com</span> depuis l&apos;annuaire Google
          Workspace.
        </p>
        <ul className="mb-5 space-y-1 text-xs text-space-300">
          <li>• Les nouveaux comptes seront créés automatiquement</li>
          <li>• Les comptes existants auront leur nom et photo mis à jour</li>
          <li>• Les comptes suspendus seront ignorés</li>
          <li className="text-amber-400">
            ⚠ Votre compte doit être Super Admin Google Workspace
          </li>
        </ul>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm text-space-300 border border-space-500 hover:bg-space-600 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-space-900 bg-neon-cyan hover:bg-neon-cyan/80 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Synchronisation…
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Synchroniser
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SyncResultBanner({
  result,
  error,
  onDismiss,
}: {
  result: SyncResult | null;
  error: string | null;
  onDismiss: () => void;
}) {
  if (!result && !error) return null;
  return (
    <div
      className={`mb-4 flex items-start justify-between gap-4 border px-4 py-3 text-sm ${
        error
          ? "border-red-500/30 bg-red-500/10 text-red-400"
          : "border-neon-cyan/30 bg-neon-cyan/5 text-slate-200"
      }`}
    >
      {error ? (
        <span>{error}</span>
      ) : result ? (
        <span>
          Synchronisation terminée —{" "}
          <span className="text-neon-cyan font-mono">{result.created}</span> créé(s),{" "}
          <span className="text-neon-cyan font-mono">{result.updated}</span> mis à jour,{" "}
          <span className="text-space-300 font-mono">{result.skipped}</span> ignoré(s)
        </span>
      ) : null}
      <button
        onClick={onDismiss}
        className="shrink-0 text-space-300 hover:text-slate-100 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

export function AstronautsAdminPage() {
  const { data: astronauts = [], isLoading, isError } = useAstronauts();
  const { data: planets = [] } = usePlanets();
  const updateAstronaut = useUpdateAstronaut();
  const syncGoogleUsers = useSyncGoogleUsers();
  const [search, setSearch] = useState("");
  const [filterPlanet, setFilterPlanet] = useState<string>("all");
  const [selectedAstronaut, setSelectedAstronaut] = useState<AstronautOut | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = astronauts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(q),
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

  const handleSyncConfirm = () => {
    setSyncResult(null);
    setSyncError(null);
    syncGoogleUsers.mutate(undefined, {
      onSuccess: (data) => {
        setSyncResult(data);
        setShowSyncDialog(false);
      },
      onError: (err) => {
        const msg =
          err instanceof Error ? err.message : "Erreur lors de la synchronisation";
        setSyncError(msg);
        setShowSyncDialog(false);
      },
    });
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddForm((v) => !v); }}
            className="flex items-center gap-2 border border-neon-cyan/40 bg-neon-cyan/5 px-3 py-1.5 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            <UserPlus size={13} />
            Ajouter un astronaute
          </button>
          <button
            onClick={() => { setShowSyncDialog(true); }}
            className="flex items-center gap-2 border border-space-500 bg-space-800 px-3 py-1.5 text-xs font-medium text-space-300 hover:bg-space-700 hover:text-slate-200 transition-colors"
          >
            <RefreshCw size={13} />
            Synchroniser avec Google
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddAstronautForm
          planets={planets}
          onClose={() => { setShowAddForm(false); }}
        />
      )}

      <SyncResultBanner
        result={syncResult}
        error={syncError}
        onDismiss={() => { setSyncResult(null); setSyncError(null); }}
      />

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
          <option value="none">— Sans planète</option>
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
                onClick={() => { setSelectedAstronaut(a); }}
                className="border-t border-space-600 hover:bg-space-600 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-slate-100">
                  {a.first_name} {a.last_name}
                </td>
                <td className="px-4 py-3 text-space-300">{a.email}</td>
                <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); }}>
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

      {showSyncDialog && (
        <SyncDialog
          onConfirm={handleSyncConfirm}
          onCancel={() => { setShowSyncDialog(false); }}
          isPending={syncGoogleUsers.isPending}
        />
      )}

      <AstronautDetailDrawer
        astronaut={selectedAstronaut}
        planets={planets}
        onClose={() => { setSelectedAstronaut(null); }}
      />
    </div>
  );
}
