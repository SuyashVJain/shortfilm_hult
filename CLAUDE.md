# Short Film Competition Portal

Web portal for the Short Film Competition (Hult Prize @ SUAS, Symbiosis University of Applied Sciences, Indore). Public site, team registration, payment verification, participant dashboard, film submission, admin dashboard, jury evaluation, results.

## Read these first (in `docs/`)

| File | Contains |
|---|---|
| `docs/event-facts.md` | Official event facts. Source of truth. |
| `docs/open-questions.md` | Everything undefined. Do not invent answers. |
| `docs/design-system.md` | Cinematic visual language, tokens, typography, motion, do/don't. |
| `docs/architecture.md` | Stack, data model, roles, routes, phases. |
| `docs/flows.md` | Registration, dashboard, admin and jury flows. |

Read the relevant doc before building any feature. If code and docs disagree, ask before changing either.

## Non-negotiable rules

1. **Never invent event rules**, dates, prizes, eligibility, or submission requirements. Unknown means "TBA", "Details will be shared with registered teams", or an admin-configurable setting.
2. **Never display a prize amount.** Use "Attractive Prizes".
3. Award categories, evaluation criteria and jury are **proposed**, so keep them configurable and label them "subject to finalization" publicly.
4. Films are **Google Drive links**. Do not store video. Storage (Vercel Blob) is for payment screenshots only.
5. Event values (fee, deadline, team size, max duration, open/closed) come from `EventSettings` via `lib/settings.ts`, never hardcoded in components.
6. Enforce access control in code: middleware plus `requireRole` plus ownership checks in every server action. Jury must never read payment data.
7. Site stays **dark and cinematic**. SDG colours are small accents only. Follow the do/don't list in `design-system.md`. Keep the poster's "SHORT FILM / Competition" lockup concept.
8. Motion is slow and restrained. Respect `prefers-reduced-motion`.
9. Mobile is a first-class experience (registration is reached via QR from the poster).

## Stack

Next.js (App Router) · TypeScript · Tailwind · Framer Motion · Zod · Neon Postgres · Prisma (Neon adapter) · Better Auth (email OTP) · Resend · Vercel Blob · Vercel.

## Git

Never add `Co-Authored-By: Claude` or "Generated with Claude Code" (or any similar attribution) to commit messages in this repo.

## Working style

- Small, focused commits.
- Validate all inputs with Zod. Return friendly, plain-language errors.
- Run typecheck and lint before finishing a task.
- Registration and payment verification are the launch-critical path (deadline 7 Oct 2026). Build those before anything else.
