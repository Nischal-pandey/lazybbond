# LazyBond

LazyBond helps people turn shared interests into real-world plans. This repository is a runnable foundation with a responsive marketing site and a separately run API backed by PostgreSQL.

## Local development

Requirements: Node.js 20.19+ (Node.js 22.12+ recommended), npm 10+, and Docker Desktop (or a local PostgreSQL 16 instance).

1. Copy `.env.example` to `.env`. Keep secrets out of source control.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Install packages with `npm install`.
4. Generate the Prisma client and create the local schema with `npm run migrate --workspace @lazybond/database`.
5. In one terminal run `npm run dev`; in another run `npm run dev:api`.
6. Open [http://localhost:3000](http://localhost:3000). The API health check is at [http://localhost:4000/health](http://localhost:4000/health).

The public website is in `ui/`, the API in `api/`, and the Prisma schema/client package in `packages/database/`. The web app uses `NEXT_PUBLIC_API_URL` for API calls; do not put server secrets in `NEXT_PUBLIC_*` variables.

## What works in this foundation

- Responsive marketing site, mobile navigation, accessible interactive app-preview carousel, reduced-motion handling, feature and safety sections, and FAQ.
- PostgreSQL schema for accounts, hashed sessions, plans, join requests, plan participants, plan conversations/messages, communities, memberships, privacy preferences, blocks, and reports.
- API email/password registration and login with Argon2id password hashes and opaque, hashed, HttpOnly cookie sessions.
- Authenticated profile and privacy-setting endpoints.
- Public plan/community discovery, authenticated plan/community creation and joining, creator-only join-request review, participant-authorized plan messaging, reporting, blocking, and account deletion.
- Searchable, privacy-controlled member discovery and friend requests with accept/decline/remove flows.
- Request validation, origin-restricted credentialed CORS, security headers, bounded request bodies, and endpoint rate limits.

## API outline

All application endpoints use `/v1`:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `PATCH /me`, `GET|PATCH /me/privacy`, `DELETE /account`
- `GET|POST /plans`, `POST /plans/:planId/join`
- `GET /plans/:planId/requests`, `PATCH /plans/:planId/requests/:requestId`
- `GET|POST /plans/:planId/messages` (membership is checked on every request)
- `GET|POST /communities`, `POST /communities/:communityId/join`
- `GET /communities/mine`, `GET /users/search`, `GET /friends`, `DELETE /friends/:userId`
- `GET /friend-requests`, `POST /users/:userId/friend-requests`, `PATCH /friend-requests/:requestId`
- `POST /reports`, `POST /users/:userId/block`

Public plan responses include an approximate area, not coordinates. Plan chat access is restricted to accepted participants. The API uses cursor-based retrieval for message history.

## Google Play listing

Set `NEXT_PUBLIC_PLAY_STORE_URL` only to the verified LazyBond listing URL, for example `https://play.google.com/store/apps/details?id=com.example.realpackage`. On Android, the download button opens the Google Play app through an Android intent and falls back to the listing in a browser; elsewhere it opens the listing URL directly. The current app package/listing is unknown, so the website does **not** link to a made-up listing; its download controls remain disabled and marked “Coming soon” until the verified URL is supplied. The app should not be described as published before then.

## Production readiness and security limits

This is an initial implementation, not a production-ready social network. In particular:

- Email verification, password reset, OAuth, account export, verified profile workflows, and email delivery are not implemented.
- Chat is persisted and authorization-checked over HTTP, but WebSockets, live delivery, read receipts, and push notifications are not implemented.
- Rate limiting currently uses process memory; production needs a shared Redis-backed limiter and deployment-aware proxy configuration.
- Block/report records are persisted, but there is no moderation queue, enforcement dashboard, or blocking-aware discovery filter yet.
- Location fields are intentionally not accepted by public plan creation in this foundation; geospatial search and exact meeting-location sharing need a reviewed privacy design.
- Admin role management, community moderation, file uploads, analytics, CI deployment, production monitoring, backups, and hosting configuration still need to be added.
- The site uses clearly labeled illustrative preview content, not real testimonials, users, locations, or activity metrics.

Before launch, complete these items, configure HTTPS and secure cookies, run database migrations/backups, add verification and recovery flows, test authorization and abuse cases, deploy the API behind a trusted proxy, and review the privacy policy and retention practices. A browser app's delivered HTML/CSS/JavaScript is inspectable; secrets and privileged logic must remain server-side.

## Useful commands

- `npm run typecheck`
- `npm run build`
- `npm run migrate --workspace @lazybond/database`
# lazybbond
