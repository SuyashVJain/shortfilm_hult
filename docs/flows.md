# User Flows and UX

All flows follow the design rules in `design-system.md` and the data model in `architecture.md`. Undefined rules are marked TBA and tracked in `open-questions.md`.

---

## 1. Public visitor

Home → The Competition / SDG Themes / Guidelines → **Register**. The primary conversion is `REGISTER YOUR TEAM`. The poster QR lands directly on `/register`.

Navigation: Home · The Competition · SDG Themes · Guidelines · Register, with a smaller, separated **Login**.

---

## 2. Registration (`/register`)

Not one giant form. A multi-step flow, one focused step per screen, with a stepper and a progress line. Mobile-first, since most users arrive from the QR code.

**Guards:** if `registrationOpen` is false or the deadline has passed, show a calm "Registration is closed" screen with no form. If the user already has a team, redirect to `/dashboard`.

### Step 0. Verify email
The team leader enters their email and receives a one-time code, then enters it. This creates the account (role PARTICIPANT) and lets payment proof upload happen securely. Draft form data is kept in the browser so a refresh does not lose progress.

### Step 1. Team details
Team Name · Team Leader Name · Team Leader Email (prefilled, from verification) · WhatsApp Number · Branch · Semester.
Validation: team name required and unique, WhatsApp number a valid format, all fields required.

### Step 2. Team members
- The leader is automatically member 1 (shown as locked, "Team Leader").
- Add members dynamically. Each has Full Name, Branch, Semester.
- Live counter: "Team size: 3 of 2–7".
- Cannot proceed with fewer than 2 total. Cannot add beyond 7 (the add button disables and explains).
- Members can be removed, except the leader.
- Bounds come from settings (`minTeamSize`, `maxTeamSize`).

### Step 3. Film idea
- Select SDG: four large selectable options (9, 11, 12, 16) with accent colours and names.
- Working Film Title.
- Short Synopsis.
- "How does your film address the selected SDG?"
- Keep it concise, with modest character limits and a visible counter. Limits are a UX choice, not an event rule.

### Step 4. Payment
- Shows "Registration fee: ₹500 per team" (from settings).
- Shows **payment instructions from admin settings** (text and optional QR). If not configured: "Payment details will be shared." Nothing hardcoded.
- Fields: Transaction ID / UTR, Payment screenshot (image upload with preview, size cap).
- Helper text explains that payment is verified manually by organizers.

### Step 5. Review
Complete summary, editable per section (jump back to a step):

```
TEAM              The Storytellers
TEAM SIZE         5
SELECTED SDG      11 — Sustainable Cities and Communities
FILM              The Last Train
REGISTRATION      ₹500
```
plus members list, leader contact and payment details (UTR, screenshot thumbnail). Primary button: **CONFIRM REGISTRATION**.

### Confirmation
Generate a unique Team ID (e.g. `HP-SF-027`). Screen:

```
REGISTRATION RECEIVED
Your registration has been successfully submitted.

Team ID:        HP-SF-027
Payment:        Pending Verification
Selected SDG:   SDG 11
Film:           The Last Train
```
CTA: **GO TO DASHBOARD**. Also send a confirmation email with the Team ID. The participant is already logged in.

### Error and edge handling
- Duplicate team name → inline error.
- Upload fail → retry without losing other fields.
- Closed mid-flow (deadline passes) → clear message; the submitted draft is not lost silently.
- Duplicate submit (double-click) → prevented; one team per leader.

---

## 3. Login (`/login`)

Email → OTP code → redirect by role: PARTICIPANT → `/dashboard`, JURY → `/jury`, ADMIN → `/admin`. No passwords. Wrong role hitting a protected route is redirected, not shown an error page.

---

## 4. Participant dashboard (`/dashboard`)

Calm, legible, near-solid dark. Header:

```
WELCOME,
[Team Name]
TEAM ID  HP-SF-027
```

### Status block
- **Payment:** Pending / Verified / Rejected (with the admin's reason if rejected, and a "Resubmit payment" action)
- **Registration:** Submitted / Approved
- **Film submission:** Not Open / Open / Submitted / Under Review

### Timeline
A visual progress line with states done / current / upcoming:

`Registration → Payment Verification → Film Submission → Jury Evaluation → Results`

The states are computed, not manual (see `architecture.md` §5). No dates shown unless defined.

### Team (`/dashboard/team`)
- Lists all members with branch and semester.
- The team leader can edit team details and add/remove members **only while the registration is editable**. Once locked, all controls are disabled with a clear note.
- Member-count bounds still apply on edit (2–7).

### Payment (`/dashboard/payment`)
Shows the latest payment status, UTR and screenshot. If rejected: shows reason plus a resubmit form. Payment history visible.

### Film submission (`/dashboard/submission`)
- Before opening: "Film submission is not open yet. Details will be shared with registered teams."
- When open: banner **FILM SUBMISSION IS OPEN**, then a form:
  - Google Drive link (validated; helper text: set sharing to "Anyone with the link can view")
  - Film Title
  - Synopsis
  - Selected SDG (prefilled from registration)
  - Credits
- No other required fields until final submission rules are defined.
- After submit: shows status (Submitted → Under Review, etc.) with the submitted details. Whether teams may edit or replace the link after submitting is TBA (open question), so default to allowed until admin marks Under Review.
- Only reachable if payment is VERIFIED (proposed: unverified teams cannot submit). Confirm.

---

## 5. Admin (`/admin`)

Efficient and dense. Desktop-first, with usable mobile fallback.

### Overview
Stat blocks: **Total Teams · Payments Pending · Registered Teams (payment verified) · Films Submitted · Evaluations Completed**. Quick links to the payment queue.

### Teams (`/admin/teams`)
Table columns: Team ID · Team Name · Team Leader · SDG · Team Size · Payment · Registration · Film · Status. Search, filter (SDG, payment, film status), sort, CSV export. Click a row → **team detail**: leader contact, all members, film idea, payment records with screenshot, submission, evaluation summary, lock/unlock editing.

### Payment verification (`/admin/payments`)
Queue defaulting to Pending. Each item shows Team, Transaction ID, Screenshot (zoomable), Amount, Date. Actions: **VERIFY PAYMENT** and **REJECT PAYMENT**. Rejecting requires a reason. The participant dashboard updates immediately. Optional email notification.

### Submissions (`/admin/submissions`)
Table: Team · Film · SDG · Submission Status (Not Submitted, Submitted, Under Review, Approved, Rejected). Open the Drive link to preview. Change status, add an admin note. Flag broken or restricted links, since the film cannot be opened if sharing is off, and the admin can mark it and request a fix.

### Evaluations (`/admin/evaluations`)
Per film: each juror's scores and comments, aggregate per criterion and overall. Shows which jurors have finished.

### Results (`/admin/results`)
For each configured award category, the admin selects a winning film, adds an optional note, previews, then **publishes**. Nothing is public until published. Categories come from settings and are marked proposed.

### Jury accounts (`/admin/jury`)
Create/disable jury users by email. Proposed panel names are prefilled as suggestions, not forced.

### Settings (`/admin/settings`)
Sections: Event · Registration (fee, deadline, team size, open/closed) · Submission (open/closed, max duration) · Payment instructions · Prize text · Award categories · SDG themes · Evaluation criteria and scoring scale. Official fields are protected by an "Unlock official fields" step and confirmation, with last-changed info. Operational toggles are directly editable.

---

## 6. Jury (`/jury`)

Separate, minimal interface. Jury never sees payment data or admin controls.

### List
Films available to the juror (approved submissions; optional per-juror assignment later). Each row: Team Name, Film Title, SDG, evaluation status (Not started / Saved).

### Evaluation page (`/jury/[submissionId]`)
Top: Team Name · Film Title · Selected SDG · **Film** (Drive link opens in a new tab or is embedded when the link supports it).

Scoring form, one control per proposed criterion:

1. SDG Understanding / Relevance
2. Originality & Creativity
3. Story & Screenplay
4. Acting & Direction
5. Editing & Technical Execution
6. Communication & Impact

- Numeric scores within the **admin-configured scale** (no default assumed; if the scale is not configured yet, the form shows a clear "scoring not configured" state instead of guessing).
- **COMMENTS** free text.
- **SAVE EVALUATION**. Saving can be repeated (edit until admin finalizes). Shows the running total per the configured weights.
- A juror sees only their own scores (proposed).

---

## 7. Results (public, later)

When published: a cinematic results page listing configured categories with winning team and film. Hidden until published. Category names use whatever is finalized in settings.

---

## 8. State reference

| Object | States |
|---|---|
| Payment | PENDING, VERIFIED, REJECTED |
| Registration | SUBMITTED, APPROVED (plus `locked` flag) |
| Film submission | NOT_SUBMITTED, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED |
| Submission stage (derived) | NOT_OPEN, OPEN, then submission status |
| Evaluation (per juror) | Not started, Saved |
| Results | Unpublished, Published |

## 9. Notifications (minimal, via Resend)

OTP code · registration received (with Team ID) · payment verified · payment rejected (with reason) · film submission opened (optional, admin-triggered). Nothing more until needed.
