import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_TOKEN_KEY } from "@/hooks/useAuth";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      void navigate("/", { replace: true });
    } else {
      void navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm text-white/50">Connexion en cours…</p>
      </div>
    </div>
  );
}
