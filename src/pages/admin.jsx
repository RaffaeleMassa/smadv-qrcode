import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function Admin() {
  const canvasRef = useRef(null);

  const [code, setCode] = useState(() => randomCode(6));
  const [targetUrl, setTargetUrl] = useState("https://www.smadv.it/");
  const [client, setClient] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const API = "/.netlify/functions/sheets";

  const baseUrl = useMemo(() => window.location.origin, []);
  const cleanCode = useMemo(() => String(code || "").toUpperCase().trim(), [code]);
  const qrUrl = useMemo(() => `${baseUrl}/r/${cleanCode}`, [baseUrl, cleanCode]);

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `qrcode-${cleanCode || "code"}.png`;
    a.click();
  }

  async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();

    // Se arriva HTML (errore Apps Script), lo segnaliamo bene
    if (!ct.includes("application/json")) {
      return { __notJson: true, text, contentType: ct };
    }

    try {
      return JSON.parse(text);
    } catch {
      return { __notJson: true, text, contentType: ct };
    }
  }

  async function saveToSheets() {
    const c = cleanCode;
    const url = String(targetUrl || "").trim();

    if (!c || !url) {
      setStatus("⚠️ Inserisci Codice e URL.");
      return;
    }

    setStatus("Salvataggio in corso…");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          code: c,
          url,
          client: String(client || "").trim(),
          note: String(note || "").trim(),
        }),
      });

      const data = await safeJson(res);

      if (data?.__notJson) {
        setStatus("❌ Errore salvataggio: risposta non JSON (Apps Script ha risposto HTML). Controlla permessi / sheet.");
        return;
      }

      if (!res.ok || !data?.ok) {
        setStatus(`❌ Errore salvataggio: ${data?.error || "response non valida"}`);
        return;
      }

      setStatus(`✅ Salvato: ${c} → ${url}`);
    } catch (e) {
      setStatus(`❌ Errore rete: ${String(e)}`);
    }
  }

  async function loadFromSheets() {
    const c = cleanCode;
    if (!c) {
      setStatus("⚠️ Inserisci un codice.");
      return;
    }

    setStatus("Caricamento…");

    try {
      const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`, { method: "GET" });
      const data = await safeJson(res);

      if (data?.__notJson) {
        setStatus("❌ Errore: risposta non JSON (Apps Script HTML). Controlla endpoint/permessi.");
        return;
      }

      if (!data?.ok) {
        setStatus(`❌ Non trovato o errore: ${data?.error || "unknown"}`);
        return;
      }

      setTargetUrl(data.item?.url || "");
      setClient(data.item?.client || "");
      setNote(data.item?.note || "");
      setStatus(`✅ Caricato da Sheets: ${c}`);
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
          <span>Codice (puoi anche sceglierlo tu)</span>
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
            <span>Cliente (facoltativo)</span>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Es. Rugotti"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Nota (facoltativa)</span>
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
            <div style={{ fontWeight: 800, letterSpacing: 1 }}>{cleanCode}</div>

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
            <div><b>URL QR:</b> <a href={qrUrl} target="_blank" rel="noreferrer">{qrUrl}</a></div>
            <div><b>Destinazione:</b> {targetUrl}</div>

            {status && (
              <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>
                {status}
              </div>
            )}

            <div style={{ opacity: 0.75 }}>
              Flusso: scegli/costruisci codice → salvi su Fogli → scarichi PNG → stampi etichetta.
              Se un domani cambi URL, modifichi su Sheets e il QR resta lo stesso.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
