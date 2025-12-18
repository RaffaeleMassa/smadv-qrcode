import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  useEffect(() => {
    const c = String(code || "").trim().toUpperCase();
    if (!c) {
      setMsg("Codice non valido. Contatta SM ADV");
      return;
    }

    const API = "/.netlify/functions/sheets";

    (async () => {
      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`);
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch {}

        if (!res.ok || !data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        // redirect
        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete. Contatta SM ADV");
      }
    })();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 28, textAlign: "center" }}>
      <h2 style={{ marginBottom: 8 }}>SM ADV</h2>
      <div>{msg}</div>
    </div>
  );
}
