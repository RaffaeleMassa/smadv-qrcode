import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function normCode(v) {
  return String(v || "").trim().toUpperCase();
}

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  useEffect(() => {
    const c = normCode(code);

    if (!c) {
      setMsg("Codice non valido. Contatta SM ADV.");
      return;
    }

    const API = "/.netlify/functions/sheets";
    const url = `${API}?action=get&code=${encodeURIComponent(c)}`;

    (async () => {
      try {
        const res = await fetch(url, { method: "GET" });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV.");
          return;
        }

        // redirect vero (senza tornare indietro)
        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete. Contatta SM ADV.");
      }
    })();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2>SM ADV</h2>
      <p>{msg}</p>
    </div>
  );
}
