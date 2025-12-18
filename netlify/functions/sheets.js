export async function handler(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const endpoint = process.env.SHEETS_ENDPOINT;
  if (!endpoint) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "Missing SHEETS_ENDPOINT" }),
    };
  }

  try {
    // ✅ QUERY STRING CORRETTA
    const params = event.queryStringParameters || {};
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${endpoint}?${qs}` : endpoint;

    if (event.httpMethod === "GET") {
      const res = await fetch(url);
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

    if (event.httpMethod === "POST") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.body || "{}",
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
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: String(err) }),
    };
  }
}
