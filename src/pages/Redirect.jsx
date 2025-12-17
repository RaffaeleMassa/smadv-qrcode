import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "/.netlify/functions/sheets";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Reindirizzamento…");

  useEffect(() => {
    const c = String(code || "").trim().toUpperCase();
    if (!c) {
      setMsg("Codice non valido. Contatta SM ADV");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        // redirect “hard” (evita problemi SPA)
        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete. Contatta SM ADV");
      }
    })();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 30, textAlign: "center" }}>
      <h2>SM ADV</h2>
      <p>{msg}</p>
    </div>
  );
}
