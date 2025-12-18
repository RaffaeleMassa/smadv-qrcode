import { Routes, Route, Navigate } from "react-router-dom";
import Admin from "./pages/admin.jsx";
import Redirect from "./pages/Redirect.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/r/:code" element={<Redirect />} />

      {/* fallback */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
