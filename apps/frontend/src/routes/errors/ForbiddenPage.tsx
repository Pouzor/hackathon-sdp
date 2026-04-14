import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/features/solar-system/StarField";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-950 overflow-hidden">
      <StarField />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        {/* Code */}
        <div
          className="select-none font-bold leading-none"
          style={{
            fontSize: "clamp(100px, 20vw, 180px)",
            fontFamily: "'Orbitron', monospace",
            color: "rgba(255,255,255,0.06)",
            letterSpacing: "-0.02em",
          }}
        >
          403
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-3 -mt-4">
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: "rgba(255,100,100,0.7)",
              textTransform: "uppercase",
            }}
          >
            Accès refusé
          </span>
          <h1
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "20px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.05em",
            }}
          >
            Zone restreinte
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "320px",
              lineHeight: 1.7,
            }}
          >
            Vous n&apos;avez pas les autorisations nécessaires pour accéder à ce secteur.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-40">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] text-white/20 font-mono">ERR_403</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Action */}
        <button
          onClick={() => { navigate(-1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white hover:border-white/20"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
