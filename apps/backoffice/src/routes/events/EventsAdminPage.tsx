import { useState } from "react";
import { CalendarPlus, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents, useCreateEvent, type EventOut } from "@/api/events";

function EventRow({ event }: { event: EventOut }) {
  const d = new Date(event.event_date);
  const formatted = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <Link
      to={`/events/${event.id}/attendance`}
      className="flex items-center justify-between border-t border-space-600 px-4 py-3 hover:bg-space-600 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100">{event.name}</p>
        <p className="text-xs text-space-300 mt-0.5">{formatted}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 border border-space-500 bg-space-700 rounded text-xs text-space-300">
        <Users size={11} />
        <span className="font-mono">{event.attendance_count}</span>
      </div>
      <ChevronRight size={14} className="text-space-400 shrink-0" />
    </Link>
  );
}

export function EventsAdminPage() {
  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setError(null);
    if (!name.trim()) { setError("Le nom est obligatoire."); return; }
    createEvent.mutate(
      { name: name.trim(), event_date: eventDate },
      {
        onSuccess: () => {
          setName("");
          setEventDate(new Date().toISOString().slice(0, 10));
          setShowForm(false);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Erreur");
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-orbitron text-base font-semibold tracking-wide text-slate-100">
          ÉVÉNEMENTS{" "}
          <span className="text-neon-cyan">({events.length})</span>
        </h1>
        <button
          onClick={() => { setShowForm((v) => !v); }}
          className="flex items-center gap-2 border border-neon-cyan/40 bg-neon-cyan/5 px-3 py-1.5 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
        >
          <CalendarPlus size={13} />
          Nouvel événement
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="mb-5 border border-neon-cyan/20 bg-space-800 p-4 cyber-corner">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-space-300">Nom de l&apos;événement</label>
              <input
                type="text"
                placeholder="Ex: Weekly, Offsite Paris…"
                value={name}
                onChange={(e) => { setName(e.target.value); }}
                className="w-full border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 placeholder:text-space-400 outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-space-300">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => { setEventDate(e.target.value); }}
                className="border border-space-500 bg-space-700 px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={createEvent.isPending}
              className="border border-neon-cyan/40 bg-neon-cyan/5 px-4 py-2 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {createEvent.isPending ? "Création…" : "Créer"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      )}

      {/* Liste */}
      <div className="overflow-hidden border border-space-500 cyber-corner">
        {isLoading ? (
          <div className="px-4 py-8 text-sm text-space-300">Chargement…</div>
        ) : events.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-space-300">
            Aucun événement. Créez-en un pour commencer.
          </div>
        ) : (
          <div className="bg-space-700">
            {events.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
