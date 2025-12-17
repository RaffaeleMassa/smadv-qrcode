import { Routes, Route, Navigate } from "react-router-dom";
import Admin from "./pages/admin.jsx";
import Redirect from "./pages/Redirect.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/r/:code" element={<Redirect />} />
      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}
