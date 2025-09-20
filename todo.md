# FactCheck AI — Product + Design TODO

A premium, modern reimagining of the Hallucination Detector UI and brand. Dark shell, one pristine white Editor Card, and a totally new results experience built for clarity, trust, and polish. Monetization will be handled on the landing/pricing pass later.

---

## Brand & Visual Direction
- Mood: premium, calm confidence, editorial. Minimal color, precise spacing, subtle motion.
- Theme: dark application shell; a single white content surface (Editor Card) for text input.
- Typography
  - Headings: Reckless (already in repo) — high‑contrast, display feel.
  - Body/UI: ABCDiatype — geometric, readable at small sizes.
  - Scale: 16→18 body, 32/48/60 display with tight leading; comfortable 1.6 line height for copy.
- Color
  - Dark surfaces: neutral-950 / near-black; layered with white/5–15% fills.
  - Accents: ultra-sparing (neutral-black CTAs or refined brand hue later).
  - Semantic: emerald (supported), rose (refuted), slate/amber (insufficient/warn).
- Elevation & radius
  - Editor Card: rounded-2xl or sharp (toggle via token). Soft, long shadow; hairline borders.
  - Rows & chips: rounded-lg to rounded-xl with white/10 borders.
- Motion
  - Micro-transitions; opacity/blur for reveals; eased transforms on hover/press.

---

## Information Architecture
- App Shell: sticky top nav (brand, “Docs”, “Demos”, “Sign in”); minimal footer.
- Home (App): hero (dark) + Editor Card; results below.
- Landing (Marketing): high‑converting structure (see section below), separate from the app.
- Sessions (later): history of runs, exports, sharing.

---

## Core App Experience (Reimagined)

1) Editor Card (white)
- Long, clean surface to paste/type; borderless textarea with larger type.
- Helpers: word/char hint, placeholder copy that sets tone; Cmd/Ctrl+Enter to run.
- Optional inputs (later): URL import, file upload (docx/pdf), translation mode.

2) Results Overview
- Verdict Banner: doc‑level state (Supported / Needs attention / Inconclusive) + average confidence; “Proof attached” micro badge.
- Evidence Rail: horizontally scrollable chips by unique domain; favicon (later), credibility bar (later); hover preview of excerpt.

3) Claim Stream (rows, not boxes)
- Each row: status badge, short rationale, confidence, quick actions.
- Expand for details: concise why, linked sources, and a Fix Preview if “False”.
- Fix Preview: inline toggle or side‑by‑side diff (choose one — see open questions).
- Actions: Accept fix (updates Preview Panel), copy correction, open sources.

4) Preview Panel (document view)
- Inline highlights for supported/refuted spans; accept‑all; copy/export.
- Diff overlay when a fix is accepted; keyboard navigation between highlights.

5) Controls & Utilities
- Filters: Supported, Refuted, Insufficient; Sort by confidence/date.
- Toasts: Copied, Fix accepted, Export complete.
- Error/Empty states with human tone and next-step guidance.

---

## Landing Page (High‑Converting Template)
Based on your references, a black, luxurious marketing site with the following sections:

- Sticky Nav: brand wordmark; sections: Platform, Workflow, Resources, Pricing; CTA.
- Hero: bold headline (Reckless), subhead, primary CTA + secondary (demo/video).
- Social Proof: trusted by logos; marquee/rail.
- Value Metrics: 3–4 stats (speed, accuracy, teams using it, time saved).
- Why Choose Us (Benefits grid): 6–8 cards, minimal icons, real copy.
- Comparison (What others do vs what we do): side‑by‑side cards.
- How It Works: 3 steps, illustrated; microcopy focused on outcomes.
- Dashboard Preview: tasteful screenshots inside device/frame with gloss lighting.
- Pricing (later): 3‑tier with a decoy middle; FAQ; conversion CTAs.
- Testimonials: avatars, roles, short quotes; carousel or grid.
- FAQ: accessible accordion; short answers only.
- Final CTA Band: one‑liner value prop + strong CTA.
- Footer: product links, resources, legal, socials; newsletter box.

Typography & layout mirror the dark, premium examples you shared.

---

## Components & Files (Planned)

- Shell
  - `components/shell/Nav.tsx` — sticky, dark, glass blur.
  - `components/shell/Footer.tsx` — minimal, newsletter variant.

- App
  - `components/editor/EditorCard.tsx` — white card, textarea, shortcuts, hints.
  - `components/results/VerdictBanner.tsx` — high‑level verdict + confidence.
  - `components/results/EvidenceRail.tsx` — domain chips with hover preview.
  - `components/results/ClaimRow.tsx` — expandable row; statuses; actions.
  - `components/results/PreviewPanel.tsx` — inline highlights + accept fix.
  - `components/results/FixPreview.tsx` — inline vs side‑by‑side diff.
  - `components/results/Filters.tsx` — status filter + sort.

- Marketing (landing)
  - `app/(marketing)/page.tsx` — hero + sections.
  - `components/marketing/*` — logos rail, stats, benefits, steps, testimonials, FAQ, CTA band.

- Tokens
  - `lib/theme.ts` — radius, elevation, color ramps, motion durations.

---

## Technical Notes
- Next.js app router; keep API as-is; UI purely client-side for interactivity.
- Performance: defer heavy sections until first result; skeletons for rail/rows.
- Caching: memoize Exa queries per claim; cache model responses if feasible (later).
- Accessibility: semantic roles, keyboard nav (j/k to move, a to accept), focus rings.
- Internationalization (later): copy isolated; LTR/RTL safe layouts.

---

## Phases & Checklists

Phase 1 — Shell + Editor + Foundations (in progress)
- [x] Dark shell + hero and Editor Card (initial pass).
- [x] Verdict Banner, Evidence Rail, Claim Stream (MVP components).
- [x] Cmd/Ctrl+Enter to run; improved spacing & type scale.
- [x] Replace old Content Analysis card with new Preview Panel.
- [x] Add status filters + sort controls.

Phase 2 — Results Polish
- [x] Implement Fix Preview with diff highlighting; Accept fix → updates Preview Panel.
- [x] Evidence Rail: basic credibility meter (heuristic).
- [x] Source hover preview (snippet) and keyboard open (hover only for now).
- [x] Export: Markdown; copy all with attribution list.
- [x] Export: Doc (HTML-based) as interim for Word compatibility.
- [x] Skeleton loaders for Verdict, Evidence, Preview, and Claim rows.
- [x] Empty/error states with premium microcopy (idle tips, specific backend errors, no-sources case).

Phase 3 — Landing (Marketing)
- [x] Scaffold marketing page per template at `app/landing/page.tsx` (hero, logos rail, metrics, benefits, how it works, testimonials, FAQ, final CTA).
- [x] Typography polish & product preview frame with gloss; button micro‑interactions.
- [x] SEO/open‑graph; analytics events for CTA clicks.
- [x] Add Pricing page scaffold at `app/pricing/page.tsx` and link from nav.
- [x] Newsletter box (placeholder) with analytics.
- [ ] Replace placeholders with real assets (screenshots, logos, testimonials, final copy).
- [ ] Comparison section details and visuals (optional).

Phase 4 — A11y, Motion, QA
- [ ] Keyboard map (j/k nav, a accept, / focus input, g g top).
- [ ] Focus management on state change; ARIA for accordions and banners.
- [ ] Motion tuning; reduced‑motion safe fallbacks.
- [ ] Perf budget audit (JS/CSS size, font loading, LCP/INP targets).

Phase 5 — Observability & Feedback
- [ ] Client logs for latency per claim; error rate; source coverage.
- [ ] In‑app feedback widget; “report incorrect verdict”.

(Separate) Monetization — later with landing/pricing
- Gate free usage; upgrade CTAs; pricing page; checkout; plan limits visualized.

---

## Open Questions
- Editor Card corners: sharp vs rounded‑2xl (default is rounded‑2xl). Preference?
- Primary accent: keep neutral‑black CTAs or introduce brand hue now?
- Fix Preview: inline toggle vs side‑by‑side diff?
- Evidence credibility: show a simple meter or keep ultra‑minimal?

---

## Assets & Copy (to gather)
- Wordmark/logo directions (monogram + logotype, monochrome first).
- Domain logos for social proof; a short set of real testimonials.
- Product screenshots/animation for hero and “preview” section.
- Draft marketing copy (headline, subhead, benefits bullets, comparison claims, FAQs).

---

## Current Implementation Notes
- Added new components under `components/revamp/*` powering Verdict/Evidence/Claims.
- Fully switched to new Preview/Claim Stream; removed legacy components.
- Global background switched to dark; Editor Card stays white for focus and contrast.

---

## Quick Next Actions
- Decide on corners + accent + diff style (see Open Questions).
- Add analytics for Accept all, filter toggles, and Evidence clicks (if desired).
- Improve credibility model (maintain a small curated list + recency signals).
- Begin pricing design (structure only, no payments) if you want the page stub.

---

> This document is the single source of truth for design and delivery. Update it as decisions are made and phases complete.
