import { useState } from "react";
import { Activity, Plus, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  type ActivityOut,
} from "@/api/astronauts";

const CATEGORIES = ["Contenu", "Événement", "Contribution", "Mentorat", "Autre"];

function ActivityRow({
  activity,
  onSave,
  onToggle,
}: {
  activity: ActivityOut;
  onSave: (id: number, fields: Partial<ActivityOut>) => void;
  onToggle: (id: number, isActive: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(activity.name);
  const [basePoints, setBasePoints] = useState(String(activity.base_points));
  const [category, setCategory] = useState(activity.category);
  const [isCollab, setIsCollab] = useState(activity.is_collaborative);
  const [multiAssign, setMultiAssign] = useState(activity.allow_multiple_assignees);

  function handleSave() {
    onSave(activity.id, {
      name: name.trim() || undefined,
      base_points: Number(basePoints) || undefined,
      category: category || undefined,
      is_collaborative: isCollab,
      allow_multiple_assignees: multiAssign,
    });
    setEditing(false);
  }

  function handleCancel() {
    setName(activity.name);
    setBasePoints(String(activity.base_points));
    setCategory(activity.category);
    setIsCollab(activity.is_collaborative);
    setMultiAssign(activity.allow_multiple_assignees);
    setEditing(false);
  }

  return (
    <tr
      className={`border-b border-space-600 transition-colors ${
        activity.is_active ? "hover:bg-space-700/40" : "opacity-50 hover:opacity-70"
      }`}
    >
      <td className="px-4 py-3">
        {editing ? (
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            className="bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white w-48 focus:outline-none focus:border-neon-cyan/60"
          />
        ) : (
          <span className="text-sm font-medium text-white">{activity.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); }}
            className="bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-neon-cyan/60"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs bg-space-600 border border-space-500 text-space-300">
            {activity.category}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={basePoints}
              onChange={(e) => { setBasePoints(e.target.value); }}
              min={1}
              className="w-20 bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-neon-cyan/60"
            />
            <span className="text-xs text-space-300">pts</span>
          </div>
        ) : (
          <span className="font-mono text-sm text-neon-cyan">{activity.base_points} pts</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setIsCollab((v) => !v); }}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                isCollab
                  ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                  : "bg-space-600 border-space-500 text-space-300"
              }`}
            >
              Collab
            </button>
            <button
              type="button"
              onClick={() => { setMultiAssign((v) => !v); }}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                multiAssign
                  ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                  : "bg-space-600 border-space-500 text-space-300"
              }`}
            >
              Multi
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {activity.is_collaborative && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/10 border border-neon-green/20 text-neon-green">
                Collab
              </span>
            )}
            {activity.allow_multiple_assignees && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
                Multi
              </span>
            )}
          </div>
        )}
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
          <div className="flex justify-end gap-1">
            <button
              onClick={() => { setEditing(true); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-space-300 hover:text-neon-cyan border border-transparent hover:border-space-500 transition-colors"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={() => { onToggle(activity.id, !activity.is_active); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border border-transparent hover:border-space-500 transition-colors ${
                activity.is_active
                  ? "text-space-300 hover:text-neon-red"
                  : "text-neon-green hover:text-neon-green"
              }`}
              title={activity.is_active ? "Désactiver" : "Activer"}
            >
              {activity.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export function ActivitiesAdminPage() {
  const { data: activities = [], isLoading } = useActivities();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0] ?? "Autre");
  const [newCollab, setNewCollab] = useState(false);
  const [newMulti, setNewMulti] = useState(false);

  const sorted = [...activities].sort((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPoints) return;
    createActivity.mutate(
      {
        name: newName.trim(),
        base_points: Number(newPoints),
        category: newCategory,
        is_collaborative: newCollab,
        allow_multiple_assignees: newMulti,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewPoints("");
          setNewCategory(CATEGORIES[0] ?? "Autre");
          setNewCollab(false);
          setNewMulti(false);
          setShowForm(false);
        },
      },
    );
  }

  const anyError = createActivity.isError || updateActivity.isError;
  const errorMsg = [createActivity.error, updateActivity.error]
    .find((e) => e instanceof Error)
    ?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-neon-cyan" />
          <h1 className="font-orbitron text-sm font-semibold tracking-widest text-slate-100 uppercase">
            Activités
          </h1>
          <span className="ml-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 px-2.5 py-0.5 text-xs font-semibold text-neon-cyan">
            {activities.filter((a) => a.is_active).length}/{activities.length}
          </span>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
        >
          <Plus size={12} /> Nouvelle activité
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
            Nouvelle activité
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-space-300">Nom</label>
              <input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); }}
                placeholder="Article de blog"
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white placeholder:text-space-400 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Points de base</label>
              <input
                type="number"
                value={newPoints}
                onChange={(e) => { setNewPoints(e.target.value); }}
                placeholder="50"
                min={1}
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white placeholder:text-space-400 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Catégorie</label>
              <select
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); }}
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCollab}
                onChange={(e) => { setNewCollab(e.target.checked); }}
                className="accent-neon-cyan"
              />
              <span className="text-xs text-space-300">Collaborative</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newMulti}
                onChange={(e) => { setNewMulti(e.target.checked); }}
                className="accent-neon-cyan"
              />
              <span className="text-xs text-space-300">Multi-assignees</span>
            </label>
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
              disabled={createActivity.isPending}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 transition-colors"
            >
              {createActivity.isPending ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-space-500 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-space-700 border-b border-space-500">
              {["Activité", "Catégorie", "Points", "Options", ""].map((h) => (
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
                  Aucune activité — créez-en une pour commencer.
                </td>
              </tr>
            ) : (
              sorted.map((a) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  onSave={(id, fields) => { updateActivity.mutate({ id, ...fields }); }}
                  onToggle={(id, isActive) => { updateActivity.mutate({ id, is_active: isActive }); }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
