import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  // IMPORTANTISSIMO: usa la Netlify Function
  const API = "/.netlify/functions/sheets";

  useEffect(() => {
    const c = String(code || "").trim().toUpperCase();
    if (!c) {
      setMsg("Codice mancante. Contatta SM ADV");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`, {
          method: "GET",
          headers: { "Accept": "application/json" },
        });

        const ct = res.headers.get("content-type") || "";
        const text = await res.text();

        if (ct.includes("text/html") || text.startsWith("<!DOCTYPE html")) {
          setMsg("Errore backend (Apps Script). Contatta SM ADV");
          return;
        }

        const data = JSON.parse(text);

        if (!data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV");
          return;
        }

        // redirect reale
        const target = String(data.item.url).trim();
        window.location.replace(target);
      } catch (e) {
        setMsg("Errore di rete. Contatta SM ADV");
      }
    })();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 40, textAlign: "center" }}>
      <h2 style={{ marginBottom: 10 }}>SM ADV</h2>
      <div>{msg}</div>
    </div>
  );
}
