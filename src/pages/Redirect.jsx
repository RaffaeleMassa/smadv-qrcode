import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  const API = "/.netlify/functions/sheets";

  useEffect(() => {
    const c = String(code || "").trim().toUpperCase();
    if (!c) {
      setMsg("Codice mancante.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`);
        const contentType = res.headers.get("content-type") || "";
        const text = await res.text();

        if (contentType.includes("text/html") || text.startsWith("<!DOCTYPE html")) {
          setMsg("Errore server (Apps Script ha risposto HTML). Contatta SM ADV");
          return;
        }

        const data = JSON.parse(text);

        if (!data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        // redirect finale
        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete. Contatta SM ADV");
      }
    })();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 40, textAlign: "center" }}>
      <h2 style={{ marginBottom: 6 }}>SM ADV</h2>
      <div style={{ opacity: 0.8 }}>{msg}</div>
    </div>
  );
}
