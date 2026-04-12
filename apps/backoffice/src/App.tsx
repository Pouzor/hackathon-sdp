import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/features/AdminLayout";
import { RequireAdmin } from "@/components/features/RequireAdmin";
import { LoginPage } from "@/routes/auth/LoginPage";
import { AuthCallbackPage } from "@/routes/auth/AuthCallbackPage";
import { RolesPage } from "@/routes/roles/RolesPage";
import { AstronautsAdminPage } from "@/routes/astronauts/AstronautsAdminPage";
import { AttributionPage } from "@/routes/attributions/AttributionPage";

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Routes protégées admin */}
      <Route element={<RequireAdmin />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<div className="text-gray-500 text-sm">Tableau de bord — bienvenue dans le back-office.</div>} />
          <Route path="astronauts" element={<AstronautsAdminPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="attributions/new" element={<AttributionPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
