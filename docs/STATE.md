# MathQuest 7 — Current Project State

This is the current operational snapshot for agents/developers. Update this file after material merges that change product behavior, architecture, deployment, privacy posture, curriculum structure, or major priorities.

Do not store secrets, credentials, learner records, parent emails, or other PII here.

## Current production release

- Version: `0.11.0`
- Release label: `repo-restructure`
- Production branch: `main`
- Hosting: GitHub Pages
- Repository: `gymkathirza/MathQuest7`

The UI reads `version.json` and should display the current deployed version.

## Repository layout

Files are grouped by category (as of `0.11.0`):

- Web root (kept at repo root for the GitHub Pages URL and service-worker scope): `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `config.js`, `version.json`, `PRIVACY.md`.
- `css/` — `app.css`.
- `js/` — `app.js`, `curriculum.mjs`, `daily-session.mjs` (modules reference web-root files via `new URL('../file', import.meta.url)`).
- `docs/` — this file plus `MEMORY.md`, `VERSIONING.md`, `TEST_CREATION_BASELINE.md`, `SESSION_GENERATION_SPEC.md`, `session-generation-schema.json`, `README_V07.md`, `REGISTRATION_SETUP.md`, `TESTING.md`.
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
- roadmap navigation: any unlocked day (current or previously completed) is clickable to revisit/replay; locked future days stay gated
- hover/focus helper tooltips on the header badges (XP, streak, timer, version), hero buttons, phase steps, and day tiles
- animated conceptual illustrations on Learn pages (number-line slide for integer addition, Tug-of-War for different signs, sign-rule cycle for signed multiply/divide), with a prefers-reduced-motion fallback
- healthy-break session timer: the header shows elapsed practice minutes only (no "/60:00" countdown, to avoid rushing); a dynamic hover tooltip encourages breaks. Every 20 minutes of active practice a top toast appears and a full-screen break overlay asks the learner to choose a 5/7/10-minute screen break, then freezes the UI with a countdown (20-20-20 rule, move/hydrate prompts) before unlocking. Break time is excluded from the practice-minute counter. Guidance is based on CDC/AAP screen-break recommendations. The goal is ~60 min of practice per concept with regular active breaks, not continuous screen time.
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

## Last state refresh

This state snapshot was refreshed at production version `0.11.0` (`repo-restructure`): reorganized the repo into `css/`, `js/`, and `docs/` (web-root PWA files intentionally kept at root), added an always-on maintenance rule at `.cursor/rules/mathquest-maintenance.mdc`, and added the live GitHub Pages link to the README. Behavior is unchanged from `0.10.0` (`healthy-break-timer`: elapsed-minutes practice timer, dynamic timer tooltip, recurring 20-minute break toast, and choose-your-length 5/7/10-minute UI-freezing break overlay grounded in CDC/AAP screen-break guidance), which built on `0.9.0` (completed-day replay navigation, hover tooltips, Learn-page animations) and `0.8.0` (UI wired to the canonical 3/4/3 daily benchmark).
