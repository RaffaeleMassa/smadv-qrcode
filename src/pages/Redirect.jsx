import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  const API = "/.netlify/functions/sheets";

  useEffect(() => {
    const codeUp = String(code || "").trim().toUpperCase();
    if (!codeUp) {
      setMsg("Codice non valido. Contatta SM ADV");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(codeUp)}`);
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }

        if (!res.ok || !data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        const url = String(data.item.url).trim();
        // redirect “hard”
        window.location.replace(url);
      } catch (e) {
        setMsg("Errore rete. Contatta SM ADV");
      }
    })();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 40, textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>SM ADV</h2>
      <div style={{ marginTop: 8 }}>{msg}</div>
    </div>
  );
}
