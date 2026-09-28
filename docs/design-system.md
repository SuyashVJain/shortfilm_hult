# Design System

The site is the **digital version of the poster**: a premium short-film / film-festival experience. It must never feel like a college Google Form, a hackathon site, or a SaaS dashboard.

Reference feel: Netflix, film festival microsites, premium editorial campaigns, with Hult Prize and SDG language layered in.

## 1. Principles

1. **One idea per screen.** Never put everything in one hero. Use sections, whitespace and large type.
2. **Type is the hero.** Big cream display type carries the design, not cards or icons.
3. **Cinema through atmosphere, not decoration.** Light, grain, shadow, haze, restrained motion.
4. **Colour is rationed.** The site is dark. Red is the single loud accent. SDG colours are small accents only.
5. **Every element has a purpose.** If it does not help a user act or understand, remove it.
6. **Cinematic on public pages, calm on work pages.** Dashboards (participant, admin, jury) drop most atmosphere and become clean, legible and fast.

## 2. Colour tokens

| Token | Value | Use |
|---|---|---|
| `bg` | `#050505` | Page base |
| `charcoal` | `#111111` | Surfaces, panels, table rows |
| `charcoal-2` | `#1A1A1A` | Raised surfaces, hover |
| `cream` | `#F2E8D5` | Primary text, display type |
| `cream-muted` | cream at ~65% | Secondary text |
| `divider` | cream at ~12% | 1px lines |
| `red` | `#E11D2E` | Primary accent, "Competition", CTAs, key states |
| `amber` | `#F59E0B` | Light, glows, film-lighting accents |
| `sdg9` | `#F36D25` | SDG 9 accent |
| `sdg11` | `#F99D26` | SDG 11 accent |
| `sdg12` | `#6BA43A` | SDG 12 accent |
| `sdg16` | `#1F7BC4` | SDG 16 accent |

Status colours (dashboards only): pending = amber, verified/approved = a muted green, rejected = red. Always pair colour with a text label. Never colour alone.

SDG colours are for: card borders, small numerals, hover glows, thin underlines, tiny badges. **Never** as page backgrounds or large fills.

## 3. Typography

| Role | Face (suggested) | Style |
|---|---|---|
| Display "SHORT FILM" | Anton or Bebas Neue | Huge, cream, tight leading, uppercase |
| Script "Competition" | Yellowtail or Mr Dafoe (bold brush script) | Red, slanted, overlapping the lower edge of SHORT FILM |
| Body and UI | A clean sans (Inter or similar) | Cream, comfortable line height |
| Labels and taglines | Body sans, uppercase | Wide tracking ~0.3–0.35em, small |

### The signature lockup (do not redesign)
"SHORT FILM" in massive cream display type, with "Competition" in bold red brush script crossing its lower edge at a slight upward angle, with a brush-stroke underline swoosh. This treatment comes straight from the poster and is the centrepiece. It appears in the hero and, smaller, in the nav wordmark and footer. Do not replace it with a different concept. Do not literally copy the poster's vertical layout.

Scale guidance: hero title fills most of the viewport width on desktop; on mobile it stacks and stays large. Section headings are large display type. Body copy stays modest, and contrast carries the hierarchy.

## 4. Imagery and backdrop

Three textless, AI-generated backdrops, all amber-on-black film-set scenes:

| File | Source scene | Used for |
|---|---|---|
| `bg-desktop.webp` | Sunset city, camera on left, chair on right, empty dark upper centre | Main desktop backdrop (hero and site-wide base) |
| `bg-mobile.webp` | Same scene, portrait 9:16, empty dark top half | Main mobile backdrop |
| `bg-story.webp` | Filmmaker silhouette, spotlight beam, chair, reels | Secondary backdrop for the Competition / SDG sections |

Rules:
- Store in `/public/cinema/`. WebP, target ≤ 300 KB each. Serve via `next/image`, hero image with `priority`.
- The backdrop is **fixed** behind the site. A dark overlay increases with scroll: bright in the hero, about 85% dark in content sections so text always stays readable.
- Mobile uses the portrait image, never a squashed landscape crop.
- Keep the empty dark area behind headline text. Never place text over the busy bottom corners.
- Dashboard pages (participant, admin, jury) use a near-solid dark backdrop with the image barely visible or omitted.
- Images contain no text. If replaced, new images must also be textless.

## 5. Atmosphere layer

| Element | Behaviour |
|---|---|
| Film grain | Fixed, very low opacity, subtle animation, no pointer events |
| Vignette | Fixed radial darkening at the edges |
| Light leak | Soft amber glow behind the hero title and at section transitions. Used sparingly. |
| Letterbox | Thin black bars top and bottom of the hero (cinema frame feel) |
| Film strip divider | Horizontal strip with sprocket holes, drifting very slowly (60s+ loop). One between major sections at most. |
| Dividers | 1px, cream at ~12% |

Grain and light effects turn off or reduce under `prefers-reduced-motion` and on low-power devices.

## 6. Layout

- Wide margins, generous vertical spacing between sections, large type, thin dividers.
- Editorial asymmetry is welcome. Avoid strict symmetrical card grids.
- Content width for reading text is limited (~65 characters). Display type may go full-bleed.
- Cards are used **only** where they truly help (the four SDG tiles, dashboard panels). No card-inside-card. No card grids for ordinary content.
- Corners: small radius (0–4px) or square. No pill or blob shapes.
- Forms: large inputs, one step at a time, thin borders, clear focus states.

## 7. Components

Custom only. No third-party component library look.

- **Button**: solid red (primary) and outline cream (secondary). Uppercase, tracked label. Hover: subtle light shift, no bounce.
- **SectionHeading**: small tracked label above a large display title, with an optional thin divider.
- **StatBlock** (event numbers): huge numeral plus tiny tracked caption (3 MIN, 2–7, ₹500, 7 OCT).
- **SDGCard**: large card with big SDG number in its accent colour, name in cream, thin accent border, hover reveals a short description with a soft accent glow.
- **Stepper**: numbered steps for registration, thin line, active step in red.
- **Timeline** (participant): vertical or horizontal steps with states: done (filled), current (red ring), upcoming (hollow).
- **StatusBadge**: small text pill with a status word (Pending, Verified, Rejected, Submitted...).
- **DataTable** (admin): dense, charcoal rows, thin dividers, sticky header, sortable and filterable.
- **Form fields**: label above, helper text below, inline validation messages in plain language.
- **Toast / inline notices**: minimal, cream on charcoal, red for errors.

## 8. Motion (Framer Motion)

Cinematic and **restrained**. Nothing bounces, springs wildly or scales aggressively.

Allowed:
- Hero title reveal: line by line, slow (about 0.8–1.2s), ease-out.
- Scroll reveal: fade plus small upward move.
- Film strip: very slow continuous drift.
- SDG card hover: soft glow and description reveal.
- Page transitions: short crossfade.
- Backdrop overlay darkening tied to scroll.

Not allowed: bouncing, parallax overload, long staggered cascades on every element, autoplaying sound, infinite pulsing CTAs.

All motion respects `prefers-reduced-motion` (fall back to instant or simple fades).

## 9. Page-level guidance

### Home
1. **Hero**: full viewport, letterboxed, backdrop plus light leak. Eyebrow "REAL STORIES | BRIGHTER TOMORROWS". SHORT FILM / Competition lockup. Tracked tagline. CTAs: **REGISTER YOUR TEAM** (red), **EXPLORE THE SDGs** (outline).
2. **Numbers**: four huge stat blocks on a clean band (3 MIN / 2–7 / ₹500 / 7 OCT). One short paragraph. No repeated large paragraphs.
3. **The Four Stories**: SDG section with four large cards (see below).
4. **How it works**: a short, simple sequence (Register → Payment verified → Submit film → Jury → Results). No invented dates.
5. **Closing call to action**: large type, one red button.
6. Film strip dividers between sections 1/2 and 3/4 only.

### SDG section ("THE FOUR STORIES")
Four large visual cards: 09, 11, 12, 16, each with its name and accent. Hover or tap reveals a short description. Cinematic imagery, restrained accent colour. Mobile: swipeable or stacked large tiles, tap to expand.

### The Competition (About)
Purpose, who can join (all SUAS students, inter-branch teams encouraged), the four themes, proposed award categories (marked subject to finalization), and proposed criteria. Editorial layout with large pull-quotes.

### Guidelines
Only proven facts: max 3 minutes, team of 2–7, ₹500 per team, four SDG themes, proposed evaluation criteria, deadline 7 October 2026. Missing rules appear as clearly marked "To be announced / Details will be shared with registered teams" blocks. No invented specs.

### Register
Multi-step flow, one focused step per screen (see `flows.md`). Cinematic header, calm form body.

### Login
Minimal, a single email OTP form. Small "Login" in the nav, visually separated from the main links.

### Dashboards
Calm, high-legibility, near-solid dark. See `flows.md`.

## 10. Navigation

Minimal: Home · The Competition · SDG Themes · Guidelines · Register. **Login** is a smaller, separated action on the right. Wordmark on the left uses the SHORT FILM / Competition lockup. On mobile: a full-screen dark menu with large type.

## 11. Responsive rules

- Design mobile as its own experience (the poster is vertical, so the mobile layout should feel natural).
- Breakpoints: mobile-first; check ≈390, 768, 1024, 1440+.
- Hero title: on mobile, SHORT and FILM stack big, "Competition" script overlaps beneath.
- Tables (admin) become stacked detail cards on mobile, or scroll horizontally inside their own container.
- Touch targets ≥ 44px. Forms comfortable with one hand.
- Registration is used mostly on phones (QR from the poster): it must be excellent on mobile.

## 12. Accessibility

- Text contrast meets WCAG AA against the dimmed backdrop. Verify over the brightest backdrop regions.
- Visible focus rings (red or cream).
- Status never conveyed by colour alone.
- Semantic headings, labelled form fields, keyboard-navigable steppers and menus.
- Motion respects reduced-motion. No flashing effects.
- Alt text for meaningful imagery. Decorative atmosphere elements are hidden from assistive tech.

## 13. Do / Do not

**Do:** large typography, whitespace, thin dividers, amber lighting, subtle grain, slow motion, sparing use of red, poster-derived lockup.

**Do not:** purple/blue "AI" gradients, neon or cyberpunk, glassmorphism, heavy rounded cards, excessive glow, emoji or icon clutter, colourful SDG-poster backgrounds, generic dashboard gradients, bouncing animations, stock "college fest" look, cramming everything into the hero, inventing event rules for copy.

## 14. Copy tone

Short, confident, cinematic. Sentences like film titles. Present tense. No hype, no exclamation marks. Plain language in forms and errors. Where a fact is unknown, say so ("To be announced"), do not fill with filler.

Key lines: REAL STORIES | BRIGHTER TOMORROWS · FOUR GOALS. COUNTLESS PERSPECTIVES. · YOUR STORY CAN MAKE A DIFFERENCE. · YOUR STORY MATTERS · REGISTER YOUR TEAM · EXPLORE THE SDGs · THE FOUR STORIES · ATTRACTIVE PRIZES.
