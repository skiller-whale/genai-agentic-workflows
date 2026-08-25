---
name: prototype
description: Build a quick, visually impressive frontend for the current backend and serve it on port 4005.
argument-hint: [description of what to show]
version: 0.1.0
disable-model-invocation: true
---

# Prototype

Build a quick, visually impressive frontend that connects to the backend API, and serve it on port 4005.

## Steps

1. Look at the existing backend code to understand what API endpoints are available.
2. Build the frontend in `frontend/`. Keep it simple — a single `index.html` with
   inline CSS and JS is fine. Prioritise bold visuals: rich colours, smooth
   animations, large typography, and a polished layout. Don't worry about
   production quality or code structure.
3. The UI should interact with the backend API in a way that makes the API's
   purpose immediately obvious and satisfying to use.
4. Serve the frontend using Bun on `0.0.0.0:4005`. Use `Bun.serve` to serve
   `index.html` (and any other static files) from the `frontend/` directory.
   Do not export the return value of `Bun.serve`.

   The page is opened through a proxy, on a hostname that is not `localhost`, so:

   - If you import HTML files and hand them to `routes`, also set
     `development: false`. Bun's dev server otherwise refuses any request whose
     `Host` header is not the host it is serving on, and the page 403s with
     "Blocked: Host header does not match the dev server".
   - Never call `http://localhost:4000` from browser JavaScript. The browser is
     not on this machine, so that request goes nowhere and the page fails with
     "Failed to fetch". Fetch a path on the frontend's own origin, such as
     `/api/content`, and have the frontend server forward it to the backend.
5. Start the server as a background process.
6. Print the following line to the terminal once the server is running:

   ```
   Frontend running at http://localhost:4005
   ```

$ARGUMENTS
