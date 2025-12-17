import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function safeUpper(v) {
  return (v || "").trim().toUpperCase();
}

async function readJsonOrText(res) {
  const text = await res.text();
  let json = null;

  try {
    json = JSON.parse(text);
  } catch (_) {
    // non è JSON, va bene: torniamo text per debug
  }

  return { text, json };
}

export default function Admin() {
  const canvasRef = useRef(null);

  const [code, setCode] = useState(() => randomCode(6));
  const [targetUrl, setTargetUrl] = useState("https://www.smadv.it/");
  const [client, setClient] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const baseUrl = useMemo(() => window.location.origin, []);
  const qrUrl = `${baseUrl}/r/${safeUpper(code)}`;

  // Endpoint Netlify Function
  const API = "/.netlify/functions/sheets";

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `qrcode-${safeUpper(code)}.png`;
    a.click();
  }

  async function saveToSheets() {
    const CODE = safeUpper(code);
    const URL = (targetUrl || "").trim();

    if (!CODE || !URL) {
      setStatus("⚠️ Inserisci Code e URL.");
      return;
    }

    setStatus("Salvataggio in corso…");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          action: "upsert",
          code: CODE,
          url: URL,
          client: (client || "").trim(),
          note: (note || "").trim(),
        }),
      });

      const { json, text } = await readJsonOrText(res);

      // Se non è ok HTTP, mostra status + body (per capire subito l’errore)
      if (!res.ok) {
        setStatus(`❌ Errore salvataggio: HTTP ${res.status} – ${text?.slice(0, 200) || "no body"}`);
        return;
      }

      // Se è ok HTTP ma non è JSON ok:true, mostra il body (spesso è HTML/redirect)
      if (!json?.ok) {
        setStatus(`❌ Errore salvataggio: risposta non valida – ${text?.slice(0, 200) || "empty"}`);
        return;
      }

      setStatus(`✅ Salvato: ${CODE} → ${URL}`);
    } catch (e) {
      setStatus(`❌ Errore rete: ${String(e)}`);
    }
  }

  async function loadFromSheets() {
    const CODE = safeUpper(code);

    if (!CODE) {
      setStatus("⚠️ Inserisci un codice.");
      return;
    }

    setStatus("Caricamento…");

    try {
      const qs = `?action=get&code=${encodeURIComponent(CODE)}`;
      const res = await fetch(`${API}${qs}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store",
      });

      const { json, text } = await readJsonOrText(res);

      if (!res.ok) {
        setStatus(`❌ Errore load: HTTP ${res.status} – ${text?.slice(0, 200) || "no body"}`);
        return;
      }

      if (!json?.ok) {
        setStatus(`❌ Non trovato o errore: ${json?.error || text?.slice(0, 200) || "unknown"}`);
        return;
      }

      setTargetUrl(json.item?.url || "");
      setClient(json.item?.client || "");
      setNote(json.item?.note || "");
      setStatus(`✅ Caricato da Sheets: ${CODE}`);
    } catch (e) {
      setStatus(`❌ Errore rete: ${String(e)}`);
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>QR Admin (SM ADV)</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        Il QR punta a <b>{qrUrl}</b> e il redirect lo gestisci da Google Sheets.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Codice</span>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <button
              onClick={() => setCode(randomCode(6))}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
            >
              Rigenera
            </button>
            <button
              onClick={loadFromSheets}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
            >
              Carica da Sheets
            </button>
          </div>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>URL di destinazione</span>
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://..."
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Cliente (opzionale)</span>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Es. Rugotti"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Note (opzionale)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Es. Etichetta barattolo 190g"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 18,
            alignItems: "center",
            padding: 14,
            border: "1px solid #eee",
            borderRadius: 14,
          }}
        >
          <div ref={canvasRef} style={{ display: "grid", justifyItems: "center", gap: 10 }}>
            <QRCodeCanvas value={qrUrl} size={240} includeMargin level="M" />
            <div style={{ fontWeight: 800, letterSpacing: 1 }}>{safeUpper(code)}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={downloadPng}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
              >
                Scarica PNG
              </button>
              <button
                onClick={saveToSheets}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
              >
                Salva su Sheets
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div><b>QR URL:</b> {qrUrl}</div>
            <div><b>Destinazione:</b> {targetUrl}</div>
            {status && (
              <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>
                {status}
              </div>
            )}
            <div style={{ opacity: 0.75 }}>
              Flusso: generi codice → salvi su Sheets → scarichi PNG → stampi etichetta.
              Se un domani cambi URL, ricarichi da Sheets, modifichi e risalvi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

