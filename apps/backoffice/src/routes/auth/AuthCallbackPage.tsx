import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-sm text-white/40">
      Connexion en cours…
    </div>
  );
}
