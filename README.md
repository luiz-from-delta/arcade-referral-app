# Arcade Referral App

A web application that allows users to sign up, share a referral link, and track how many of their invites converted into new signups.

## Features

- **Sign up / Sign in** — email-only authentication, no password required
- **Referral links** — each user gets a unique link (`/?ref=<code>`)
- **Conversion tracking** — dashboard showing invites sent, conversions, and conversion rate
- **Copy link button** — increments invite count on each click to track sharing intent

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Components, Route Handlers
- [TypeScript](https://www.typescriptlang.org)
- [Prisma 7](https://www.prisma.io) + SQLite (via libsql driver adapter)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Jest](https://jestjs.io) + [ts-jest](https://kulshekhar.github.io/ts-jest)

## Prerequisites

- Node.js **v22+** (required by Prisma 7 and Next.js 16)
- npm

> Use [nvm](https://github.com/nvm-sh/nvm) to switch versions: `nvm use` (the project includes an `.nvmrc`).

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/luiz-from-delta/arcade-referral-app.git
cd arcade-referral-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Run database migrations (Prisma client is generated automatically via postinstall)
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
app/
  page.tsx                    # Landing / auth form (captures ?ref=)
  dashboard/
    page.tsx                  # Dashboard — metrics and referral link
    CopyLinkButton.tsx        # Copies link and increments invitesSent
    SignOutButton.tsx          # Clears session and redirects to landing
  api/
    auth/
      signup/route.ts         # POST — create user, set session cookie
      login/route.ts          # POST — email lookup, set session cookie
      logout/route.ts         # POST — clear session cookie
    users/
      me/invite/route.ts      # POST — increment invitesSent
lib/
  db.ts                       # Prisma singleton
  referral.ts                 # generateReferralCode + getMetrics
  session.ts                  # getSession() helper
prisma/
  schema.prisma               # User model
ai-notes/                     # AI-assisted development notes
```

## Architecture Decisions

See [ai-notes/decisions.md](ai-notes/decisions.md) for a full breakdown. Key choices:

- **Prisma + SQLite** over raw SQL — type safety and schema-as-documentation with minimal overhead for a single table
- **Email + httpOnly cookie** over NextAuth/JWT — no additional libraries, works with Next.js server components
- **`invitesSent` counter on User** over a separate invite table — avoids join complexity; button click is a reliable enough signal for a prototype
- **Metrics computed on demand** — a single `COUNT` query is instant at this scale

## Deploying to Vercel (with Turso)

1. Create a free database at [turso.tech](https://turso.tech)
2. Set these environment variables in Vercel → Settings → Environment Variables:
   - `DATABASE_URL` → `libsql://<database>.<org>.turso.io`
   - `DATABASE_AUTH_TOKEN` → your token from the Turso dashboard
3. Install the Turso CLI if you don't have it:
   ```bash
   # macOS (Homebrew)
   brew install tursodatabase/tap/turso

   # macOS / Linux (without Homebrew)
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
4. Apply the schema to Turso once:
   ```bash
   turso auth login
   turso db shell <database-name> < prisma/migrations/20260420222919_init/migration.sql
   ```
5. Deploy — Prisma client is generated automatically during build via `postinstall`

> **Note:** Prisma 7's migration engine does not support the `libsql://` scheme, so `prisma migrate deploy` cannot be used in the build step. Schema changes must be applied to Turso manually using the Turso CLI or dashboard.

---

## Trade-offs

- No real authentication — email-only flow is intentionally simplified to focus on referral logic
- SQLite is not suitable for multi-instance deployments; a hosted database (Neon, Turso, PlanetScale) would be required for production
- No rate limiting on the invite endpoint — `invitesSent` could be inflated by automated requests

## Future Improvements

See [ai-notes/future-improvements.md](ai-notes/future-improvements.md) for a detailed list. Highlights:

- Analytics integration (Mixpanel / PostHog) for funnel visualisation and cohort analysis
- Real authentication via magic link or OAuth
- Email-based invite sending
- Personalized referral landing page to improve conversion on the receiving end

## AI Usage

This project was built with [Claude Code](https://claude.ai/code) as the primary AI assistant. All prompts, decisions, and notes are documented in the [`ai-notes/`](ai-notes/) directory as required by the assignment guidelines.
