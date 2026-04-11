import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/routes/home/HomePage";
import { AstronautsPage } from "@/routes/astronauts/AstronautsPage";
import { AstronautProfilePage } from "@/routes/astronauts/AstronautProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/astronauts" element={<AstronautsPage />} />
      <Route path="/astronauts/:id" element={<AstronautProfilePage />} />
    </Routes>
  );
}

export default App;
