import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/features/AdminLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route
          index
          element={<div className="p-8">Tableau de bord — Bienvenue dans le back-office</div>}
        />
      </Route>
    </Routes>
  );
}

export default App;
