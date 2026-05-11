# Frontend

Hacker-style text sharing UI. Paste text, get a permalink. Served on port 4005, proxies API requests to the backend on port 4000.

## Prerequisites

- [Bun](https://bun.sh)
- Backend server running (see `../backend/README.md`)

## Running

```bash
cd frontend
bun run start
```

Or with hot reload:

```bash
bun run dev
```

Open [http://localhost:4005](http://localhost:4005).

## Usage

- **Submit**: type or paste text, click `[ TRANSMIT ]` (or Ctrl+Enter) — a permalink is generated
- **View**: visit `http://localhost:4005/#<hash>` to retrieve any saved paste
