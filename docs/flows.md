# User Flows and UX

All flows follow the design rules in `design-system.md` and the data model in `architecture.md`. Undefined rules are marked TBA and tracked in `open-questions.md`.

---

## 1. Public visitor

Home → The Competition / SDG Themes / Guidelines → **Register**. The primary conversion is `REGISTER YOUR TEAM`. The poster QR lands directly on `/register`.

Navigation: Home · The Competition · SDG Themes · Guidelines · Register, with a smaller, separated **Login**.

---

## 2. Registration (`/register`)

Not one giant form. A multi-step flow, one focused step per screen, with a stepper and a progress line. Mobile-first, since most users arrive from the QR code.

Registration is kept fast: team details, members and payment only. **The SDG and film idea are not collected at registration**; teams choose them later at film submission (Phase 2, section 4).

**Guards:** if `registrationOpen` is false or the deadline has passed, show a calm "Registration is closed" screen with no form. If the user already has a team, redirect to `/dashboard`.

### Step 0. Verify email
The team leader enters their email and receives a one-time code, then enters it. This creates the account (role PARTICIPANT) and lets payment proof upload happen securely. Draft form data is kept in the browser so a refresh does not lose progress.

### Step 1. Team details
Team Name · Team Leader Name · Team Leader Enrollment Number · Team Leader Email (prefilled, from verification) · WhatsApp Number · Branch · Semester.

Branch is a dropdown: B.Tech CSIT, B.Tech AI/ML, B.Tech SAR, BBA RM, BBA DMM, BBA LSCM, BBA BFSI, B.Sc Data Science, MBA BFSI, MBA LSCM, MBA MM. Semester is a dropdown: 1, 3, 5, 7. Enrollment number is required, with no fixed format (owner decision).
Validation: team name required and unique, WhatsApp number a valid format, all fields required.

### Step 2. Team members
- The leader is automatically member 1 (shown as locked, "Team Leader").
- Add members dynamically. Each has Full Name, Enrollment Number, Branch and Semester (same dropdowns as step 1).
- Live counter: "Team size: 3 of 2–7".
- Cannot proceed with fewer than 2 total. Cannot add beyond 7 (the add button disables and explains).
- Members can be removed, except the leader.
- Bounds come from settings (`minTeamSize`, `maxTeamSize`).

### Step 3. Payment
- Shows "Registration fee: ₹500 per team" (from settings).
- Shows **payment instructions from admin settings** (text and optional QR). If not configured: "Payment details will be shared." Nothing hardcoded.
- Fields: Transaction ID / UTR, Payment screenshot (image upload with preview, size cap).
- Helper text explains that payment is verified manually by organizers.

### Step 4. Review
Complete summary, editable per section (jump back to a step):

```
TEAM              The Storytellers
TEAM SIZE         5
REGISTRATION      ₹500
```
plus members list, leader contact and payment details (UTR, screenshot thumbnail). Primary button: **CONFIRM REGISTRATION**.

### Confirmation
Generate a unique Team ID (e.g. `HP-SF-027`). Screen:

```
REGISTRATION RECEIVED
Your registration has been successfully submitted.

Team ID:        HP-SF-027
Payment:        Needs review
```
CTA: **GO TO DASHBOARD**. Also send a confirmation email with the Team ID. The participant is already logged in. The screen and email say the organisers will check the payment and the team can already use its dashboard.

**Payment is optimistic:** a registered team has full access immediately while its payment is PENDING ("Needs review"). The admin later verifies or rejects it. Payment status is a review flag, not an access gate.

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
- **Payment:** Needs review / Verified / Rejected (with the admin's reason if rejected, and a "Resubmit payment" action)
- **Registration:** Submitted / Approved
- **Film submission:** Not Open / Open / Submitted / Under Review

### Timeline
A visual progress line with states done / current / upcoming:

`Registration → Payment Verification → Film Submission → Jury Evaluation → Results`

The states are computed, not manual (see `architecture.md` §5). No dates shown unless defined.

### Team (`/dashboard/team`)
- Lists all members with branch and semester.
- The team leader can edit team details and add/remove members **only while the registration is editable**: until the admin locks it or the registration deadline passes. Payment status does not affect editing. Once locked, all controls are disabled with a clear note.
- Member-count bounds still apply on edit (2–7).

### Payment (`/dashboard/payment`)
Shows the latest payment status, UTR and screenshot. If rejected: shows reason plus a resubmit form. Payment history visible.

### Film submission (`/dashboard/submission`)
- Before opening: "Film submission is not open yet. Details will be shared with registered teams."
- When open: banner **FILM SUBMISSION IS OPEN**, then a form:
  - Google Drive link (validated; helper text: set sharing to "Anyone with the link can view")
  - Film Title
  - Synopsis
  - Selected SDG (chosen here; not collected at registration)
  - Credits
- No other required fields until final submission rules are defined.
- After submit: shows status (Submitted → Under Review, etc.) with the submitted details. Whether teams may edit or replace the link after submitting is TBA (open question), so default to allowed until admin marks Under Review.
- Allowed when the latest payment is PENDING or VERIFIED. Blocked only while the latest payment is REJECTED (the team resubmits payment first).

---

## 5. Admin (`/admin`)

Efficient and dense. Desktop-first, with usable mobile fallback.

### Overview
Stat blocks: **Total Teams · Payments to Review · Verified · Rejected · Films Submitted · Evaluations Completed** (payment counts use each team's latest payment). Quick links to the payment queue.

### Teams (`/admin/teams`)
Table columns: Team ID · Team Name · Team Leader · SDG · Team Size · Payment · Registration · Film · Status. Search, filter (SDG, payment, film status), sort, CSV export. Click a row → **team detail**: leader contact, all members, film idea, payment records with screenshot, submission, evaluation summary, lock/unlock editing.

### Payment verification (`/admin/payments`)
Tabs Needs review (default) · Verified · Rejected. Each item shows Team, Transaction ID, Screenshot (zoomable), Amount, Date. Actions: **VERIFY PAYMENT** and **REJECT PAYMENT**. Rejecting requires a reason. Teams already have access while their payment is under review; this is a review step, not an access gate. The participant dashboard updates immediately and the leader gets an email.

### Submissions (`/admin/submissions`)
Table: Team · Film · SDG · Submission Status (Not Submitted, Submitted, Under Review, Approved, Rejected). Open the Drive link to preview. Change status, add an admin note. Flag broken or restricted links, since the film cannot be opened if sharing is off, and the admin can mark it and request a fix.

### Evaluations (`/admin/evaluations`)
Per film: each juror's scores and comments, aggregate per criterion and overall. Shows which jurors have finished.

### Results (`/admin/results`)
For each configured award category, the admin selects a winning film, adds an optional note, previews, then **publishes**. Nothing is public until published. Categories come from settings and are marked proposed.

### Jury accounts (`/admin/jury`)
Create locations (rooms / online panels), create jury accounts with a jury ID and password tied to a location, deactivate/reactivate accounts, and assign each team to a location. Judging runs in parallel: each panel works through its own queue. On a team page the admin sees every juror's scores, per-criterion sum and average, and the overall average, and can unlock one evaluation for correction.

### Settings (`/admin/settings`)
Sections: Event · Registration (fee, deadline, team size, open/closed) · Submission (open/closed, max duration) · Payment instructions · Prize text · Award categories · SDG themes · Evaluation criteria and scoring scale. Official fields are protected by an "Unlock official fields" step and confirmation, with last-changed info. Operational toggles are directly editable.

---

## 6. Jury (`/jury`)

Separate, minimal interface with its own sign-in (`/jury/login`, jury ID + password from the admin; not email OTP). Jury never sees payment data, team members or admin controls.

### List
Approved films from teams assigned to the juror's location. Each row: Team ID, Team Name, Film Title, SDG, status (Not yet scored / Submitted / Unlocked for correction).

### Evaluation page (`/jury/[teamId]`)
Top: Team Name · Film Title · Selected SDG · **Film** (Drive link opens in a new tab or is embedded when the link supports it).

Scoring form, one control per proposed criterion:

1. SDG Understanding / Relevance
2. Originality & Creativity
3. Story & Screenplay
4. Acting & Direction
5. Editing & Technical Execution
6. Communication & Impact

- Whole-number scores from 1 to 10 (owner decision), or the admin `scoringScale` if set.
- Optional overall comment.
- **Review** step shows all scores and the total, with Edit to go back, then **SUBMIT FINAL SCORES**. Submission is final; the page becomes read-only.
- An admin can unlock one evaluation for correction; the juror edits and resubmits, which locks it again.
- A juror sees only their own scores.

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

## 9. Notifications (minimal, via Gmail SMTP, `lib/mailer.ts`)

OTP code · registration received (with Team ID) · payment verified · payment rejected (with reason) · film submission opened (optional, admin-triggered). Nothing more until needed.
