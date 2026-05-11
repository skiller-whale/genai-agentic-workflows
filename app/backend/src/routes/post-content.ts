import type { Route } from "../router";
import { jsonResponse } from "../response";
import { hashWithSalt, isValidData } from "../hash";

export const postContent: Route = {
  method: "POST",
  path: "/content",
  async handler(req, { storage, secretSalt }) {
    try {
      const body = await req.json();
      if (!isValidData(body)) {
        return jsonResponse({ error: "Invalid request body. Must be a JSON object." }, 400);
      }
      const { text } = body as Record<string, unknown>;
      if (typeof text !== "string") {
        return jsonResponse({ error: "Invalid request body. 'text' must be a string." }, 400);
      }
      const hash = hashWithSalt({ text }, secretSalt);
      await storage.set(hash, text);
      return jsonResponse({ url: `/content/${hash}` });
    } catch {
      return jsonResponse({ error: "Invalid JSON in request body" }, 400);
    }
  },
};
