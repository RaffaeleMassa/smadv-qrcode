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
    const endpoint = process.env.SHEETS_ENDPOINT; // SOLO server-side
    if (!endpoint) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing SHEETS_ENDPOINT env var" }),
      };
    }

    const method = event.httpMethod;

    // forward querystring (GET + POST)
    let qs = event.rawQueryString ? `?${event.rawQueryString}` : "";

    // fallback: se non c'è qs ma nel body c'è action, aggiungilo
    if (!qs && method === "POST" && event.body) {
      try {
        const parsed = JSON.parse(event.body);
        if (parsed?.action) qs = `?action=${encodeURIComponent(parsed.action)}`;
      } catch {
        // ignore
      }
    }

    const url = `${endpoint}${qs}`;

    if (method === "GET") {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, "Content-Type": res.headers.get("content-type") || "application/json" },
        body: text,
      };
    }

    if (method === "POST") {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.body || "{}",
      });

      const text = await res.text();
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, "Content-Type": res.headers.get("content-type") || "application/json" },
        body: text,
      };
    }

    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: String(err?.message || err) }),
    };
  }
}

