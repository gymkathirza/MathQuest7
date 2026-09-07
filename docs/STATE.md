# MathQuest 7 — Current Project State

This is the current operational snapshot for agents/developers. Update this file after material merges that change product behavior, architecture, deployment, privacy posture, curriculum structure, or major priorities.

Do not store secrets, credentials, learner records, parent emails, or other PII here.

## Current production release

- Version: `0.26.0` (pending PR — ux-student-admin)
- Release label: `ux-student-admin`
- Production branch: `main`
- Hosting: GitHub Pages
- Repository: `gymkathirza/MathQuest7`

The UI reads `version.json` and should display the current deployed version.

## Repository layout

Files are grouped by category (as of `0.11.0`):

- Web root (kept at repo root for the GitHub Pages URL and service-worker scope): `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `config.js`, `version.json`, `PRIVACY.md`.
- `css/` — `app.css`.
- `js/` — `app.js`, `curriculum.mjs`, `daily-session.mjs`, `practice-timer.mjs`, `mastery-session.mjs`, `learner-insights.mjs`, `coach-visuals.mjs`, `rewards.mjs`, `seasonal.mjs` (modules reference web-root files via `new URL('../file', import.meta.url)`).
- `docs/` — this file plus `MEMORY.md`, `VERSIONING.md`, `TEST_CREATION_BASELINE.md`, `SESSION_GENERATION_SPEC.md`, `session-generation-schema.json`, `README_V07.md`, `REGISTRATION_SETUP.md`, `TESTING.md`, and `docs/superpowers/` design/plan notes.
- `assets/realm/` — license-safe isometric SVG art for My Realm buildings/pets/skins (see `assets/realm/LICENSE.md`).
- `packages/mathquest7-session/` — pre-release MIT npm library `@gymkathirza/mathquest7-session` (pure curriculum / daily-session / practice-timer ES modules for GitHub Packages). Versioned separately from PWA `version.json`.
- `tests/` — `smoke.mjs`. `.github/` — CI/deploy. `.cursor/` — Cloud Agent environment and always-on rules.

The web app is deployed live via GitHub Pages at `https://gymkathirza.github.io/MathQuest7/`.

## Current product structure

MathQuest 7 is a browser/PWA-style Grade 7 math learning game with a Summer Quest curriculum path.

Current design includes:

- four-week / 20-day curriculum roadmap
- NC Grade 7 domain organization
- daily warm-up/review
- concept teaching before assessment
- guided interactive practice
- independent practice delivered as the canonical 10-question 3/4/3 daily benchmark (level-labeled Level 1/2/3, NC-context word problems, no-calculator reminder, strategy hints)
- itemized error-analysis summary after each benchmark set
- roadmap navigation: any unlocked day (current or previously completed) is clickable to revisit/replay; locked future days stay gated. The "Start / Continue Today" button shows the target day number, e.g. "Start / Continue Today (Day 2)"
- header badges: hero title, XP, coins, streak, active daily practice-minutes timer, and app version, each with a hover/focus help tooltip. The version badge fetches `version.json` network-first through the service worker so it always reflects the deployed version. Crossing a hero-title XP tier shows a polite toast
- Correct practice feedback shows a coin-burst `+N 🪙` (plus streak-bonus copy when multiplier > 1); incorrect answers that clear a streak show a gentle inline “Streak reset — keep going!” note
- Warm-up (Day 2+) bridges “Last time: X. Today: Y.”; GIF boost steps show “Step N of M”; practice/exit surfaces live unlock progress (≥80% mastery + exit ticket)
- Companion pet celebrates on streak ≥ 3 correct, cheers on shorter correct streaks, and encourages on wrong answers (practice phase no longer idles-only)
- Parent / Admin: create/change PIN requires entering the new PIN twice (mismatch via alert/live error); mastery review and week skills show Exit Ticket ✓ passed / ✗ not yet beside mastery %; days-since-last-practiced when timestamps allow; focus-mode “what this means” blurb; practice targets show ≈ time estimates; read-only realm purchase/spend summary
- **My Realm** cosmetic shop with clear tabs (**Buildings**, **Pet Store**, **Pet Skins**): free **Preview** always works (even with 0 coins) and shows the item in the **bottom-right companion strip** on Home (same art language as practice) for ~3.5s, while the realm stage still updates; 12 buildings, 5 pets, pet skins. Shop/stage/strip use **isometric SVG art** (project-generated, vendored under `assets/realm/`). Owned active pet + recent buildings appear in a non-interactive **corner companion strip** on Home and during Learn/practice. Coins from correct answers (streak multiplies coins only), day clears (+100), completed healthy breaks (+25), and **Parent/Admin Award coins** (local presets/custom). Learners who cleared days before day-clear coins were tracked can use a one-time home **Claim missed day-clear coins** banner (`state.dayClearCoinClaimed`); live clears mark the day so it is not reclaimable. Rewards never unlock lessons or skip mastery
- Parent / Admin trophies row plus coins stat alongside XP/accuracy; **Award coins** card (50/100/200 presets + custom with confirm) persists via `save()` / `S.coins` only and appends a local `parentCoinAwards` audit log (last 20) shown on the dashboard
- **Seasonal Home banner** (`js/seasonal.mjs`): dismissible local seasons (first: **Back to school!** in Aug–Sep) with rotating cheer lines; a single centered emoji star marquee sits **inside the banner card** above Dismiss (transparent tray — no dark inset / PNG strip); no full-page star shower; `prefers-reduced-motion` safe; offline; no CDN
- **Accessibility (ARIA) baseline** (`0.24.0`): `lang=en`, skip link → `#main`, labeled Home/Lesson/Parent landmarks, polite `#feedback` + toast live regions, named answer groups, guided tokens as real buttons, phase `aria-current`, companion polite status text on pet react (decorative strip art hidden from AT), break dialog focus move/Tab trap/restore, Parent PIN `<label>` + `role="alert"` errors; durable rule `.cursor/rules/mathquest-accessibility.mdc`; plan notes in `docs/superpowers/plans/2026-08-28-aria-accessibility.md`
- **Readable light-surface text** (`0.24.1`): `.small` stays light (`#b9d6e7`) on dark navy UI, but lesson/boost/GIF/illus/exit/miss/feedback/praise light cards override `.small` to `#23313c` so GIF boost captions and teach copy meet WCAG-ish contrast
- **Clear English instructional copy** (`0.24.2`): learner-facing boost steps, teach captions, coaching plan lines, and strategy hints prefer plain Grade 7 words (or symbol + parenthetical meaning) instead of lone `→` / `≥` / middle-dot shorthand; math answer choices may still use standard symbols
- Every learner receives a free starter pet (`DEFAULT_PET_ID` Integer Fox via `ensureDefaultPet`); companion strip pet uses `overflow:visible` so celebrate/encourage motion + emoji bubble are not clipped across warm-up/learn/guided/practice/review/exit and after answers. Reactions survive `save()` re-renders via pending react + `setPhase({answerReact})`; emoji art fallback still animates
- Parent / Admin portal (renamed from "Parent"), PIN-gated: overall progress, Strengths, Improvements (GIF-style step previews, read-only), Improvement plan (read-only; no Practice buttons), Mastery review, miss-based focus areas, week mastery, syllabus coverage gap notes, Exit Ticket volume, mastery-replay target, open-ended focus mode (auto/blend/manual), and day pin checkboxes. Export/change PIN/reset/clear retained
- student home coaching plan card: positive praise + celebration animations for strengths; improvement plan with GIF step previews; **Practice Day N with GIF steps** (student-only) opens a granular boost walkthrough then practice; scores/mastery update and strengths/improvements recalibrate after each save
- hover/focus helper tooltips on the header badges (XP, streak, timer, version), hero buttons, phase steps, and day tiles
- animated conceptual illustrations on Learn pages (number-line slide for integer addition, Tug-of-War for different signs, sign-rule cycle for signed multiply/divide), with a prefers-reduced-motion fallback
- healthy-break active practice timer: the header shows today's accumulated active practice minutes only (no "/60:00" countdown). Time starts when the student opens the app for the day, pauses during screen breaks, while the browser tab is hidden/minimized, after 5 minutes of no interaction (away), and while the Parent / Admin portal is open, then resumes on return/activity. **Pause catch-up is capped** at `lastActiveAt + 5 min` so a missed visibility event cannot dump full wall-clock away time into `practiceMs`. Break overlays use a deadline (`breakEndsAt`) re-checked on tab visible; ending a break advances `nextBreakMin` to the next open threshold (no cascade popups). The counter resets each local calendar day. Every 20 minutes of active practice a top toast and full-screen break overlay offer a 5/7/10-minute screen break. Guidance follows CDC/AAP screen-break recommendations; the goal is ~60 min of real practice with regular active breaks, not continuous wall-clock screen time.
- Open-ended mastery practice log (Day 21+): each time the student starts open-ended practice the **visit** stopwatch resets to 0, while **daily** active mastery minutes keep accumulating for that calendar day (pauses on break / hidden tab / 5+ min away / Parent panel). Student header pill shows yesterday + today so far; Parent/Admin table lists Day 21, Day 22, … with active practice duration per date.
- completed-day mastery replay: revisiting a cleared day opens a recap + advanced 2·4·4 practice set (more multi-step + NC real-world) without re-locking progression; volume is driven by the Parent/Admin mastery-replay target
- Open-Ended Mastery Quest (beyond Day 20): unlocks only after all 20 days are cleared; recap + improvement plan; practice weighted toward automated weak areas and/or Parent/Admin pinned days (auto / blend / manual)
- error analysis/remediation
- exit tickets
- 80% mastery + exit-ticket progression gate
- dynamically generated questions
- parent-controlled extra practice volume
- KCC / integer-sign instructional strategy support
- version badge
- parent portal
- local progress storage
- local parent PIN
- export/reset/clear-all-data controls
- PWA/service-worker support
- GitHub Pages deployment

## Canonical daily session/test structure

Detailed source of truth: `TEST_CREATION_BASELINE.md`, `SESSION_GENERATION_SPEC.md`, and `session-generation-schema.json`.

Core daily benchmark:

- 3 Level 1 standard questions
- 4 Level 2 complex/multi-step questions
- 3 Level 3 NC-context word problems
- total = 10 canonical benchmark questions

Extra parent-requested questions come after those 10 and are generated dynamically.

As of `0.8.0`, the live student UI renders this canonical benchmark directly: `app.js` imports `generateDailyBenchmark` from `daily-session.mjs` and presents the tiered 3/4/3 set with level labels, NC context, strategy hints, a no-calculator reminder, and an end-of-set error analysis. Before `0.8.0`, the UI practice phase generated single one-off single-tier questions and did not consume the canonical generator; that gap is now closed and guarded by a smoke test.

Current approved pedagogy includes Number Line, Tug-of-War, KCC, PEMDAS, common denominators, signed-number rules, unit rates, proportional reasoning, and inverse operations as appropriate to each lesson.

## Data/storage state

Current learner data architecture is local-first:

- progress/mastery/XP/settings stored in browser/device storage
- parent PIN stored locally in browser/device storage
- no MathQuest cloud progress database is active
- no cross-device progress synchronization is active
- no advertising or commercial analytics SDK is intended

GitHub Pages still receives normal HTTPS requests required to serve the website. See `PRIVACY.md` for the precise privacy statement.

## Current CI/deployment state

Two workflow concepts are present:

1. `Validate MathQuest`
   - syntax checks
   - curriculum/randomized smoke tests
   - required-file checks
   - version bump enforcement for deployed application changes

2. `Deploy MathQuest 7 to GitHub Pages`
   - packages and deploys the static site from `main`

Known DevOps improvement: make production deployment depend on successful validation rather than allowing validation and deployment to start independently after a merge.

## Versioning state

`VERSIONING.md` is mandatory.

Current policy:

- production-facing app changes require a real `version.json` bump
- documentation/test/CI-only changes do not require a product version bump unless deployed behavior changes
- PATCH for fixes/refinements
- MINOR for substantial backward-compatible features
- MAJOR for breaking state/schema/architecture changes

CI contains a version guard for deployed application files.

## Current testing baseline

Expected automated invariants include:

- all curriculum topics initialize
- generated questions contain valid prompts and answers
- four unique answer choices with the correct answer present
- repeated randomized generation catches rare collisions
- canonical daily benchmark = exactly 10 questions
- daily distribution = exactly 3 standard / 4 complex / 3 word problems
- approved NC contexts for word problems
- KCC strategy remains available
- 80% mastery + exit clearance required to unlock the next lesson
- minimum evidence threshold prevents instant mastery
- parent practice controls work
- mastery remains bounded
- the student UI is wired to the canonical benchmark generator (`app.js` imports and calls `generateDailyBenchmark`, labels Level 1/2/3, and shows the no-calculator instruction)

A prior randomized CI failure exposed duplicate probability distractors; the generator was fixed rather than weakening the uniqueness test. Preserve that invariant.

## Current trust/privacy commitments

MathQuest is positioned as:

- non-commercial
- ad-free
- no in-app purchases
- no sale of learner data
- no commercial tracking by MathQuest
- privacy-first / local-first

Any future registration, cloud backup, analytics, notifications, or account system must not be enabled merely by adding frontend code. It requires a secure server-side architecture, explicit privacy update, and protection of secrets outside this public repository.

## Known product improvements / backlog direction

High-value next areas discussed:

- UX follow-ups deferred from `0.26.0`: pet nicknames (A6), seasonal challenge (A8), deeper error-strategy text (A9), stuck button (A11), polish A12–A14, mastery trend (B2), human-readable export summary (B5), custom practice presets (B7), phase time breakdown (B10)
- day-to-day topic sequencing narrative (Day 1 intro → Day 2 add/subtract → Day 3 multiply/divide, etc.) and a printable/exportable worksheet version of the daily benchmark, to fully match the Gemini tutoring transcript (the tiered 3/4/3 benchmark itself is now implemented in the UI)
- sequence Pages deployment after successful CI validation
- richer conceptual animations/manipulatives rather than decorative reaction GIFs
- deeper daily lesson content and remediation paths
- richer game/world progression, NPCs, bosses, inventory/build rewards
- spaced/adaptive review based on actual error patterns
- stronger parent session-history/recommendation views
- optional future accounts/cloud sync only after privacy/security architecture is deliberately approved

Do not assume all backlog items are approved for immediate implementation. Check the current user request and repository contracts first.

## Current agent handoff rules

A new agent should:

1. read `AGENTS.md`
2. read this `STATE.md`
3. read `MEMORY.md`
4. inspect the relevant detailed contract and tests
5. check current `main` and `version.json`
6. create a fresh feature branch
7. implement + test/fix/retest
8. open a PR and wait for CI
9. update this file if the merged change materially changes the snapshot

## npm packaging surface (pre-release)

- Package: `@gymkathirza/mathquest7-session` at `packages/mathquest7-session/` (MIT, `0.1.0-pre.0`, `"type":"module"`).
- Publishes to GitHub Packages (`https://npm.pkg.github.com`), not the PWA deploy path. Does not replace or dump the static site.
- Sources are copies of selected pure `js/` modules; bump the **npm** package version independently of `version.json`.

## Last state refresh

This state snapshot was refreshed at production version `0.26.0` (`ux-student-admin`): student coin-burst / streak-reset / hero-title toast feedback; warm-up bridge; boost Step N of M; smarter pet reactions; live unlock progress; Parent/Admin PIN double-confirm, exit-ticket badges, days-since-practiced, focus-mode help, practice time estimates, and read-only realm spend. Builds on `0.25.0` (`coach-plan-recovery`) and prior releases.
