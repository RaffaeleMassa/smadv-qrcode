import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Caricamento…");

  // endpoint interno Netlify (no CORS)
  const API = "/.netlify/functions/sheets";

  useEffect(() => {
    const run = async () => {
      const cleanCode = String(code || "").trim().toUpperCase();
      if (!cleanCode) {
        setMsg("Codice non valido. Contatta SM ADV");
        return;
      }

      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(cleanCode)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const text = await res.text();

        // se Google Apps Script ha risposto HTML -> errore
        if ((res.headers.get("content-type") || "").includes("text/html") || text.trim().startsWith("<!DOCTYPE")) {
          setMsg("Errore lettura codice. Contatta SM ADV");
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
    };

    run();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h2 style={{ margin: 0 }}>SM ADV</h2>
      <p style={{ opacity: 0.8 }}>{msg}</p>
    </div>
  );
}
