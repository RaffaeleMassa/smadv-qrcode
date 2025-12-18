import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Redirect() {
  const { code } = useParams();

  useEffect(() => {
    const c = String(code || "").trim().toUpperCase();
    if (!c) return;

    const API = "/.netlify/functions/sheets";

    (async () => {
      try {
        const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`);
        const data = await res.json();

        if (data?.ok && data?.item?.url) {
          // redirect immediato, niente pagina visibile
          window.location.replace(data.item.url);
        } else {
          // fallback minimale SOLO se errore reale
          document.body.innerHTML = "Codice non trovato. Contatta SM ADV";
        }
      } catch {
        document.body.innerHTML = "Errore di rete. Contatta SM ADV";
      }
    })();
  }, [code]);

  // 🔥 NON renderizza nulla
  return null;
}

