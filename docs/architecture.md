# Architecture

## 1. Goals and constraints

- A complete competition portal, not just a landing page.
- Small scale (tens to low hundreds of teams), one-off event, tight timeline: **registration closes 7 October 2026**.
- Prefer simple and hard to break over clever. Do not overengineer.
- Undefined event rules become admin-configurable settings, never hardcoded.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | Server components, server actions, route handlers |
| Styling | Tailwind CSS with custom design tokens | No component library |
| Motion | Framer Motion | Restrained, reduced-motion aware |
| Validation | Zod | Shared schemas for client and server |
| Database | PostgreSQL on **Neon** | Pooled URL for runtime, direct URL for migrations |
| ORM | Prisma with the Neon serverless adapter | |
| Auth | **Better Auth**, email OTP, role field | No passwords |
| Email | Resend | OTP and minimal notifications |
| File storage | Vercel Blob behind `lib/storage.ts` interface | **Payment screenshots and the payment QR only** |
| Film delivery | **Google Drive link** submitted by teams | No video files stored by us |
| Hosting | Vercel | |

Access control is enforced **in application code** (Neon has no row-level security here): middleware plus a guard inside every server action and route handler, plus query scoping.

### Why Drive links for films
A 3-minute video can exceed free-tier upload limits and adds heavy storage, bandwidth and upload-failure risk. Teams submit a Drive link with sharing set to "Anyone with the link can view". Jury and admin open the link. The storage interface remains swappable if direct upload is wanted later.

## 3. Roles and access

| Role | Can | Cannot |
|---|---|---|
| PARTICIPANT (team leader) | View and edit own team (while editable), upload payment proof, view status, submit film link when open | See other teams, admin or jury pages |
| JURY | View approved submissions, save own evaluations | See payment data, admin settings, other jurors' scores (proposed) |
| ADMIN | Everything: teams, payments, submissions, jury accounts, settings, results | n/a |

Rules:
- Route protection in `middleware.ts`: `/dashboard` (PARTICIPANT), `/jury` (JURY, ADMIN), `/admin` (ADMIN).
- **Every** server action calls `requireRole(...)`, then verifies ownership (a participant's `teamId` must match). UI hiding is never the only protection.
- Jury queries must never select from or join the payments table.
- Admin can preview jury pages; jury cannot reach admin.

## 4. Data model

Seven tables plus the auth tables Better Auth manages. Field names are indicative. Prisma models may adjust naming.

### User (Better Auth-managed, extended)
`id`, `email` (unique), `name`, `role` (PARTICIPANT | JURY | ADMIN, default PARTICIPANT), `createdAt`.

### Team
| Field | Notes |
|---|---|
| `id` | |
| `code` | Unique, `HP-SF-###` from a DB sequence |
| `name` | Unique, case-insensitive |
| `leaderId` | → User (one team per leader) |
| `leaderName`, `whatsapp`, `branch`, `semester` | Leader details (email is on User) |
| `sdg` | 9, 11, 12 or 16 |
| `filmTitle` | Working title |
| `synopsis` | Short |
| `sdgApproach` | "How does your film address the selected SDG?" |
| `registrationStatus` | SUBMITTED, APPROVED |
| `locked` | boolean. Once true, team and member editing is disabled |
| `createdAt`, `updatedAt` | |

### TeamMember
`id`, `teamId`, `fullName`, `branch`, `semester`, `isLeader` (the leader is member #1 automatically and counts toward 2–7). Enforced: total members between `minTeamSize` and `maxTeamSize` from settings.

### Payment
`id`, `teamId`, `amount` (snapshot of the fee at submission), `utr`, `screenshotUrl`, `status` (PENDING | VERIFIED | REJECTED), `rejectReason`, `submittedAt`, `reviewedAt`, `reviewedById` (→ User). One team can have several rows (resubmission after rejection). The latest row decides the current status.

### FilmSubmission
`id`, `teamId` (unique), `driveUrl`, `title`, `synopsis`, `sdg`, `credits` (free text, optional), `status` (NOT_SUBMITTED | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED), `submittedAt`, `adminNote`. Fields beyond these are not added until final submission rules exist.

### Evaluation
`id`, `submissionId`, `juryId` (→ User), `scores` (JSON keyed by criterion key), `comment`, `createdAt`, `updatedAt`. Unique on (`submissionId`, `juryId`). Score bounds validated against the settings scale.

### Award / Result
`id`, `categoryKey` (from settings), `submissionId`, `note`, `published` (boolean), `publishedAt`. Categories live in settings. This table only records chosen winners, so categories can change freely.

### EventSettings
Key/value rows or one JSON row, `updatedAt`, `updatedById`.

| Key | Meaning | Locked? |
|---|---|---|
| `eventTitle` | | official |
| `registrationDeadline` | 7 Oct 2026 | official |
| `registrationFee` | 500 (INR) | official |
| `minTeamSize`, `maxTeamSize` | 2, 7 | official |
| `maxFilmDurationMinutes` | 3 | official |
| `registrationOpen` | boolean | operational |
| `submissionOpen` | boolean | operational |
| `prizeText` | "Attractive Prizes" | official |
| `awardCategories` | list of `{key, title}` | editable, flagged "proposed" |
| `sdgThemes` | list of `{number, title, description, color}` | editable copy, official numbers |
| `evaluationCriteria` | list of `{key, title, weight?}` | editable |
| `scoringScale` | `{min, max}`, not defined by default | editable |
| `paymentInstructions` | text plus optional QR image URL | editable |

**Protection of official fields:** official keys sit behind an "Unlock official fields" control with a confirmation dialog, and every change records who changed it and when. Operational toggles (registration/submission open) are always directly editable.

### Relationships
User 1—1 Team · Team 1—N TeamMember · Team 1—N Payment · Team 1—1 FilmSubmission · FilmSubmission 1—N Evaluation · Evaluation N—1 User (jury) · Award N—1 FilmSubmission.

## 5. Derived states (not stored twice)

- **Payment status shown to team** = status of the latest Payment row.
- **Film submission stage** = NOT_OPEN if `submissionOpen` is false, else OPEN, then SUBMITTED / UNDER_REVIEW etc. from `FilmSubmission.status`.
- **Timeline** on the dashboard is computed from payment status, submission state, evaluation state and results published flag.
- **Editable?** = not locked AND registration deadline not passed (unless admin overrides) AND payment not yet verified (proposed, see open-questions B5).

## 6. Route map

```
Public
/                      Home
/competition           About the competition
/sdgs                  The Four Stories
/guidelines            Guidelines (facts + TBA blocks)
/register              Multi-step registration (QR target)
/login                 Email OTP login

Participant   (role PARTICIPANT)
/dashboard             Status, timeline
/dashboard/team        Team and members
/dashboard/payment     Payment info / resubmit
/dashboard/submission  Film submission (when open)

Jury          (role JURY, ADMIN)
/jury                  Assigned/available films
/jury/[submissionId]   Watch (Drive link) + evaluation form

Admin         (role ADMIN)
/admin                 Overview stats
/admin/teams           Team table
/admin/teams/[id]      Team detail
/admin/payments        Payment verification queue
/admin/submissions     Submission management
/admin/evaluations     Scores overview
/admin/results         Winners, publish
/admin/jury            Jury accounts
/admin/settings        Event settings
```

## 7. Key server actions (illustrative)

`startRegistration` (verify OTP, create user) · `createTeam` · `updateTeam` · `addMember` / `removeMember` · `submitPayment` · `verifyPayment` / `rejectPayment(reason)` · `openSubmissions` (setting toggle) · `submitFilm(driveUrl, …)` · `setSubmissionStatus` · `saveEvaluation` · `setWinner` / `publishResults` · `updateSetting` · `createJuryUser`.

Every action: Zod-validate input, `requireRole`, ownership check, then write. Return typed results with user-friendly errors.

## 8. Storage

`lib/storage.ts` exposes `upload(file, path)`, `getUrl(path)`, `delete(path)`. Vercel Blob is the initial implementation. Payment screenshots: image types only, size-capped (e.g. 5 MB), accessible only to admin (and the owning team when viewing its own record). Do not make screenshot URLs guessable or publicly listed.

## 9. Security and privacy

- Email OTP only, with rate limiting on OTP requests and registration.
- Strict Zod validation on every input, including Drive URL shape (`drive.google.com` / `docs.google.com` patterns).
- Server-side role and ownership checks everywhere.
- Personal data collected: names, email, WhatsApp number, branch, semester, payment screenshot. Store only what is needed. Admin CSV export is admin-only.
- Secrets only in environment variables. Never commit `.env`.
- Privacy notice text is pending (open-questions E3).

## 10. Environment variables

`DATABASE_URL` (Neon pooled) · `DIRECT_URL` (Neon direct) · `BETTER_AUTH_SECRET` · `BETTER_AUTH_URL` · `RESEND_API_KEY` · `BLOB_READ_WRITE_TOKEN`.

## 11. Project structure

```
short-film-portal/
├─ CLAUDE.md
├─ docs/                      (these documents)
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                 (first admin, default settings)
├─ public/cinema/             (bg-desktop, bg-mobile, bg-story, logos)
├─ app/
│  ├─ (public)/               home, competition, sdgs, guidelines, register, login
│  ├─ (participant)/dashboard/
│  ├─ (jury)/jury/
│  ├─ (admin)/admin/
│  └─ api/                    auth handler, upload routes
├─ components/
│  ├─ cinema/                 BackgroundStage, FilmGrain, Vignette, LightLeak, Letterbox, FilmStrip, Reveal
│  ├─ ui/                     Button, SectionHeading, Divider, Container, StatBlock, StatusBadge, DataTable, Stepper
│  ├─ sdg/                    SDGCard, SDGSection
│  ├─ register/               step components
│  ├─ dashboard/, admin/, jury/
├─ lib/
│  ├─ db.ts, auth.ts, storage.ts, guards.ts
│  ├─ settings.ts             typed settings reader with defaults
│  ├─ validation/             Zod schemas
│  └─ team-code.ts            HP-SF-### generator
├─ middleware.ts
└─ .env.example
```

## 12. Build phases

| Phase | Scope | Target |
|---|---|---|
| 0 | Scaffold, design system, backdrop, hero, Neon, auth base | ASAP |
| 1 | Public pages, multi-step registration, payment proof, admin team table, payment verification | **Live before 7 Oct 2026** |
| 2 | Participant dashboard, timeline, team management, film submission (Drive link), submission management | After registration opens |
| 3 | Jury accounts, evaluation dashboard, results publishing, event settings polish | Before submission deadline (TBA) |

Phase 1 is the minimum viable launch. Anything that does not serve registration and payment verification waits.

## 13. Testing and quality

- Type-safe end to end, with lint and typecheck required before merge.
- Test the registration flow (team size 2–7 bounds, duplicate team name, resubmitted payment) and role guards (participant cannot open admin or jury, jury cannot read payments).
- Test mobile first: registration and dashboard on a real phone.
- Seed script creates the first admin and default settings so a fresh environment works.

## 14. Conventions

- Git commits **never** include `Co-Authored-By: Claude` or "Generated with Claude Code" attribution.
- Small focused commits, one concern each.
- Settings are read through `lib/settings.ts`. No hardcoded event values in components.
