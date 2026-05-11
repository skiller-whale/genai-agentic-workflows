import type { Storage } from "./storage";
import { jsonResponse } from "./response";

export interface AppContext {
  storage: Storage;
  secretSalt: string;
}

export interface Route {
  method: string;
  path: string | RegExp;
  handler: (req: Request, context: AppContext, match: RegExpMatchArray | null) => Promise<Response>;
}

export function router(routes: Route[], context: AppContext) {
  return async (req: Request): Promise<Response> => {
    const { pathname } = new URL(req.url);
    for (const route of routes) {
      if (req.method !== route.method) continue;
      if (typeof route.path === "string") {
        if (pathname === route.path) return route.handler(req, context, null);
      } else {
        const match = route.path.exec(pathname);
        if (match) return route.handler(req, context, match);
      }
    }
    return jsonResponse({ error: "Not found" }, 404);
  };
}
