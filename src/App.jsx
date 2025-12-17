import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/admin.jsx";
import Redirect from "./pages/Redirect.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/r/:code" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  );
}
