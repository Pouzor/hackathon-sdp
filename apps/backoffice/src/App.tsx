import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/features/AdminLayout";
import { RequireAdmin } from "@/components/features/RequireAdmin";
import { LoginPage } from "@/routes/auth/LoginPage";
import { AuthCallbackPage } from "@/routes/auth/AuthCallbackPage";
import { NotFoundPage } from "@/routes/errors/NotFoundPage";
import { ForbiddenPage } from "@/routes/errors/ForbiddenPage";
import { DashboardPage } from "@/routes/dashboard/DashboardPage";
import { RolesPage } from "@/routes/roles/RolesPage";
import { AstronautsAdminPage } from "@/routes/astronauts/AstronautsAdminPage";
import { AttributionPage } from "@/routes/attributions/AttributionPage";
import { PlanetsAdminPage } from "@/routes/planets/PlanetsAdminPage";
import { SeasonsAdminPage } from "@/routes/seasons/SeasonsAdminPage";
import { GradesAdminPage } from "@/routes/grades/GradesAdminPage";
import { ActivitiesAdminPage } from "@/routes/activities/ActivitiesAdminPage";
import { TrophiesAdminPage } from "@/routes/trophies/TrophiesAdminPage";
import { EventsAdminPage } from "@/routes/events/EventsAdminPage";
import { EventAttendancePage } from "@/routes/events/EventAttendancePage";
import { SettingsPage } from "@/routes/settings/SettingsPage";

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Routes protégées admin */}
      <Route element={<RequireAdmin />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="astronauts" element={<AstronautsAdminPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="attributions/new" element={<AttributionPage />} />
          <Route path="planets" element={<PlanetsAdminPage />} />
          <Route path="seasons" element={<SeasonsAdminPage />} />
          <Route path="grades" element={<GradesAdminPage />} />
          <Route path="activities" element={<ActivitiesAdminPage />} />
          <Route path="trophies" element={<TrophiesAdminPage />} />
          <Route path="events" element={<EventsAdminPage />} />
          <Route path="events/:id/attendance" element={<EventAttendancePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
