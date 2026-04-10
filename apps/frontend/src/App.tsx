import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/features/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<div className="p-8 text-center">Bienvenue sur le Site des Planètes</div>} />
      </Route>
    </Routes>
  );
}

export default App;
