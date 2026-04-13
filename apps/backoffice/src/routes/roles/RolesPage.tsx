import { useState } from "react";
import { useAstronauts, useUpdateRoles, type AstronautOut } from "@/api/astronauts";
import { useAuth } from "@/hooks/useAuth";

function RolesBadge({ roles }: { roles: string[] }) {
  const isAdmin = roles.includes("admin");
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
        isAdmin
          ? "border-neon-gold/30 bg-neon-gold/10 text-neon-gold"
          : "border-space-400 bg-space-600 text-space-200"
      }`}
    >
      {isAdmin ? "Admin" : "Astronaute"}
    </span>
  );
}

function ToggleButton({
  astronaut,
  currentUserId,
  onToggle,
  isLoading,
}: {
  astronaut: AstronautOut;
  currentUserId: number | null;
  onToggle: () => void;
  isLoading: boolean;
}) {
  const isAdmin = astronaut.roles.includes("admin");
  const isSelf = astronaut.id === currentUserId;

  if (isSelf && isAdmin) {
    return <span className="text-xs italic text-space-300">Vous-même</span>;
  }

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
        isAdmin
          ? "border-neon-red/30 bg-neon-red/10 text-neon-red hover:bg-neon-red/20"
          : "border-neon-green/30 bg-neon-green/10 text-neon-green hover:bg-neon-green/20"
      }`}
    >
      {isLoading ? "…" : isAdmin ? "Retirer admin" : "Promouvoir admin"}
    </button>
  );
}

export function RolesPage() {
  const { data: astronauts = [], isLoading, isError } = useAstronauts();
  const updateRoles = useUpdateRoles();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [pendingRoles, setPendingRoles] = useState<string[] | null>(null);

  const { user } = useAuth();
  const currentUserId = user?.astronaut_id ?? null;

  function handleToggle(astronaut: AstronautOut) {
    const isAdmin = astronaut.roles.includes("admin");
    const newRoles = isAdmin
      ? astronaut.roles.filter((r) => r !== "admin")
      : [...astronaut.roles, "admin"];
    setConfirmId(astronaut.id);
    setPendingRoles(newRoles);
  }

  function confirmToggle() {
    if (confirmId === null || pendingRoles === null) return;
    updateRoles.mutate(
      { id: confirmId, roles: pendingRoles },
      {
        onSettled: () => {
          setConfirmId(null);
          setPendingRoles(null);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-space-300">Chargement…</div>
    );
  }

  if (isError) {
    return <div className="p-8 text-neon-red">Erreur lors du chargement des astronautes.</div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-orbitron text-base font-semibold tracking-wide text-slate-100">
        GESTION DES RÔLES
      </h1>

      {/* Dialog de confirmation */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/80 backdrop-blur-sm">
          <div className="cyber-corner bg-space-800 border border-space-500 p-6 shadow-neon-cyan w-full max-w-md">
            <p className="mb-4 text-slate-200">
              Confirmer la modification des rôles de{" "}
              <strong className="text-neon-cyan">
                {astronauts.find((a) => a.id === confirmId)?.email}
              </strong>{" "}
              ?
            </p>
            <p className="mb-6 text-sm text-space-300">
              Nouveaux rôles :{" "}
              <span className="text-slate-200">{pendingRoles?.join(", ")}</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmId(null);
                  setPendingRoles(null);
                }}
                className="px-4 py-2 text-sm text-space-300 hover:text-slate-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmToggle}
                disabled={updateRoles.isPending}
                className="border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 text-sm font-medium text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 transition-colors"
              >
                {updateRoles.isPending ? "Mise à jour…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden border border-space-500 cyber-corner">
        <table className="w-full text-sm">
          <thead className="bg-space-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-space-300">
                Astronaute
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-space-300">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-space-300">
                Rôle actuel
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-space-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-space-700">
            {astronauts.map((a) => (
              <tr
                key={a.id}
                className="border-t border-space-600 hover:bg-space-600 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-100">
                  {a.first_name} {a.last_name}
                </td>
                <td className="px-4 py-3 text-space-300">{a.email}</td>
                <td className="px-4 py-3">
                  <RolesBadge roles={a.roles} />
                </td>
                <td className="px-4 py-3">
                  <ToggleButton
                    astronaut={a}
                    currentUserId={currentUserId}
                    onToggle={() => {
                      handleToggle(a);
                    }}
                    isLoading={updateRoles.isPending && confirmId === a.id}
                  />
                </td>
              </tr>
            ))}
            {astronauts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-space-300">
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
