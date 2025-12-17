// ✅ endpoint interno Netlify
const API = "/.netlify/functions/sheets";

async function saveToSheets() {
  if (!code.trim() || !targetUrl.trim()) {
    setStatus("⚠️ Inserisci Code e URL.");
    return;
  }

  setStatus("Salvataggio in corso…");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        action: "upsert",
        code: code.trim().toUpperCase(),
        url: targetUrl.trim(),
        client,
        note,
      }),
    });

    const text = await res.text();

    // se arriva HTML -> errore upstream (GAS / permessi / sheet name)
    if ((res.headers.get("content-type") || "").includes("text/html") || text.trim().startsWith("<!DOCTYPE")) {
      setStatus("❌ Errore salvataggio: risposta HTML da Google Apps Script (controlla foglio/permessi).");
      return;
    }

    const data = JSON.parse(text);

    if (!res.ok || !data?.ok) {
      setStatus(`❌ Errore salvataggio: ${data?.error || "response non valida"}`);
      return;
    }

    setStatus(`✅ Salvato: ${code.trim().toUpperCase()} → ${targetUrl}`);
  } catch (e) {
    setStatus(`❌ Errore rete: ${String(e)}`);
  }
}

async function loadFromSheets() {
  if (!code.trim()) {
    setStatus("⚠️ Inserisci un codice.");
    return;
  }

  setStatus("Caricamento…");

  try {
    const c = code.trim().toUpperCase();
    const res = await fetch(`${API}?action=get&code=${encodeURIComponent(c)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const text = await res.text();

    if ((res.headers.get("content-type") || "").includes("text/html") || text.trim().startsWith("<!DOCTYPE")) {
      setStatus("❌ Errore caricamento: risposta HTML da Google Apps Script (controlla foglio/permessi).");
      return;
    }

    const data = JSON.parse(text);

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
