import { useState } from "react";
import { Trophy, Plus, Pencil, Trash2, Check, X, Zap, Globe, Users } from "lucide-react";
import {
  useTrophies,
  useCreateTrophy,
  useUpdateTrophy,
  useDeleteTrophy,
  useCreateTrophyAttribution,
  useAstronauts,
  usePlanets,
  useSeasons,
  type TrophyOut,
  type AstronautOut,
  type PlanetOut,
} from "@/api/astronauts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Trophy row (inline edit) ──────────────────────────────────────────────────

function TrophyRow({
  trophy,
  onSave,
  onDelete,
  onAttribute,
}: {
  trophy: TrophyOut;
  onSave: (id: number, fields: Partial<TrophyOut>) => void;
  onDelete: (id: number) => void;
  onAttribute: (trophy: TrophyOut) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(trophy.name);
  const [description, setDescription] = useState(trophy.description ?? "");
  const [iconUrl, setIconUrl] = useState(trophy.icon_url ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    onSave(trophy.id, {
      name: name.trim() || undefined,
      description: description.trim() || null,
      icon_url: iconUrl.trim() || null,
    });
    setEditing(false);
  }

  function handleCancel() {
    setName(trophy.name);
    setDescription(trophy.description ?? "");
    setIconUrl(trophy.icon_url ?? "");
    setEditing(false);
    setConfirmDelete(false);
  }

  if (editing) {
    return (
      <tr className="border-b border-space-600 bg-neon-cyan/5">
        <td className="px-4 py-3 w-8 text-center">
          {trophy.icon_url ? (
            <span className="text-base">{trophy.icon_url}</span>
          ) : (
            <Trophy size={14} className="text-space-400 mx-auto" />
          )}
        </td>
        <td className="px-4 py-3">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            autoFocus
            className="w-full rounded bg-space-700 border border-neon-cyan/40 px-2 py-1 text-sm text-white focus:outline-none"
          />
        </td>
        <td className="px-4 py-3">
          <input
            value={description}
            onChange={(e) => { setDescription(e.target.value); }}
            placeholder="Description…"
            className="w-full rounded bg-space-700 border border-space-500 px-2 py-1 text-sm text-white focus:outline-none focus:border-neon-cyan/40"
          />
        </td>
        <td className="px-4 py-3">
          <input
            value={iconUrl}
            onChange={(e) => { setIconUrl(e.target.value); }}
            placeholder="🏆 ou URL image"
            className="w-32 rounded bg-space-700 border border-space-500 px-2 py-1 text-sm text-white focus:outline-none focus:border-neon-cyan/40"
          />
        </td>
        <td className="px-4 py-3" />
        <td className="px-4 py-3">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 rounded border border-neon-green/40 bg-neon-green/10 px-2 py-1 text-xs text-neon-green hover:bg-neon-green/20"
            >
              <Check size={11} /> Enregistrer
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 rounded border border-space-400 px-2 py-1 text-xs text-space-300 hover:text-slate-200"
            >
              <X size={11} /> Annuler
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-space-600 hover:bg-space-700/40 transition-colors">
      {/* Icon */}
      <td className="px-4 py-3 w-8 text-center text-base">
        {trophy.icon_url ? (
          <span>{trophy.icon_url.startsWith("http") ? "🏆" : trophy.icon_url}</span>
        ) : (
          <Trophy size={14} className="text-space-400 mx-auto" />
        )}
      </td>

      {/* Name */}
      <td className="px-4 py-3 font-medium text-slate-200">{trophy.name}</td>

      {/* Description */}
      <td className="px-4 py-3 max-w-xs">
        <span className="truncate text-sm text-space-300">{trophy.description ?? "—"}</span>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span
          className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase ${
            trophy.rule_type === "automatic"
              ? "border-neon-gold/30 bg-neon-gold/10 text-neon-gold"
              : "border-space-400 bg-space-700 text-space-200"
          }`}
        >
          {trophy.rule_type}
        </span>
      </td>

      {/* Created */}
      <td className="px-4 py-3 text-xs text-space-300">{fmt(trophy.created_at)}</td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { onAttribute(trophy); }}
            title="Attribuer ce trophée"
            className="flex items-center gap-1 rounded border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
          >
            <Zap size={11} /> Attribuer
          </button>
          <button
            type="button"
            onClick={() => { setEditing(true); }}
            title="Modifier"
            className="rounded p-1.5 text-space-300 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            <Pencil size={12} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-neon-red">Confirmer ?</span>
              <button
                type="button"
                onClick={() => { onDelete(trophy.id); }}
                className="rounded p-1 text-neon-red hover:bg-neon-red/10"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); }}
                className="rounded p-1 text-space-300 hover:text-slate-200"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setConfirmDelete(true); }}
              title="Supprimer"
              className="rounded p-1.5 text-space-300 hover:text-neon-red hover:bg-neon-red/10 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Attribution panel ─────────────────────────────────────────────────────────

function AttributionPanel({
  trophy,
  astronauts,
  planets,
  onClose,
  onSubmit,
  isPending,
  error,
}: {
  trophy: TrophyOut;
  astronauts: AstronautOut[];
  planets: PlanetOut[];
  onClose: () => void;
  onSubmit: (args: { targetType: "astronaut" | "planet"; targetId: number; comment: string }) => void;
  isPending: boolean;
  error: string | null;
}) {
  const [targetType, setTargetType] = useState<"astronaut" | "planet">("astronaut");
  const [targetId, setTargetId] = useState<string>("");
  const [comment, setComment] = useState("");
  const [search, setSearch] = useState("");

  const filteredAstronauts = search
    ? astronauts.filter((a) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()),
      )
    : astronauts;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId) return;
    onSubmit({ targetType, targetId: parseInt(targetId, 10), comment });
  }

  return (
    <div className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-neon-cyan" />
            <h3 className="font-orbitron text-xs font-semibold uppercase tracking-widest text-neon-cyan">
              Attribuer
            </h3>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-200">
            {trophy.icon_url && !trophy.icon_url.startsWith("http")
              ? `${trophy.icon_url} `
              : ""}
            {trophy.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-space-300 hover:text-slate-200 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Target type toggle */}
        <div className="flex gap-2">
          {(["astronaut", "planet"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setTargetType(type); setTargetId(""); setSearch(""); }}
              className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                targetType === type
                  ? "border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan"
                  : "border-space-500 bg-space-700 text-space-300 hover:border-space-400 hover:text-slate-200"
              }`}
            >
              {type === "astronaut" ? <Users size={11} /> : <Globe size={11} />}
              {type === "astronaut" ? "Astronaute" : "Planète"}
            </button>
          ))}
        </div>

        {/* Target selector */}
        {targetType === "planet" ? (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
              Planète *
            </label>
            <select
              value={targetId}
              onChange={(e) => { setTargetId(e.target.value); }}
              required
              className="w-full border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
            >
              <option value="">Choisir une planète…</option>
              {planets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
              Astronaute *
            </label>
            <input
              type="search"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              className="mb-1.5 w-full border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
            />
            <select
              value={targetId}
              onChange={(e) => { setTargetId(e.target.value); }}
              required
              size={5}
              className="w-full border border-space-500 bg-space-800 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
            >
              <option value="">— Sélectionner —</option>
              {filteredAstronauts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Comment */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-space-300">
            Commentaire
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => { setComment(e.target.value); }}
            placeholder="Motif, contexte…"
            className="w-full border border-space-500 bg-space-800 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-neon-red">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending || !targetId}
          className="border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Attribution en cours…" : "Attribuer le trophée"}
        </button>
      </form>
    </div>
  );
}

// ── Create form ───────────────────────────────────────────────────────────────

function CreateTrophyForm({
  onCreate,
  isPending,
}: {
  onCreate: (fields: { name: string; description: string; icon_url: string }) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), icon_url: iconUrl.trim() });
    setName("");
    setDescription("");
    setIconUrl("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); }}
        className="flex items-center gap-2 border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
      >
        <Plus size={13} /> Nouveau trophée
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded border border-neon-cyan/20 bg-neon-cyan/5 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-space-300">Nom *</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); }}
          placeholder="Nom du trophée"
          required
          className="w-48 rounded border border-space-500 bg-space-800 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-space-300">Description</label>
        <input
          value={description}
          onChange={(e) => { setDescription(e.target.value); }}
          placeholder="Description…"
          className="w-64 rounded border border-space-500 bg-space-800 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-space-300">Icône / emoji</label>
        <input
          value={iconUrl}
          onChange={(e) => { setIconUrl(e.target.value); }}
          placeholder="🏆"
          className="w-24 rounded border border-space-500 bg-space-800 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded border border-neon-green/40 bg-neon-green/10 px-3 py-1.5 text-xs font-semibold text-neon-green hover:bg-neon-green/20 disabled:opacity-50 transition-colors"
        >
          <Check size={11} /> Créer
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); }}
          className="flex items-center gap-1.5 rounded border border-space-500 px-3 py-1.5 text-xs text-space-300 hover:text-slate-200"
        >
          <X size={11} /> Annuler
        </button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function TrophiesAdminPage() {
  const { data: trophies = [], isLoading } = useTrophies();
  const { data: astronauts = [] } = useAstronauts();
  const { data: planets = [] } = usePlanets();
  const { data: seasons = [] } = useSeasons();

  const createTrophy = useCreateTrophy();
  const updateTrophy = useUpdateTrophy();
  const deleteTrophy = useDeleteTrophy();
  const createAttribution = useCreateTrophyAttribution();

  const [attributingTrophy, setAttributingTrophy] = useState<TrophyOut | null>(null);
  const [attributionError, setAttributionError] = useState<string | null>(null);
  const [attributionSuccess, setAttributionSuccess] = useState<string | null>(null);

  const activeSeason = seasons.find((s) => s.is_active);

  async function handleAttribution({
    targetType,
    targetId,
    comment,
  }: {
    targetType: "astronaut" | "planet";
    targetId: number;
    comment: string;
  }) {
    if (!attributingTrophy) return;
    setAttributionError(null);
    try {
      await createAttribution.mutateAsync({
        trophy_id: attributingTrophy.id,
        astronaut_id: targetType === "astronaut" ? targetId : null,
        planet_id: targetType === "planet" ? targetId : null,
        comment: comment || null,
      });
      const targetName =
        targetType === "astronaut"
          ? astronauts.find((a) => a.id === targetId)?.first_name ?? String(targetId)
          : planets.find((p) => p.id === targetId)?.name ?? String(targetId);
      setAttributionSuccess(
        `Trophée "${attributingTrophy.name}" attribué à ${targetName}.`,
      );
      setAttributingTrophy(null);
    } catch (err) {
      setAttributionError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-base font-semibold tracking-widest text-slate-100 uppercase">
            Trophées{" "}
            <span className="text-neon-cyan">({trophies.length})</span>
          </h1>
          {!activeSeason && (
            <p className="mt-1 text-xs text-neon-red">
              ⚠ Aucune saison active — les attributions sont bloquées.
            </p>
          )}
        </div>
      </div>

      {/* Success banner */}
      {attributionSuccess && (
        <div className="flex items-center justify-between rounded border border-neon-green/30 bg-neon-green/10 px-4 py-2.5 text-sm text-neon-green">
          ✓ {attributionSuccess}
          <button
            type="button"
            onClick={() => { setAttributionSuccess(null); }}
            className="ml-4 opacity-60 hover:opacity-100"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Attribution panel */}
      {attributingTrophy && (
        <AttributionPanel
          trophy={attributingTrophy}
          astronauts={astronauts}
          planets={planets}
          onClose={() => { setAttributingTrophy(null); setAttributionError(null); }}
          onSubmit={(args) => { void handleAttribution(args); }}
          isPending={createAttribution.isPending}
          error={attributionError}
        />
      )}

      {/* Create form */}
      <CreateTrophyForm
        onCreate={(fields) => {
          createTrophy.mutate({
            name: fields.name,
            description: fields.description || null,
            icon_url: fields.icon_url || null,
          });
        }}
        isPending={createTrophy.isPending}
      />

      {/* Table */}
      {isLoading ? (
        <p className="text-sm text-space-300">Chargement…</p>
      ) : trophies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Trophy size={32} className="text-space-500" />
          <p className="text-sm text-space-300">Aucun trophée créé pour l'instant.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-space-500">
          <table className="w-full text-sm">
            <thead className="bg-space-800 text-left">
              <tr>
                <th className="px-4 py-3 w-8" />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                  Nom
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                  Description
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                  Créé le
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-space-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-space-700">
              {trophies.map((trophy) => (
                <TrophyRow
                  key={trophy.id}
                  trophy={trophy}
                  onSave={(id, fields) => { updateTrophy.mutate({ id, ...fields }); }}
                  onDelete={(id) => { deleteTrophy.mutate(id); }}
                  onAttribute={(t) => {
                    setAttributingTrophy(t);
                    setAttributionError(null);
                    setAttributionSuccess(null);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
