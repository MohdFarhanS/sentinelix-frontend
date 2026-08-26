# SentinelIX — Frontend

**API Observability & Incident Management Platform** — a mini Sentry + Better Uptime built to
help developers detect application errors and endpoint downtime in real time, with automatic
notifications.

This is the dashboard, built with Next.js App Router. See
[`sentinelix-backend`](#) for the Go API service this connects to.

## Features

- **Landing page** — a lightweight marketing page introducing the product.
- **Issue dashboard** — browse grouped error issues per project, filter by status
  (unresolved/resolved/ignored), inspect stack traces and recent events.
- **Realtime updates** — new issues and monitor status changes stream in live over WebSocket,
  no manual refresh needed.
- **Uptime monitoring** — create and manage uptime monitors per project, with a live status chart
  per monitor.
- **Alert rules** — configure notification rules (new issue / threshold-based) per project.
- **Public status page** — an ISR-rendered `/status/[slug]` page with dynamic OG image
  generation, dynamic per-project SEO metadata, backed by the backend's isolated
  `cmd/status-api` service. Degrades gracefully (dedicated error boundary, no crash) if that
  service is temporarily unreachable.
- **Seamless session handling** — access tokens refresh transparently in the background; users
  stay signed in without re-authenticating every 15 minutes — see
  [Auth Session Handling](#auth-session-handling) below.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Data fetching / cache | [TanStack Query](https://tanstack.com/query) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) |
| Styling | Tailwind CSS |
| Realtime | Native WebSocket client (`lib/ws-client.ts`) |
| Auth | JWT access + refresh token pair, fully managed by the backend; `lib/api-client.ts`
  transparently retries on `401` and refreshes the session — no client-side token verification |

## Project Structure

```
app/
  (auth)/            # login, register
  (dashboard)/        # authenticated dashboard routes
    projects/[id]/
      issues/         # issue list & detail
      monitors/        # uptime monitors
      alert-rules/      # alert rule management
  status/[slug]/       # public status page (SSR, no auth)status/[slug]/ # public status page — ISR, no auth, own error.tsx
  # and opengraph-image.tsx (dynamic OG image)
  page.tsx # landing page
  error.tsx # global error boundary fallback
  not-found.tsx # global 404
  robots.ts # robots.txt — crawling allowed everywhere; private routes are
  # kept out of search results via noindex (layout metadata), not
  # robots.txt disallow (disallow would prevent crawlers from ever
  # reading the noindex directive in the first place)
  sitemap.ts # sitemap.xml — landing page only; individual status pages are
  # intentionally NOT listed here (no public directory of every
  # customer's status page — each project's SEO visibility is
  # its owner's call, not the platform's)
components/           # shared UI + feature     components
lib/
  api-client.ts        # fetch wrapper for the Go backend
  ws-client.ts          # WebSocket connection hook
  status-api-client.ts # fetch wrapper for cmd/status-api (public status page)
hooks/                 # TanStack Query hooks (issues, monitors, realtime)
types/                  # shared TypeScript types (kept in sync with backend API)
```


## Auth Session Handling

Access tokens are short-lived (15 min) and refreshed transparently. There is **no client-side
JWT verification and no edge middleware guarding dashboard routes** — an earlier
`middleware.ts` implementation that verified token expiry independently was removed, because it
caused users to be forcibly logged out on any page reload after 15 minutes of inactivity, even
with a perfectly valid refresh token. The root cause: the browser auto-deletes the `access_token`
cookie once its `MaxAge` elapses, and `middleware.ts` had no way to see the separately-scoped
`refresh_token` cookie to know a valid session still existed.

Session validity is instead handled end-to-end by `lib/api-client.ts`: any request that comes
back `401` triggers a single deduplicated call to `/auth/refresh` (deduplicated so that several
parallel TanStack Query requests firing at once don't each try to refresh and trip the backend's
refresh-token-reuse detection), then transparently retries the original request. If the refresh
itself fails, a `sentinelix:auth-expired` event clears the query cache and redirects to `/login`.

## Getting Started

### Prerequisites

- Node.js 20+
- [`sentinelix-backend`](#) running locally (see its README for setup) — `cmd/api` for the
  dashboard, `cmd/status-api` if you want to preview `/status/[slug]` locally

### 1. Clone and configure environment

```bash
git clone <this-repo-url>
cd sentinelix-frontend
cp .env.example .env.local
# edit .env.local:
#   NEXT_PUBLIC_API_URL  — cmd/api base URL (browser-facing)
#   STATUS_API_URL        — cmd/status-api base URL (server-side only, no NEXT_PUBLIC_ prefix)
#   NEXT_PUBLIC_SITE_URL  — used by robots.ts / sitemap.ts
```

> Note: this app does **not** need `JWT_SECRET` — token verification happens exclusively on the
> backend now (see [Auth Session Handling](#auth-session-handling) above).

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

The dashboard runs on [http://localhost:3000](http://localhost:3000).

> Make sure `sentinelix-backend`'s `cmd/api` and `cmd/worker` are running first — the dashboard
> depends on them for both REST calls and the WebSocket connection. `cmd/status-api` is only
> needed if you're working on `/status/[slug]`.

## Project Status

Actively developed as a portfolio project. Core dashboard flows complete: auth (with transparent
session refresh), project management, issue list & detail with realtime updates, alert rule
management, uptime monitoring with live charts, a public status page with dynamic OG images and
graceful degradation, and a security/SEO hardening pass (open-redirect fix, `noindex` on private
routes, sitemap). Deployment (Vercel + backend on Render) pending — all sprints are being
finished before a single simultaneous deploy.

## License

MIT