# Open Questions and TODOs

Everything not yet defined. **Do not invent answers.** Until the owner fills a row in, the site shows "TBA" / "Details will be shared with registered teams", or the field is admin-configurable in `settings`.

Status key: OPEN (undecided), PROPOSED (default suggested, needs confirmation), DONE.

## A. Event rules

| # | Question | Status | Interim behaviour |
|---|---|---|---|
| A1 | Film submission deadline | OPEN | Show "TBA". Submission stage stays closed until admin opens it. |
| A2 | Submission format (Drive link is the chosen mechanism). Any file format, resolution, aspect ratio, FPS rules? | OPEN | Do not display any technical spec. |
| A3 | Language requirements (subtitles, etc.) | OPEN | Not shown. |
| A4 | Originality / plagiarism declaration wording | OPEN | Not shown, no checkbox invented. |
| A5 | AI-generated content rules | OPEN | Not shown. |
| A6 | Music / copyright / licensing rules | OPEN | Not shown. |
| A7 | Whether the 3-minute limit includes credits | OPEN | Say "Maximum 3 minutes" only. |
| A8 | Can one student be in more than one team? | OPEN | Not enforced. Flag to owner. |
| A9 | Eligibility edge cases (non-SUAS members, alumni, other campuses) | OPEN | Public copy: "Open to all SUAS students". |
| A10 | Event/result announcement dates, screening event | OPEN | Timeline steps show no dates. |
| A11 | Final prize distribution and number of winners per category | OPEN | Show "Attractive Prizes" only. |
| A12 | Final award categories | OPEN | Proposed four, shown as subject to finalization. |
| A13 | Final jury panel | OPEN | Three proposed names, editable data. |

## B. Registration and payment

| # | Question | Status | Interim behaviour |
|---|---|---|---|
| B1 | Payment method (UPI ID / QR / bank details / cash desk) | OPEN | Admin-configurable "payment instructions" text plus optional QR image in settings. Nothing hardcoded. |
| B2 | Is a UTR always required, or may cash payment be verified offline? | OPEN | UTR and screenshot both collected as specified. |
| B3 | Refund policy | OPEN | Not shown. |
| B4 | Can a rejected team resubmit payment? | PROPOSED | Yes. New payment record, old one kept as history. |
| B5 | When is registration locked for editing? | PROPOSED | Editable until payment is verified or the deadline passes, whichever is first, or the admin locks it manually. Confirm. |
| B6 | Team name uniqueness | PROPOSED | Unique, case-insensitive. |
| B7 | One team per leader email | PROPOSED | Yes. |
| B8 | Late registrations after 7 Oct (extension handling) | OPEN | Registration open/closed is a manual admin switch plus deadline setting. |
| B9 | Team ID format | PROPOSED | `HP-SF-###` (Hult Prize, Short Film, zero-padded sequence). Based on owner's example `HP-SF-027`. |

## C. Jury and results

| # | Question | Status | Interim behaviour |
|---|---|---|---|
| C1 | Scoring scale (1–5, 1–10, 0–100, weights) | OPEN | Admin-configurable min, max and per-criterion weight. No default assumed. |
| C2 | Do all jurors see all films, or assigned subsets? | PROPOSED | All approved films visible; optional per-juror assignment later. |
| C3 | Can jurors see each other's scores? | PROPOSED | No, until results are finalized. |
| C4 | Who computes winners (auto by score vs. admin decision)? | PROPOSED | Aggregated scores shown to admin, and the admin picks winners per category. |
| C5 | Results publication date and format | OPEN | Results page hidden until admin publishes. |

## D. Brand and assets

| # | Item | Status | Notes |
|---|---|---|---|
| D1 | Logo files (SUAS, EF, Hult Prize, extra emblem) | DONE | White SUAS and Hult Prize logos are in `public/logo/` (web-safe copies: `suas-white.png`, `hult-prize-white.png`). The Hult Prize horizontal logo contains the "EF Hult Prize" wordmark, the Hult Prize mark, the EF mark and the shield/leaf emblem, so EF and the extra emblem appear to be covered by it. Confirm with the owner that the shield is the poster's emblem. Use as supplied. Do not redraw. |
| D2 | Textless poster artwork | DONE | Three backdrops generated (see design-system.md). |
| D3 | Production domain name | OPEN | Needed for QR and OTP email links. |
| D4 | Sender email for OTP mail (Resend domain verification) | OPEN | Needs a verified domain or address. |
| D5 | Support contact shown on site (email / WhatsApp) | OPEN | Placeholder "Contact details will be shared". |
| D6 | Organizer contact names to show publicly | OPEN | Not shown by default. |

## E. Technical decisions pending

| # | Item | Status |
|---|---|---|
| E1 | Admin and jury account provisioning (manual seed vs invite flow) | PROPOSED: seed script for first admin, then admin creates jury accounts by email |
| E2 | Rate limiting and abuse protection on OTP and registration | PROPOSED: basic per-IP and per-email limits |
| E3 | Privacy notice / data handling text (collecting WhatsApp numbers, screenshots) | OPEN |
| E4 | Email notifications (payment verified/rejected, submission opened) | PROPOSED: minimal, via Resend |
| E5 | Backups and export (CSV export of teams for organizers) | PROPOSED: admin CSV export of teams and members |

## How to resolve a row
The owner gives the answer, the row is marked DONE, and the value goes into `event-facts.md` (if it is a fact) or `settings` (if it is a configurable value). Nothing moves out of this file without an explicit owner instruction.
