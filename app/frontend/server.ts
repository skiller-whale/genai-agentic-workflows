const PORT = 4005;
const HOST = "0.0.0.0";
const FRONTEND_DIR = import.meta.dir;

const BACKEND = "http://localhost:4000";

Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);

    // Proxy API requests to the backend
    if (url.pathname.startsWith("/content") || url.pathname === "/hash" || url.pathname === "/health") {
      const backendUrl = BACKEND + url.pathname + url.search;
      return fetch(backendUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      });
    }

    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`${FRONTEND_DIR}${filePath}`);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response(Bun.file(`${FRONTEND_DIR}/index.html`));
  },
});

console.log(`Frontend running at http://localhost:4005`);
