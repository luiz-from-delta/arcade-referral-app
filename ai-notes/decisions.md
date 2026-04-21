# Technical Decisions

Key architectural decisions made during this project, including the rationale and rejected alternatives.

---

## Data Layer: Prisma + SQLite over raw SQL or JSON

| Option | Setup time | Type safety | Query ergonomics |
|---|---|---|---|
| Prisma + SQLite | ~15 min | ✅ Full | ✅ Great |
| `better-sqlite3` raw SQL | ~5 min | ❌ Manual | ❌ Verbose |
| JSON file on disk | ~2 min | ❌ None | ❌ Brittle |

**Decision:** Prisma + SQLite. With a single table and a tight time budget, the overhead is negligible. The schema doubles as documentation, migrations are a single command, and the generated client provides full type safety.

---

## Invite Tracking: Counter on User vs. Separate Table

**Decision:** `invitesSent Int @default(0)` on the `User` model, incremented when the user clicks "Copy referral link."

**Rejected:** A separate `Invite` table (one row per copy event) and client-side pixel tracking.

**Why:** The join complexity and additional migration overhead were not justified for this scope. Tying the increment to a deliberate user action (clicking "Copy") is a reliable enough signal for a prototype, and it keeps the data model at a single table.

**Open question logged:** Should "invited" mean link copies or link clicks? Chose link copies — simpler, no server-side click endpoint needed.

---

## Authentication: Email + httpOnly Cookie vs. NextAuth / JWT

**Decision:** Email-only sign-in with an `httpOnly`, `sameSite=strict` session cookie set directly in the route handler.

**Rejected:** NextAuth, JWT tokens, passwordless magic links.

**Why:** The assignment focuses on referral logic, not authentication robustness. A direct `Set-Cookie` response requires no additional libraries and works across server components and route handlers via `cookies()` from `next/headers`.

---

## Referral Codes: nanoid vs. UUID vs. Numeric ID

**Decision:** `nanoid(8)` — 8-character URL-safe random string.

**Rejected:** UUID (too long for a shareable link), sequential numeric IDs (enumerable, not safe for public URLs).

**Why:** Short, URL-safe, and cryptographically random. Fits naturally in a query param (`?ref=abc12345`).

---

## Metrics: Computed on Demand vs. Materialized

**Decision:** `getMetrics` runs two queries on every dashboard load — `findUniqueOrThrow` for the user and `count` for conversions.

**Rejected:** A pre-aggregated metrics table or background job.

**Why:** At prototype scale with a single SQLite instance, a `COUNT` query is effectively instant. Introducing a materialized view or cache would add complexity without any measurable benefit.

---

## Base URL: `headers()` vs. Environment Variable

**Decision:** The referral URL is constructed from the `host` header at request time.

**Rejected:** A `NEXT_PUBLIC_BASE_URL` environment variable.

**Why:** Deriving the URL from `headers()` works correctly in development, staging, and production without any configuration. An environment variable introduces a deployment step that is easy to forget.

---

## Node.js Version: Pinned to v22 via `.nvmrc`

**Decision:** `.nvmrc` set to `22`.

**Why:** Prisma 7 and `@prisma/client` require Node.js ≥ 20.19. The project was initially running on Node 18.16, which caused install failures. Pinning to 22 ensures consistent behavior across environments.

---

## Referrer Email: Fetched in `getSession()`, Not at the Page Level

**Decision:** `getSession()` in `lib/session.ts` looks up the referrer's email in the same function call and returns it as `referrerEmail` alongside the user object.

**Rejected:** Fetching the referrer with a separate `db.user.findUnique` call directly in the dashboard server component.

**Why:** Centralising the lookup in `getSession()` keeps the page component clean, avoids duplicating the lookup logic if other pages ever need it, and makes the data dependency explicit at the session boundary rather than scattered across consumers.

---

## Instant Invite Count: `router.refresh()` vs. Optimistic UI

**Decision:** After `POST /api/users/me/invite` resolves, `CopyLinkButton` calls `router.refresh()` to re-render the dashboard server component with fresh data from the database.

**Rejected:** Maintaining a local React state counter as an optimistic update.

**Why:** `router.refresh()` is the idiomatic App Router approach — it re-fetches server component data without a full page reload and keeps the client free of derived state. The POST round-trip is fast enough that the delay is imperceptible.

---

## Authenticated Redirect: Server Component Wrapper

**Decision:** `app/page.tsx` is a server component that calls `getSession()` and redirects to `/dashboard` if a session exists, rendering `<AuthForm />` otherwise. The form logic lives in `app/AuthForm.tsx` as a client component.

**Rejected:** Handling the redirect inside the client component with `useEffect`.

**Why:** A server-side redirect via `redirect()` is instant and prevents any flash of the auth form for logged-in users. A `useEffect` approach would briefly render the form before redirecting, which is poor UX.
