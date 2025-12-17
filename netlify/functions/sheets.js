export async function handler(event) {
    try {
      const endpoint = process.env.SHEETS_ENDPOINT; // variabile "server-side"
      if (!endpoint) {
        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, error: "Missing SHEETS_ENDPOINT env var" }),
        };
      }
  
      const method = event.httpMethod;
  
      // Pass-through GET
      if (method === "GET") {
        const qs = event.queryStringParameters || {};
        const url = new URL(endpoint);
        Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v));
  
        const res = await fetch(url.toString(), { method: "GET" });
        const text = await res.text();
  
        return {
          statusCode: res.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: text,
        };
      }
  
      // Pass-through POST
      if (method === "POST") {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: event.body || "{}",
        });
        const text = await res.text();
  
        return {
          statusCode: res.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: text,
        };
      }
  
      return { statusCode: 405, body: "Method Not Allowed" };
    } catch (e) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: String(e) }),
      };
    }
  }
  