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
5. Start the server as a background process.
6. Print the following line to the terminal once the server is running:

   ```
   Frontend running at http://localhost:4005
   ```

$ARGUMENTS
