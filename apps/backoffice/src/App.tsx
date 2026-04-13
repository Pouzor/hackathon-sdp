import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/features/AdminLayout";
import { RequireAdmin } from "@/components/features/RequireAdmin";
import { LoginPage } from "@/routes/auth/LoginPage";
import { AuthCallbackPage } from "@/routes/auth/AuthCallbackPage";
import { RolesPage } from "@/routes/roles/RolesPage";
import { AstronautsAdminPage } from "@/routes/astronauts/AstronautsAdminPage";
import { AttributionPage } from "@/routes/attributions/AttributionPage";
import { PlanetsAdminPage } from "@/routes/planets/PlanetsAdminPage";
import { SeasonsAdminPage } from "@/routes/seasons/SeasonsAdminPage";
import { GradesAdminPage } from "@/routes/grades/GradesAdminPage";
import { ActivitiesAdminPage } from "@/routes/activities/ActivitiesAdminPage";

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Routes protégées admin */}
      <Route element={<RequireAdmin />}>
        <Route path="/" element={<AdminLayout />}>
          <Route
            index
            element={
              <div className="flex flex-col gap-2">
                <h1 className="font-orbitron text-base font-semibold tracking-wide text-slate-100">
                  TABLEAU DE BORD
                </h1>
                <p className="text-sm text-space-300">
                  Bienvenue dans le back-office — Site des Planètes.
                </p>
              </div>
            }
          />
          <Route path="astronauts" element={<AstronautsAdminPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="attributions/new" element={<AttributionPage />} />
          <Route path="planets" element={<PlanetsAdminPage />} />
          <Route path="seasons" element={<SeasonsAdminPage />} />
          <Route path="grades" element={<GradesAdminPage />} />
          <Route path="activities" element={<ActivitiesAdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
