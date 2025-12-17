export async function handler(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  try {
    const endpoint = process.env.SHEETS_ENDPOINT; // solo server-side
    if (!endpoint) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing SHEETS_ENDPOINT env var" }),
      };
    }

    const method = event.httpMethod;

    // Forward querystring per GET
    const qs = event.rawQueryString ? `?${event.rawQueryString}` : "";
    const url = `${endpoint}${qs}`;

    // GET pass-through
    if (method === "GET") {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();

      return {
        statusCode: res.status,
        headers: {
          ...corsHeaders,
          "Content-Type": res.headers.get("content-type") || "application/json",
        },
        body: text,
      };
    }

    // POST pass-through (salvataggio)
    if (method === "POST") {
      // ✅ Netlify può passare body in base64
      let rawBody = event.body || "{}";
      if (event.isBase64Encoded) {
        rawBody = Buffer.from(rawBody, "base64").toString("utf8");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: rawBody,
      });

      const text = await res.text();

      return {
        statusCode: res.status,
        headers: {
          ...corsHeaders,
          "Content-Type": res.headers.get("content-type") || "application/json",
        },
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


