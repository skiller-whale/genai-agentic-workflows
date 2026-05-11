import type { Route } from "../router";
import { jsonResponse } from "../response";

export const getContent: Route = {
  method: "GET",
  path: /^\/content\/([a-f0-9]{64})$/,
  async handler(_req, { storage }, match) {
    const text = await storage.get(match![1]);
    if (text === undefined) {
      return jsonResponse({ error: "Not found" }, 404);
    }
    return new Response(text, { status: 200, headers: { "Content-Type": "text/plain" } });
  },
};
