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

## Engineering philosophy

Important product requirements should live in the repository and, where possible, be enforced with tests. Do not depend on old chat conversations as the only record of a requirement.

For randomized learning content, prefer parameterized generators plus repeated smoke tests over a tiny fixed question bank.

When a test uncovers a rare generator defect, fix the generator rather than weakening the invariant.

## Handoff philosophy

Future agents should be able to begin from the repository alone. Read `AGENTS.md` first, then `STATE.md`, followed by the detailed curriculum/privacy/versioning contracts.
