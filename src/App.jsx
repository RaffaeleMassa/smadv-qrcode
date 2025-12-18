import { Navigate, Route, Routes } from "react-router-dom";
import Admin from "./pages/admin.jsx";
import Redirect from "./pages/Redirect.jsx";

export default function App() {
  return (
    <Routes>
      {/* Home -> admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin */}
      <Route path="/admin" element={<Admin />} />

      {/* Redirect dinamico */}
      <Route path="/r/:code" element={<Redirect />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
