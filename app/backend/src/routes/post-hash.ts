import type { Route } from "../router";
import { jsonResponse } from "../response";
import { hashWithSalt, isValidData } from "../hash";

export const postHash: Route = {
  method: "POST",
  path: "/hash",
  async handler(req, { secretSalt }) {
    try {
      const body = await req.json();
      if (!isValidData(body)) {
        return jsonResponse({ error: "Invalid request body. Must be a JSON object." }, 400);
      }
      return jsonResponse({ hash: hashWithSalt(body, secretSalt) });
    } catch {
      return jsonResponse({ error: "Invalid JSON in request body" }, 400);
    }
  },
};
