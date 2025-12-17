import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirector() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Reindirizzamento in corso…");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/.netlify/functions/sheets?action=get&code=${encodeURIComponent(code)}`);
        const data = await res.json();

        if (!data?.ok || !data?.item?.url) {
          setMsg("Codice non trovato. Contatta SM ADV.");
          return;
        }

        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete. Riprova.");
      }
    })();
  }, [code]);

  return <div style={{ padding: 24, fontFamily: "system-ui" }}>{msg}</div>;
}
