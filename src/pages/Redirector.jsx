import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Redirector() {
  const { code } = useParams();
  const [msg, setMsg] = useState("Reindirizzamento...");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/.netlify/functions/sheets?action=get&code=${encodeURIComponent(code)}`);
        const data = await res.json();

        if (!data?.ok || !data?.item?.url) {
          setMsg("QR non trovato o non configurato.");
          return;
        }

        // redirect
        window.location.replace(data.item.url);
      } catch (e) {
        setMsg("Errore di rete.");
      }
    };

    run();
  }, [code]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h2>{msg}</h2>
      <p style={{ opacity: 0.7 }}>Codice: <b>{code}</b></p>
    </div>
  );
}
