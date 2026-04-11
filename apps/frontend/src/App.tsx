import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/features/ProtectedRoute";
import { AuthCallbackPage } from "@/routes/auth/AuthCallbackPage";
import { LoginPage } from "@/routes/auth/LoginPage";
import { AstronautProfilePage } from "@/routes/astronauts/AstronautProfilePage";
import { AstronautsPage } from "@/routes/astronauts/AstronautsPage";
import { HomePage } from "@/routes/home/HomePage";

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Routes protégées */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/astronauts" element={<AstronautsPage />} />
        <Route path="/astronauts/:id" element={<AstronautProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
