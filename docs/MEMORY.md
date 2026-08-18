# MathQuest 7 — Durable Project Memory

This file records long-lived product and engineering decisions that future agents/developers should preserve unless an approved change intentionally replaces them.

Do not store secrets, credentials, real learner records, private emails, or other PII here.

## Product identity

MathQuest 7 is a non-commercial educational project built to improve the learning experience for kids preparing for Grade 7 math.

Core trust commitments:

- no ads
- no in-app purchases
- no scams/misleading payment requests
- no commercial tracking by MathQuest
- no sale of learner data
- minimize PII collection
- make local data clear and erasable by parents

The project is inspired by game experiences such as fantasy/RPG, building, Minecraft-like progression, and Roblox-style adventure, but it should remain an original educational experience rather than imitating a specific copyrighted game.

## Target learner and experience

Primary learner: a general student entering Grade 7, starting from accessible prerequisite-level content and increasing in complexity based on demonstrated progress.

The experience should:

- teach before testing
- explain ideas in plain language
- use visuals, animations, manipulatives, and touch interactions
- allow guided retry until the learner understands
- celebrate correct work without making mistakes feel punitive
- adapt difficulty based on performance
- build confidence through visible progression
- support roughly 1-hour daily learning sessions with a midpoint break
- track **active practice time of the day** (not wall-clock): start when the student opens the app for the day; pause during healthy-break overlays, while the browser tab is hidden/minimized, after 5 minutes without interaction (away), and while Parent / Admin is open; reset on each local calendar day
- Open-ended mastery (Day 21+) keeps a separate **per-calendar-day active practice log** (`masteryPracticeByDay`): each visit’s stopwatch resets when the student starts mastery practice, but daily totals accumulate; away/break time is excluded; Parent/Admin sees a Day 21+ table; the student header shows yesterday + today so far. The existing 20-minute healthy-break / 20–20–20 rule still applies to overall active practice
- XP is permanent progress flavor (titles); **coins** are spendable cosmetic currency for **My Realm** buildings, pets, and pet skins; **streak** multiplies coin payouts only (×1.5 at 5+, ×2 at 10+) and never replaces the 80% + exit-ticket unlock gate
- Coins never unlock lessons, skip exit tickets, or buy answers — rewards celebrate practice (correct answers, day clears, healthy breaks)
- Day-clear coin credit is tracked in local `state.dayClearCoinClaimed` (per topic id). Live clears mark the day; a one-time home claim can grant **coins only** for already-cleared days missing that mark (idempotent; never double-pays)
- My Realm store uses **Buildings / Pet Store / Pet Skins** tabs; **Free Preview** is always available (even with 0 coins) and never spends currency
- after the 20-day spine is cleared, unlock an **Open-Ended Mastery Quest** that recaps all NC.7 domains and offers endless mixed advanced practice (harder 2·4·4 tier mix) so learning continues without boredom
- Parent/Admin may set a separate **mastery replay target** (10/20/40/unlimited) controlling how much practice is expected when revisiting completed days or the open-ended quest; this does not replace the first-time Exit Ticket practice target
- Parent/Admin and student UIs share a **strengths / improvements / improvement-plan** insight model derived from mastery, accuracy, and the error log; open-ended fine-tuning can be **auto**, **manual** (parent pins), or **blend**
- Improvement-plan **Practice** is **student-only**. Parent/Admin panels show the same plan and GIF-style step previews as read-only so adults cannot start practice or alter progress from that view
- Student boost practice for a plan day opens a **granular GIF-style animated walkthrough** (`js/coach-visuals.mjs`, CSS animations — no binary GIF assets required for offline PWA) before guided/independent practice; after answers save, mastery/scores update and strengths/improvements **recalibrate** live
- the 20-day spine is an intro-depth UCPS/NC.7 coverage path; deeper objectives (compound probability, MAD/IQR, 3D surface area/volume, fractional unit rates, etc.) remain documented gaps for future lessons

## Curriculum baseline

Reference broad North Carolina Grade 7 standards and Union County Public Schools' curriculum direction as a syllabus guide, without claiming official affiliation or endorsement.

Four-week Summer Quest spine:

- Week 1 — The Number System (`NC.7.NS`)
- Week 2 — Ratios & Proportional Relationships (`NC.7.RP`)
- Week 3 — Expressions & Equations (`NC.7.EE`)
- Week 4 — Geometry & Statistics/Probability (`NC.7.G`, `NC.7.SP`)

The four-week path is a foundation; the product should continue into generated/adaptive mastery rather than ending after Week 4.

## Pedagogical model

Canonical daily pacing:

- 15 min — review + mini-lesson
- 30 min — guided + independent practice
- 15 min — error analysis + exit ticket

Canonical flow:

`Warm-up → Learn → Watch/Visualize → Guided Practice → Independent Practice → Error Analysis → Exit Ticket → Reward/Review`

Named strategies to preserve where pedagogically appropriate:

- Number Line
- Tug-of-War for different-sign integer addition
- KCC / Keep–Change–Change for integer subtraction
- PEMDAS
- common denominator reasoning
- Keep–Change–Flip for fraction division
- unit rates / constant of proportionality
- inverse operations / balance model

Default benchmark instruction: work without a calculator unless calculator use is part of the learning target.

## Test-generation contract

A canonical daily core benchmark has exactly 10 questions:

- 3 standard/basic
- 4 complex/multi-step
- 3 real-world NC-context word problems

Use educational/fictitious contexts involving locations such as Monroe, Waxhaw, Indian Trail, Charlotte, Marshville, Weddington, and Union County.

Parents can request additional practice beyond the core 10. Additional questions should be generated dynamically and remain aligned to the current learning target.

## Mastery philosophy

Progression is mastery-based, not exposure-based.

- Next lesson unlock threshold: at least 80% mastery.
- Passing the exit ticket is also required.
- Require enough attempts/evidence before marking mastery.
- A failed exit ticket routes back to learning/practice.
- Previously learned concepts should return through warm-ups/spaced review.

100% may be treated as a stronger/gold mastery state, but 80% is the minimum advancement threshold unless a future approved pedagogical decision explicitly changes it.

## Parent experience

Parent Portal is intended to provide:

- progress/mastery visibility
- accuracy and challenge counts
- best streak / XP-style summaries
- practice-volume controls
- progress export
- learning reset
- local parent PIN
- Clear All MathQuest Data control

Future parent features may include richer session history or recommendations, but any cloud/account architecture must be intentionally designed and privacy-reviewed before activation.

## Data architecture

Current product direction is local-first.

Learner game state is stored in browser/device storage. GitHub Pages serves the static application but is not the MathQuest learner-progress database.

Do not describe this as literally “no data leaves the device,” because ordinary HTTPS requests go to GitHub Pages to load the site. The accurate promise is that MathQuest does not currently upload/synchronize learner progress to a MathQuest backend.

Cross-device synchronization is not currently part of the local-only model.

## Repository and delivery model

Repository: `gymkathirza/MathQuest7`

Production hosting: GitHub Pages.

Production changes flow through feature branches and pull requests into `main`.

Two workflow concepts exist:

- validation/smoke testing
- GitHub Pages deployment

The safer desired architecture is validation first, deployment only after successful validation.

## Versioning decision

The product version is visible in the UI and sourced from `version.json`.

Every deployed app behavior/file change must be versioned. `VERSIONING.md` and CI define/enforce the exact rule.

Because the service worker is cache-first, the `sw.js` `CACHE` name must be pinned to `mathquest7-v<version>` on every deployed change, or returning users keep seeing a stale build; CI enforces this and `version.json` is served network-first so the version badge is always accurate. This was a real defect: several releases shipped without changing the cache name, so updates did not reach already-visited browsers.

## Engineering philosophy

Important product requirements should live in the repository and, where possible, be enforced with tests. Do not depend on old chat conversations as the only record of a requirement.

For randomized learning content, prefer parameterized generators plus repeated smoke tests over a tiny fixed question bank.

When a test uncovers a rare generator defect, fix the generator rather than weakening the invariant.

## Repository organization

Files are grouped by category rather than dumped at the repo root: `css/` for styles, `js/` for ES-module app logic, `docs/` for documentation and contracts, `tests/` for automated tests. The GitHub Pages web-root PWA files (`index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `config.js`, `version.json`, `PRIVACY.md`) are intentionally kept at the repository root because the deployed site URL and the service-worker scope depend on them being there. This grouping should be preserved; see `.cursor/rules/mathquest-maintenance.mdc` and `AGENTS.md` for the enforced conventions.

## Handoff philosophy

Future agents should be able to begin from the repository alone. Read `AGENTS.md` first, then `docs/STATE.md`, followed by the detailed curriculum/privacy/versioning contracts in `docs/`.
