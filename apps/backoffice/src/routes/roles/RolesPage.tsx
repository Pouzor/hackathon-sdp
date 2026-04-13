import { useState } from "react";
import { useAstronauts, useUpdateRoles, type AstronautOut } from "@/api/astronauts";
import { useAuth } from "@/hooks/useAuth";

function RolesBadge({ roles }: { roles: string[] }) {
  const isAdmin = roles.includes("admin");
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
        isAdmin ? "bg-amber-900/40 text-amber-300" : "bg-slate-700 text-slate-300"
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
    return <span className="text-xs italic text-white/30">Vous-même</span>;
  }

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`rounded px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
        isAdmin
          ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
          : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
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
    return <div className="flex items-center justify-center p-16 text-white/40">Chargement…</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-400">Erreur lors du chargement des astronautes.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Gestion des rôles</h1>

      {/* Dialog de confirmation */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-xl border border-white/10 bg-gray-900 p-6 shadow-xl">
            <p className="mb-4 text-white">
              Confirmer la modification des rôles de{" "}
              <strong>{astronauts.find((a) => a.id === confirmId)?.email}</strong> ?
            </p>
            <p className="mb-6 text-sm text-white/50">
              Nouveaux rôles : {pendingRoles?.join(", ")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmId(null);
                  setPendingRoles(null);
                }}
                className="rounded px-4 py-2 text-sm text-white/60 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={confirmToggle}
                disabled={updateRoles.isPending}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {updateRoles.isPending ? "Mise à jour…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-medium uppercase text-white/40">
              <th className="px-4 py-3">Astronaute</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle actuel</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {astronauts.map((a) => (
              <tr key={a.id} className="hover:bg-white/3 border-b border-white/5 text-white/80">
                <td className="px-4 py-3 font-medium">
                  {a.first_name} {a.last_name}
                </td>
                <td className="px-4 py-3 text-white/50">{a.email}</td>
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
                <td colSpan={4} className="px-4 py-8 text-center text-white/30">
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
