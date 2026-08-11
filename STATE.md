# MathQuest 7 — Current Project State

This is the current operational snapshot for agents/developers. Update this file after material merges that change product behavior, architecture, deployment, privacy posture, curriculum structure, or major priorities.

Do not store secrets, credentials, learner records, parent emails, or other PII here.

## Current production release

- Version: `0.7.1`
- Release label: `session-generation-contract`
- Production branch: `main`
- Hosting: GitHub Pages
- Repository: `gymkathirza/MathQuest7`

The UI reads `version.json` and should display the current deployed version.

## Current product structure

MathQuest 7 is a browser/PWA-style Grade 7 math learning game with a Summer Quest curriculum path.

Current design includes:

- four-week / 20-day curriculum roadmap
- NC Grade 7 domain organization
- daily warm-up/review
- concept teaching before assessment
- guided interactive practice
- independent generated practice
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

This state snapshot was created for repository-native agent handoff at production version `0.7.1`.
