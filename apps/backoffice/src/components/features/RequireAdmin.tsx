import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white/60">
        Accès refusé — rôle admin requis.
      </div>
    );
  return <Outlet />;
}
