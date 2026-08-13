# MathQuest 7 — Agent Operating Guide

This repository is the source of truth for MathQuest 7. An AI agent or developer starting work here should not depend on prior chat history.

## Start here

Read these files in this order before changing production behavior:

1. `AGENTS.md` — operating rules and development workflow.
2. `docs/STATE.md` — current implementation/deployment status and known next steps.
3. `docs/MEMORY.md` — durable product decisions and design intent.
4. `docs/TEST_CREATION_BASELINE.md` — canonical pedagogy and test-generation rules.
5. `docs/SESSION_GENERATION_SPEC.md` and `docs/session-generation-schema.json` — machine/human daily-session contract.
6. `PRIVACY.md` — privacy promises and local-storage architecture (kept at web root because the site links to it).
7. `docs/VERSIONING.md` — mandatory versioning rules.
8. `.github/workflows/ci.yml` and `.github/workflows/pages.yml` — validation and deployment behavior.
9. `tests/` — executable requirements. Tests outrank stale prose when they intentionally encode a newer approved requirement.
10. `.cursor/rules/mathquest-maintenance.mdc` — always-on repo conventions (structure, docs, versioning) that must be followed for every change.

If documents disagree, stop and reconcile the conflict in the same PR rather than silently choosing one.

## Repository structure

Files are grouped by category. Put new files in the matching location:

- Web root (must stay at repo root for GitHub Pages URL + service-worker scope): `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `config.js`, `version.json`, `PRIVACY.md`.
- `css/` — stylesheets (`app.css`).
- `js/` — ES modules / app logic (`app.js`, `curriculum.mjs`, `daily-session.mjs`, `practice-timer.mjs`). Sibling imports use `./name.mjs`; anything the module needs from the web root (e.g. `version.json`, `sw.js`) is resolved with `new URL('../file', import.meta.url)`.
- `docs/` — all documentation and contracts (`STATE.md`, `MEMORY.md`, `VERSIONING.md`, `TEST_CREATION_BASELINE.md`, `SESSION_GENERATION_SPEC.md`, `session-generation-schema.json`, `README_V07.md`, `REGISTRATION_SETUP.md`, `TESTING.md`).
- `tests/` — automated tests (`smoke.mjs`).
- `.github/` — CI and deployment workflows; `.cursor/` — Cloud Agent environment and rules.
- `README.md` and `AGENTS.md` stay at repo root.

Do NOT move the web-root PWA files into subfolders: it breaks the deployed URL, the service-worker scope, and relative asset paths. If you add a deployed app file, also add it to `sw.js` `ASSETS`, the CI checks/version-guard pattern in `.github/workflows/ci.yml`, and `docs/VERSIONING.md`.

## Product mission

MathQuest 7 is a non-commercial, ad-free, privacy-first Grade 7 math learning game intended to improve the learning experience for kids. It should feel like a fantasy/RPG/building adventure rather than a worksheet while preserving sound instruction.

The curriculum spine follows broad North Carolina Grade 7 domains used by Union County Public Schools:

- `NC.7.NS` — Number System
- `NC.7.RP` — Ratios & Proportional Relationships
- `NC.7.EE` — Expressions & Equations
- `NC.7.G` — Geometry
- `NC.7.SP` — Statistics & Probability

Do not claim MathQuest is an official UCPS product or that UCPS endorses the project.

## Canonical learning loop

Default daily session is approximately 60 minutes:

- ~15 min: warm-up/review + concept mini-lesson + visual/animation
- ~30 min: guided interaction + independent/tiered practice
- ~15 min: error analysis + exit ticket + next-step preview

The child should encounter concepts in this order:

`Warm-up → Learn → Watch/Visualize → Guided Practice → Independent Practice → Error Review → Exit Ticket → Reward/Review`

Guided practice must allow retry until the learner succeeds. Never treat a wrong answer as a terminal failure.

Important named strategies include Number Line, Tug-of-War, KCC (Keep–Change–Change), PEMDAS, common denominators, Keep–Change–Flip for fraction division where appropriate, unit-rate reasoning, and inverse operations/balance models.

## Daily benchmark contract

The canonical core benchmark contains exactly 10 questions:

- 3 Level 1 standard/basic
- 4 Level 2 complex/multi-step
- 3 Level 3 NC-context real-world problems

Default instruction is no calculator for benchmark problems unless the lesson explicitly requires one.

Approved contextual locations include Monroe, Waxhaw, Indian Trail, Charlotte, Marshville, Weddington, and Union County. Contexts must be educational/fictitious; do not invent facts about real students, families, or businesses.

Parents may request 20, 40, or unlimited/mastery-driven practice. Extra questions come after the canonical 10 and must remain dynamically generated.

## Mastery/progression rules

- A next lesson must not unlock below 80% mastery.
- Exit-ticket clearance is also required.
- Require sufficient attempt evidence; one lucky response must never create mastery.
- Missed concepts should return through guided remediation and spaced review.
- Previously learned topics should appear in later warm-ups.

Do not lower progression thresholds merely to make tests pass.

## Privacy and child-safety baseline

Current architecture is local-first.

MathQuest itself must not add:

- ads or ad SDKs
- in-app purchases/payment requests
- commercial analytics/tracking SDKs
- sale of learner data
- unnecessary PII collection
- learner progress uploads without a separately approved architecture/privacy change

Student learning progress, XP, mastery, mistakes, settings, and the parent PIN are currently stored in the browser/device. GitHub Pages still receives ordinary HTTPS hosting requests; never claim literally that no network data leaves the device.

Parents must retain an understandable way to export/reset/clear MathQuest local data.

Never commit API secrets, service-role keys, private credentials, real student records, parent emails, or other PII to this public repository.

## Versioning is mandatory

Read `VERSIONING.md` before production changes.

Any PR changing a deployed app file must bump `version.json`. CI enforces this for production-facing files.

Use semantic versioning:

- PATCH — fixes/backward-compatible refinements
- MINOR — substantial backward-compatible learning/product features
- MAJOR — breaking state/schema/architecture changes

The production UI must continue to display the version from `version.json`.

Documentation/test/CI-only changes do not require a product version bump unless deployed behavior also changes.

## Development workflow

For every change:

1. Start from current `main`.
2. Create a fresh `agent/<description>` feature branch. Feature branches are commonly deleted after merge; never assume an old branch still exists.
3. Inspect relevant repo contracts before coding.
4. Implement the smallest coherent change.
5. Run a test → fix → retest loop.
6. Do not weaken/remove tests merely to make CI green unless the requirement itself was intentionally changed and the source-of-truth docs are updated in the same PR.
7. Check branch-vs-main diff for unrelated changes.
8. Open a PR with scope, rationale, testing, privacy impact, state/migration impact, and version bump when applicable.
9. Wait for CI before considering the change complete.
10. After merge, update `STATE.md` if the implementation status, known gaps, architecture, or next priorities changed materially.

## Testing expectations

At minimum preserve:

- JavaScript/module syntax checks
- required static-file checks
- repeated randomized question-generation tests
- four unique answer choices with the correct answer present
- exact daily 3/4/3 benchmark distribution
- NC-context enforcement for Level 3
- 80% + exit-ticket progression gates
- KCC and named-strategy retention
- version-guard checks
- privacy/tracking regression checks when available

Randomized generators should be tested many times so rare malformed/duplicate cases are caught.

## Deployment

Production is GitHub Pages from `main` using `.github/workflows/pages.yml`.

`Validate MathQuest` is CI. `Deploy MathQuest 7 to GitHub Pages` publishes the site. If deployment architecture changes, update `STATE.md` and the relevant workflow documentation.

Service-worker caching can make an iPad show an older release. Production changes that alter cached assets must consider cache version/update strategy.

## State and memory maintenance

Documentation must be kept current as part of the same change (see also `.cursor/rules/mathquest-maintenance.mdc`):

- `docs/MEMORY.md` stores durable decisions that should remain true across many releases. Do not fill it with transient task status.
- `docs/STATE.md` stores the current snapshot: version, architecture, what is implemented, open gaps, active operational concerns, and recommended next work. Update it after any material change.
- `README.md` is the public-facing overview. Update it whenever user-facing capabilities, how-to-play, structure, or the deployment/link change.

Neither `docs/MEMORY.md` nor `docs/STATE.md` may contain secrets, private learner data, personal credentials, or hidden chain-of-thought/reasoning.

## Working principle

Repository contracts + executable tests are the durable memory of the project. Chat history is supplemental only.
