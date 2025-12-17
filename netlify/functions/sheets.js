export async function handler(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  try {
    const endpoint = process.env.SHEETS_ENDPOINT;
    if (!endpoint) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing SHEETS_ENDPOINT env var" }),
      };
    }

    const method = event.httpMethod;

    // querystring forward (GET)
    const qs = event.rawQueryString ? `?${event.rawQueryString}` : "";
    const forwardUrl = `${endpoint}${qs}`;

    const upstreamRes =
      method === "GET"
        ? await fetch(forwardUrl, { method: "GET" })
        : method === "POST"
          ? await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: event.body || "{}",
            })
          : null;

    if (!upstreamRes) {
      return {
        statusCode: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Method not allowed" }),
      };
    }

    const contentType = upstreamRes.headers.get("content-type") || "";
    const text = await upstreamRes.text();

    // Se Apps Script torna HTML (error page), lo trasformo in JSON “pulito”
    if (contentType.includes("text/html") || text.trim().startsWith("<!DOCTYPE html")) {
      return {
        statusCode: upstreamRes.status || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error:
            "Upstream (Google Apps Script) ha risposto HTML (probabile errore nel foglio o permessi). " +
            "Controlla il tab 'QR' o il nome del foglio in Apps Script.",
          upstreamStatus: upstreamRes.status,
          upstreamPreview: text.slice(0, 300),
        }),
      };
    }

    // Pass-through normale
    return {
      statusCode: upstreamRes.status,
      headers: { ...corsHeaders, "Content-Type": contentType || "application/json" },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: String(err?.message || err) }),
    };
  }
}
