import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  const API = "/.netlify/functions/sheets";

  const cleanCode = useMemo(() => String(code || "").toUpperCase().trim(), [code]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!cleanCode) {
        setMsg("Codice non valido. Contatta SM ADV");
        return;
      }

      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(cleanCode)}`, { method: "GET" });
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();

        if (!ct.includes("application/json")) {
          if (!alive) return;
          setMsg("Errore interno (Sheets). Contatta SM ADV");
          return;
        }

        const data = JSON.parse(text);

        if (!data?.ok || !data?.item?.url) {
          if (!alive) return;
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        // Redirect
        window.location.replace(data.item.url);
      } catch (e) {
        if (!alive) return;
        setMsg("Errore rete. Contatta SM ADV");
      }
    }

    run();
    return () => { alive = false; };
  }, [cleanCode]);

  return (
    <div style={{ fontFamily: "system-ui", textAlign: "center", padding: "60px 16px" }}>
      <h2 style={{ marginBottom: 10 }}>SM ADV</h2>
      <div style={{ opacity: 0.9 }}>{msg}</div>
    </div>
  );
}
