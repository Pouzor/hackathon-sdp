import { useState } from "react";
import { Award, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
  useGrades,
  useCreateGrade,
  useUpdateGrade,
  useDeleteGrade,
  type GradeOut,
} from "@/api/astronauts";

function GradeRow({
  grade,
  onSave,
  onDelete,
}: {
  grade: GradeOut;
  onSave: (id: number, fields: { name?: string; threshold_points?: number; order?: number }) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(grade.name);
  const [threshold, setThreshold] = useState(String(grade.threshold_points));
  const [order, setOrder] = useState(String(grade.order));
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    onSave(grade.id, {
      name: name.trim() || undefined,
      threshold_points: Number(threshold),
      order: Number(order),
    });
    setEditing(false);
  }

  function handleCancel() {
    setName(grade.name);
    setThreshold(String(grade.threshold_points));
    setOrder(String(grade.order));
    setEditing(false);
  }

  return (
    <tr className="border-b border-space-600 hover:bg-space-700/40 transition-colors">
      <td className="px-4 py-3 w-12">
        {editing ? (
          <input
            type="number"
            value={order}
            onChange={(e) => { setOrder(e.target.value); }}
            min={1}
            className="w-14 bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-neon-cyan/60"
          />
        ) : (
          <span className="font-mono text-sm text-space-300">{grade.order}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            className="bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white w-40 focus:outline-none focus:border-neon-cyan/60"
          />
        ) : (
          <span className="text-sm font-semibold text-white">{grade.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={threshold}
              onChange={(e) => { setThreshold(e.target.value); }}
              min={0}
              className="w-24 bg-space-600 border border-space-400 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-neon-cyan/60"
            />
            <span className="text-xs text-space-300">pts</span>
          </div>
        ) : (
          <span className="font-mono text-sm text-neon-cyan">
            {grade.threshold_points.toLocaleString()} pts
          </span>
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
        ) : confirmDelete ? (
          <div className="flex justify-end items-center gap-2">
            <span className="text-xs text-neon-red">Supprimer ?</span>
            <button
              onClick={() => { onDelete(grade.id); }}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-neon-red/10 border border-neon-red/40 text-neon-red hover:bg-neon-red/20 transition-colors"
            >
              Confirmer
            </button>
            <button
              onClick={() => { setConfirmDelete(false); }}
              className="px-2 py-1 rounded text-xs text-space-300 hover:text-white border border-space-500 transition-colors"
            >
              Annuler
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
              onClick={() => { setConfirmDelete(true); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-space-300 hover:text-neon-red border border-transparent hover:border-space-500 transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export function GradesAdminPage() {
  const { data: grades = [], isLoading } = useGrades();
  const createGrade = useCreateGrade();
  const updateGrade = useUpdateGrade();
  const deleteGrade = useDeleteGrade();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newThreshold, setNewThreshold] = useState("");
  const [newOrder, setNewOrder] = useState("");

  const sorted = [...grades].sort((a, b) => a.order - b.order);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newThreshold || !newOrder) return;
    createGrade.mutate(
      {
        name: newName.trim(),
        threshold_points: Number(newThreshold),
        order: Number(newOrder),
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewThreshold("");
          setNewOrder("");
          setShowForm(false);
        },
      },
    );
  }

  const anyError = createGrade.isError || updateGrade.isError || deleteGrade.isError;
  const errorMsg = [createGrade.error, updateGrade.error, deleteGrade.error]
    .find((e) => e instanceof Error)
    ?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award size={16} className="text-neon-cyan" />
          <h1 className="font-orbitron text-sm font-semibold tracking-widest text-slate-100 uppercase">
            Grades & Paliers
          </h1>
          <span className="ml-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 px-2.5 py-0.5 text-xs font-semibold text-neon-cyan">
            {grades.length}
          </span>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
        >
          <Plus size={12} /> Nouveau grade
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
            Nouveau grade
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Nom</label>
              <input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); }}
                placeholder="Rookie"
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white placeholder:text-space-400 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Seuil (pts)</label>
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => { setNewThreshold(e.target.value); }}
                placeholder="0"
                min={0}
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white placeholder:text-space-400 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-space-300">Ordre</label>
              <input
                type="number"
                value={newOrder}
                onChange={(e) => { setNewOrder(e.target.value); }}
                placeholder="1"
                min={1}
                required
                className="w-full bg-space-700 border border-space-500 rounded px-3 py-2 text-sm text-white placeholder:text-space-400 focus:outline-none focus:border-neon-cyan/50"
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
              disabled={createGrade.isPending}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 transition-colors"
            >
              {createGrade.isPending ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-space-500 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-space-700 border-b border-space-500">
              {["Ordre", "Grade", "Seuil", ""].map((h) => (
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
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-space-300">
                  Chargement…
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-space-300">
                  Aucun grade — créez-en un pour commencer.
                </td>
              </tr>
            ) : (
              sorted.map((g) => (
                <GradeRow
                  key={g.id}
                  grade={g}
                  onSave={(id, fields) => { updateGrade.mutate({ id, ...fields }); }}
                  onDelete={(id) => { deleteGrade.mutate(id); }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
