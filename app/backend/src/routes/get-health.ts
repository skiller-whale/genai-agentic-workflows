import type { Route } from "../router";
import { jsonResponse } from "../response";

export const getHealth: Route = {
  method: "GET",
  path: "/health",
  async handler() {
    return jsonResponse({ status: "ok" });
  },
};
