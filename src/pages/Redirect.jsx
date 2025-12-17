import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "/.netlify/functions/sheets";

export default function Redirector() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  useEffect(() => {
    const run = async () => {
      const clean = String(code || "").trim().toUpperCase();
      if (!clean) {
        setMsg("Codice non valido. Contatta SM ADV");
        return;
      }

      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(clean)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        // redirect vero
        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete. Contatta SM ADV");
      }
    };

    run();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>SM ADV</h2>
      <p>{msg}</p>
    </div>
  );
}
