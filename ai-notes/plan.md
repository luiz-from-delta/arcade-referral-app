# Implementation Plan

Summary of the AI-assisted implementation plan for the Arcade Referral App.

---

## Approach

The project was scoped to six sequential implementation branches, each merged to `master` after manual review. This kept each unit of work reviewable and isolated, and maintained a clean git history throughout.

| Branch | Scope |
|---|---|
| `feat/data-layer` | Prisma 7 setup, User schema, db singleton, referral utilities |
| `feat/auth` | Signup and login API routes, httpOnly cookie session |
| `feat/dashboard` | Landing page, dashboard, copy link button, sign out, invite endpoint |
| `test/referral-metrics` | Jest setup, unit tests for referral logic and metrics |
| `docs/ai-notes` | This documentation |
| `docs/readme` | README with setup instructions and project overview |

---

## Architecture

```
app/
  page.tsx                      # Landing / auth form (captures ?ref=)
  dashboard/
    page.tsx                    # Server component — metrics + referral link
    CopyLinkButton.tsx          # Client component — copies link, increments invitesSent
    SignOutButton.tsx            # Client component — clears session, redirects
  api/
    auth/
      signup/route.ts           # POST — create user, set userId cookie
      login/route.ts            # POST — email lookup, set userId cookie
      logout/route.ts           # POST — delete userId cookie
    users/
      me/invite/route.ts        # POST — increment invitesSent
lib/
  db.ts                         # Prisma singleton with libsql adapter
  referral.ts                   # generateReferralCode + getMetrics
  session.ts                    # getSession() — reads userId cookie
prisma/
  schema.prisma                 # User model
  migrations/                   # Migration history
```

---

## Data Model

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  referralCode String   @unique
  referredBy   String?            // referralCode of the referrer, null if organic
  invitesSent  Int      @default(0)
  createdAt    DateTime @default(now())
}
```

---

## Metrics Formula

```
conversionRate = conversions / invitesSent
```

- `invitesSent` — incremented each time the user clicks "Copy referral link"
- `conversions` — count of users whose `referredBy` matches this user's `referralCode`
- Returns `0` when `invitesSent = 0` to avoid division by zero

---

## Claude Code Configuration

This project used [Claude Code](https://claude.ai/code) as the AI assistant throughout development. Two configuration files guided its behavior:

- **`CLAUDE.md`** — entry point for Claude Code project instructions, references `AGENTS.md`
- **`AGENTS.md`** — instructs the assistant to read the relevant Next.js documentation under `node_modules/next/dist/docs/` before writing any code, and to heed deprecation notices

This was especially important given that Next.js 16 introduced breaking API changes (e.g. `cookies()` is now async, the Prisma 7 adapter model) that differ significantly from training data.

---

## Key Constraints Respected

- **6-hour budget** — single table, no external services, no complex auth
- **No click tracking** — `invitesSent` is tied to explicit user intent (button click)
- **No environment variables** — base URL derived from `headers()` at runtime
- **No nested ternaries** — conditional UI logic extracted to named helper functions
