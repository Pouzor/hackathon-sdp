import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/features/solar-system/StarField";

export function NotFoundPage() {
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
          404
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-3 -mt-4">
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: "rgba(99,210,255,0.7)",
              textTransform: "uppercase",
            }}
          >
            Signal perdu
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
            Secteur inexistant
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "320px",
              lineHeight: 1.7,
            }}
          >
            Cette page n&apos;existe pas ou a été déplacée dans un autre quadrant de la galaxie.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-40">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] text-white/20 font-mono">ERR_404</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Action */}
        <button
          onClick={() => { navigate("/"); }}
          className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white hover:border-white/20"
        >
          ← Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}
