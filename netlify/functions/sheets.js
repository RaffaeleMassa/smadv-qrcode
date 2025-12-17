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
    const qs = event.rawQueryString ? `?${event.rawQueryString}` : "";
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
      const body =
        event.isBase64Encoded && event.body
          ? Buffer.from(event.body, "base64").toString("utf8")
          : (event.body || "{}");

      const res = await fetch(url, { // ✅ qui: url (con qs) e non endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
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
