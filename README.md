# SentinelIX — Frontend

**API Observability & Incident Management Platform** — a mini Sentry + Better Uptime built to
help developers detect application errors and endpoint downtime in real time, with automatic
notifications.

This is the dashboard, built with Next.js App Router. See
[`sentinelix-backend`](#) for the Go API service this connects to.

## Features

- **Issue dashboard** — browse grouped error issues per project, filter by status
  (unresolved/resolved/ignored), inspect stack traces and recent events.
- **Realtime updates** — new issues and monitor status changes stream in live over WebSocket,
  no manual refresh needed.
- **Uptime monitoring** — create and manage uptime monitors per project, with a live status chart
  per monitor.
- **Alert rules** — configure notification rules (new issue / threshold-based) per project.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Data fetching / cache | [TanStack Query](https://tanstack.com/query) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) |
| Styling | Tailwind CSS |
| Realtime | Native WebSocket client (`lib/ws-client.ts`) |
| Auth | JWT verification at the edge via [`jose`](https://github.com/panva/jose) in `middleware.ts` |

## Project Structure

```
app/
  (auth)/            # login, register
  (dashboard)/        # authenticated dashboard routes
    projects/[id]/
      issues/         # issue list & detail
      monitors/        # uptime monitors
      alert-rules/      # alert rule management
  status/[slug]/       # public status page (SSR, no auth)
components/           # shared UI + feature components
lib/
  api-client.ts        # fetch wrapper for the Go backend
  ws-client.ts          # WebSocket connection hook
hooks/                 # TanStack Query hooks (issues, monitors, realtime)
types/                  # shared TypeScript types (kept in sync with backend API)
middleware.ts           # route protection (verifies JWT via jose)
```

## Getting Started

### Prerequisites

- Node.js 20+
- [`sentinelix-backend`](#) running locally (see its README for setup)

### 1. Clone and configure environment

```bash
git clone <this-repo-url>
cd sentinelix-frontend
cp .env.example .env.local
# edit .env.local — NEXT_PUBLIC_API_URL and JWT_SECRET must match the backend's JWT_SECRET
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

The dashboard runs on [http://localhost:3000](http://localhost:3000).

> Make sure `sentinelix-backend` (`cmd/api` and `cmd/worker`) is running first — the dashboard
> depends on it for both REST calls and the WebSocket connection.

## Project Status

Actively developed as a portfolio project. Core dashboard flows complete: auth, project
management, issue list & detail with realtime updates, alert rule management, and uptime
monitoring with live charts. Public status page SEO polish in progress.

## License

MIT