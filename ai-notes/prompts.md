# AI Prompts Log

Chronological log of prompts submitted to Claude Code during this project.

---

## 1. Architecture Planning

**Prompt:** Given a referral app plan with a 6-hour constraint, suggest a minimal folder structure, the simplest data layer implementation, and a recommendation on whether to use Prisma + SQLite or a simpler alternative.

**Outcome:** Claude recommended Prisma + SQLite for type safety and schema-as-documentation, outlined the `app/api/`, `lib/`, and `prisma/` folder structure, and proposed the `User` model with `id`, `email`, `referralCode`, `referredBy`, and `invitesSent`.

---

## 2. Conversion Rate Definition

**Prompt:** To avoid a 100% conversion rate by default, define `invitesSent` as the number of times a user copies their referral link, and `conversions` as the number of users who signed up using that link. Add `invitesSent` to the User model and increment it on link copy. No click tracking.

**Outcome:** `invitesSent Int @default(0)` added to schema. `getMetrics` updated to compute `conversions / invitesSent` as the rate, returning `0` when no invites have been sent yet.

---

## 3. AI Notes Documentation Scope

**Prompt:** Document prompts, plans, skills, and technical decisions under `/ai-notes` so the material can be shared as part of the assignment submission.

**Outcome:** This documentation scope (`docs/ai-notes`) was added as the fifth implementation step, to be completed after the core feature work.

---

## 4. Git Workflow

**Prompt:** For every implementation scope, create a branch from master, stage relevant files, commit using Conventional Commits, and merge to master after manual review before starting the next scope.

**Outcome:** Six scopes defined with branch names (`feat/data-layer`, `feat/auth`, `feat/dashboard`, `test/referral-metrics`, `docs/ai-notes`, `docs/readme`). Each scope committed independently and merged after approval.

---

## 5. Scope 3 UX Improvements

**Prompt:** The copy button should be disabled for a few seconds after copying to prevent duplicate invite counts. The referral link is showing only the query param without a domain. Add a sign out button.

**Outcome:** `CopyLinkButton` now sets `disabled` during the 2s feedback window. The base URL is derived from `headers()` at request time — no environment variable required. `SignOutButton` calls `POST /api/auth/logout` and redirects to `/`.

---

## 6. Button Cursor Styles

**Prompt:** Buttons should use `cursor-pointer` by default and `cursor-not-allowed` when disabled.

**Outcome:** Added `cursor-pointer` to all interactive buttons and `disabled:cursor-not-allowed` to those that support a disabled state.

---

## 7. Avoid Nested Ternaries

**Prompt:** Nested ternaries should be avoided as they are hard to read and maintain.

**Outcome:** Extracted a `getSubtitle(mode, ref)` helper function in `app/page.tsx` to replace conditional inline expressions, improving readability.

---

## 8. Environment Variables and Setup Clarity

**Prompt:** Add a `.env.example` file to make it clear what environment variables need to be set when setting up the project.

**Outcome:** `.env.example` created at the project root with the `DATABASE_URL` variable and an explanatory comment. Referenced in the README setup instructions.

---

## 9. Test Coverage Script

**Prompt:** Add a script for running test coverage.

**Outcome:** Added `"test:coverage": "jest --coverage"` to `package.json`. Running it reports 100% statement, branch, function, and line coverage on `lib/referral.ts`.

---

## 10. Post-Implementation Review and Improvements

**Prompt:** Review the project for UX, marketing, and test gaps. Specific observations: display who referred the user, fix the conversion rate format, update the invite count instantly after copying the link, and identify anything else worth improving.

**Outcome:** Six improvements identified and implemented in a single `feat/improvements` scope:
1. Referrer email displayed on the dashboard, sourced from `getSession()` with no extra page-level query
2. Conversion rate uses `toFixed(1)` and shows "—" when no invites have been sent (avoids misleading "0%")
3. `CopyLinkButton` calls `router.refresh()` after POST for an instant invite count update
4. Landing page (`/`) redirects authenticated users to `/dashboard` via a server component
5. `dotenv` added as a dependency (was imported in `prisma.config.ts` but missing from `package.json`)
6. `postinstall` script added to run `prisma generate` automatically after `npm install`

Additionally, 5 signup route tests were added covering: missing email, duplicate email, valid referrer resolution, invalid referrer handling, and email normalization.

---

## 11. Referrer Email — Avoid Extra Page-Level Query

**Prompt:** Why not get the referrer info in `getSession()` and remove the need for an additional call at the page level?

**Outcome:** `getSession()` updated to look up the referrer's email alongside the session user and return it as `referrerEmail`. The dashboard accesses `user.referrerEmail` directly with no additional database call.
