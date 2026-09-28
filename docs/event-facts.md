# Event Facts: Short Film Competition

Source of truth for every public-facing fact. If a fact is not here, it is not confirmed. Do not invent it. Use "TBA" or an admin-configurable field instead. Undefined items are tracked in `open-questions.md`.

Sources: the official proposal (`Short_Film.docx`, addressed to Dr. Neha Gupta, Deputy Director SCSIT), the current poster, and details confirmed directly by the project owner.

---

## 1. Identity

| Field | Value |
|---|---|
| Event | Short Film Competition |
| Organizer | Hult Prize @ SUAS |
| University | Symbiosis University of Applied Sciences, Indore |
| Campus Director (proposal author) | Dhruvi Namdeo |
| Tagline | REAL STORIES \| BRIGHTER TOMORROWS |
| Supporting line | FOUR GOALS. COUNTLESS PERSPECTIVES. YOUR STORY CAN MAKE A DIFFERENCE. |
| Poster secondary line | Your Story Matters |
| Open to | All SUAS students (confirmed by owner, not in proposal) |
| Inter-branch teams | Encouraged (confirmed by owner) |

Concept: a university-level competition where students engage with the UN Sustainable Development Goals through filmmaking and storytelling. It encourages interdisciplinary collaboration and lets students explore social, environmental and institutional challenges through visual storytelling.

## 2. Confirmed numbers

| Fact | Value | Display |
|---|---|---|
| Maximum film duration | 3 minutes | 3 MIN |
| Team size | 2 to 7 members (leader counts as one) | 2–7 |
| Registration fee | ₹500 per team | ₹500 |
| Registration deadline | 7 October 2026 | 7 OCT |
| Prize | Not announced as an amount | ATTRACTIVE PRIZES |

### Prize rule (important)
The proposal mentions a possible pool of ₹5,000–₹8,000 but states it may differ based on registration collection and **must not be announced**. Never display any prize amount anywhere (site, emails, admin public views, metadata). Use "Attractive Prizes". Prize text is an admin-configurable field, changed only on the owner's instruction.

## 3. SDG themes

Each team picks **exactly one** of four themes.

| SDG | Theme | Accent |
|---|---|---|
| 9 | Industry, Innovation and Infrastructure | orange `#F36D25` |
| 11 | Sustainable Cities and Communities | yellow-orange `#F99D26` |
| 12 | Responsible Consumption and Production | green `#6BA43A` |
| 16 | Peace, Justice and Strong Institutions | blue `#1F7BC4` |

Short card descriptions (SDG hover/click reveal) must be written in neutral language. They explain the goal, not extra competition rules. They are copy, not event rules, and the owner can edit them.

## 4. Award categories (PROPOSED, not final)

1. Best Storyline for Sustainable Development Goals (best aligned to the theme)
2. Overall Best Short Film
3. Best Story and Script
4. Best Editing and Acting

The proposal says categories and prize distribution may be modified based on the number and quality of submissions and jury recommendations. Therefore:
- Label them **"Proposed award categories, subject to finalization"** wherever shown publicly.
- Store them as configurable data, never hardcoded.

## 5. Evaluation criteria (PROPOSED)

The proposal says films "may be assessed" on:

1. Relevance and understanding of the selected SDG
2. Originality and creativity of the concept
3. Quality of story and screenplay
4. Acting and direction
5. Editing and overall technical execution
6. Effectiveness of communication and overall impact

Public wording: "Proposed evaluation criteria". These map 1:1 to the jury scoring form. The scoring scale is **not defined**; it is admin-configurable.

## 6. Jury (PROPOSED)

Proposed panel, not necessarily final:
- Dr. Naganjani Uppaluru
- Dr. Abhijeet Tiwari
- Ms. Raveena Maheshwari

Public site: either omit the jury or label "Proposed jury panel". Jury accounts are created by admin, and the panel list is data, not hardcoded.

## 7. Status of the proposal

The proposal is a request for approval. It states that the **detailed schedule, registration process, promotional plan, submission guidelines and final prize distribution will be prepared after approval**. Treat everything in `open-questions.md` as undecided until the owner supplies it.

## 8. Poster reference

Poster content that can be reused on the site: SHORT FILM / Competition lockup, tagline lines, "EXPLORE STORIES AROUND" with the four SDGs, "Your Story Matters", and the footer facts (team size 2–7, registration deadline 7 OCT 2026, attractive prizes, scan to register). Partner logos on the poster: Symbiosis University of Applied Sciences (Indore), EF, Hult Prize, and one further emblem. Logo files must be supplied by the owner; do not redraw or approximate them.

## 9. QR / registration URL

The poster QR points to `/register` on the deployed domain. Domain TBA. The site must expose `/register` as a stable, directly linkable route. Generating the QR image is done outside the app.
