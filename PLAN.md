# Arcade Referral App – Implementation Plan

## Goal

Build a simple web app that allows users to sign up, invite others, and track referral conversion rates.

---

## Constraints

- Time limit: 6 hours
- Focus on core functionality only
- Avoid overengineering
- Prioritize clarity and simplicity over completeness

---

## Core Features

### 1. Simple Sign-Up/Login

- User enters email to create an account
- No complex authentication (no password required or minimal validation)
- Session handled simply (local storage or lightweight solution)

---

### 2. Referral System

- Each user has a unique `referralCode`
- Invite link format: `?ref=<referralCode>`
- When a new user signs up using this link:
  - The system stores who referred them

---

### 3. Conversion Tracking

- Track:
  - Number of users invited
  - Number of users successfully registered
- Compute:
  - Conversion Rate = (converted / invited)

---

### 4. Dashboard

Display:

- Total invites sent
- Total conversions
- Conversion rate (%)

---

## Data Model (Minimal)

User:

- id
- email
- referralCode (unique)
- referredBy (nullable)

---

## Technical Approach

### Frontend

- Next.js (App Router)
- TypeScript
- Minimal UI (focus on usability)
- TailwindCSS

### Backend / Data

- Simple database (SQLite with Prisma)

---

## Authentication Strategy

- Simplified auth:
  - Email-based login (no password or mock session)
- Focus is not security, but user flow

---

## Metrics Strategy

- Store referral relationships in database
- Compute metrics dynamically
- No external analytics (e.g., Mixpanel) to reduce complexity

---

## Testing Strategy

- At least 1–2 meaningful tests:
  - Referral logic
  - Conversion calculation
- Additional tests can be stubbed if needed

---

## Documentation

README should include:

- Project overview
- Setup instructions
- Architecture decisions
- Trade-offs
- What would be improved with more time

---

## AI Usage

- Use AI (Claude Code) to:
  - Generate boilerplate
  - Assist with implementation
  - Suggest improvements

- Document:
  - Prompts used
  - Decisions influenced by AI
  - Adjustments made manually

---

## Implementation Plan (Step-by-Step)

1. Setup project (Next.js + TypeScript) - DONE
2. Define data model - PENDING
3. Implement signup flow - PENDING
4. Capture referral code from URL - PENDING
5. Store referral relationship - PENDING
6. Build dashboard - PENDING
7. Add basic tests - PENDING
8. Improve UI - PENDING
9. Write documentation - PENDING

---

## Trade-offs

- Skipped robust authentication to focus on referral logic
- Avoided external analytics tools to reduce setup complexity
- Prioritized functionality over polish

---

## Future Improvements

- Real authentication (OAuth / magic link)
- External analytics integration (e.g., Mixpanel)
- Better UI/UX
- Email-based invite system
