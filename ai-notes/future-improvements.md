# Future Improvements

Product and engineering improvements that were intentionally deferred given the 6-hour constraint.

---

## Analytics Integration

The current implementation tracks `invitesSent` and `conversions` as simple database counters. A natural next step would be to integrate an event-streaming platform such as Mixpanel or PostHog.

This would unlock:
- Funnel visualizations (invite → visit → signup)
- Cohort breakdowns by referrer
- Time-series conversion trends
- Shareable dashboards accessible to non-technical teammates without requiring database access

The `referredBy` field is already stored and would serve as the attribution key for all of these analyses.

---

## Real Authentication

The current email-only flow is intentionally simplified. A production system would require:
- **Magic link or OTP via email** — removes the need for passwords while maintaining security
- **OAuth providers** (Google, GitHub) — faster onboarding, trusted identity
- **Session expiry and refresh** — the current cookie has a 30-day `maxAge` with no invalidation mechanism

Auth.js (formerly NextAuth) would be a natural fit given the Next.js App Router setup.

---

## Email-Based Invites

Currently, users copy their referral link manually. Allowing users to send invite emails directly from the app would:
- Remove friction from the sharing flow
- Enable delivery and open tracking
- Allow personalized invite content (e.g., "Alice invited you to try Arcade")

This would require an email provider integration (Resend, SendGrid) and a dedicated `Invite` table to track per-recipient state.

---

## Referred-User Cohort Analysis

The `referredBy` column already captures the referrer's code at signup. This data could power:
- Retention comparisons between referred and organic users
- LTV analysis by referral source
- Identification of top referrers for reward programs

---

## Rate Limiting on the Invite Endpoint

`POST /api/users/me/invite` increments `invitesSent` on every button click. A malicious or automated client could inflate this count artificially, distorting the conversion rate. Rate limiting (e.g., via an edge middleware or Upstash Redis) would prevent this.

---

## Personalized Referral Landing Page

A public `/invite/[referralCode]` page tailored to the referrer (e.g., "Your friend Alice invited you to Arcade") would increase signup conversion on the receiving end. Social proof and personalization are well-documented levers for referral program performance.

---

## Deployment and Database

SQLite is not suitable for multi-instance deployments (e.g., Vercel serverless functions). Moving to a hosted database such as PlanetScale, Neon, or Turso (libsql) would enable:
- Concurrent connections
- Horizontal scaling
- Automated backups

The Prisma schema and `@prisma/adapter-libsql` setup already provide a smooth migration path to Turso in particular.
