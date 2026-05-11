import { hashWithSalt, isValidData } from "./hash";

const SECRET_SALT = process.env.SECRET_SALT || "default-secret-salt";
const contentStore = new Map<string, string>();
const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const JSON_HEADERS = { "Content-Type": "application/json" };
const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check endpoint
    if (url.pathname === "/health" && req.method === "GET") {
      return jsonResponse({ status: "ok" });
    }

    // Hash endpoint
    if (url.pathname === "/hash" && req.method === "POST") {
      try {
        const body = await req.json();
        if (!isValidData(body)) {
          return jsonResponse({ error: "Invalid request body. Must be a JSON object." }, 400);
        }
        return jsonResponse({ hash: hashWithSalt(body, SECRET_SALT) });
      } catch {
        return jsonResponse({ error: "Invalid JSON in request body" }, 400);
      }
    }

    // Content store endpoint
    if (url.pathname === "/content" && req.method === "POST") {
      try {
        const body = await req.json();
        if (!isValidData(body)) {
          return jsonResponse({ error: "Invalid request body. Must be a JSON object." }, 400);
        }
        const { text } = body as Record<string, unknown>;
        if (typeof text !== "string") {
          return jsonResponse({ error: "Invalid request body. 'text' must be a string." }, 400);
        }
        const hash = hashWithSalt({ text }, SECRET_SALT);
        contentStore.set(hash, text);
        return jsonResponse({ url: `/content/${hash}` });
      } catch {
        return jsonResponse({ error: "Invalid JSON in request body" }, 400);
      }
    }

    // Content retrieval endpoint
    const contentMatch = url.pathname.match(/^\/content\/([a-f0-9]{64})$/);
    if (contentMatch && req.method === "GET") {
      const text = contentStore.get(contentMatch[1]);
      if (text === undefined) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      return new Response(text, { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 404 for unknown routes
    return jsonResponse({ error: "Not found" }, 404);
  },
});

console.log(`Server running at http://${HOST}:${PORT}`);
