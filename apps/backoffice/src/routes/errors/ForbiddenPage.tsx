import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldOff } from "lucide-react";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-space-900 dot-grid font-exo overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-neon-red/4 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Badge */}
        <div className="flex items-center gap-2">
          <ShieldOff size={12} className="text-neon-red" />
          <span className="font-orbitron text-[10px] tracking-widest text-neon-red uppercase">
            Mission Control — Accès refusé
          </span>
        </div>

        {/* Code */}
        <div className="font-orbitron text-[120px] font-bold leading-none tracking-tight text-space-600 select-none">
          403
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-orbitron text-lg font-semibold tracking-wide text-slate-100">
            ZONE RESTREINTE
          </h1>
          <p className="max-w-xs text-sm text-space-300 leading-relaxed">
            Vous n&apos;avez pas les autorisations nécessaires pour accéder à ce secteur.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-48">
          <div className="h-px flex-1 bg-space-600" />
          <span className="text-[10px] text-space-500 font-mono">ERR_403</span>
          <div className="h-px flex-1 bg-space-600" />
        </div>

        {/* Action */}
        <button
          onClick={() => { navigate(-1); }}
          className="flex items-center gap-2 border border-space-400 bg-space-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:border-space-300 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft size={13} />
          Retour
        </button>
      </div>
    </div>
  );
}
