# MathQuest 7 — Test Creation Baseline

This document is the canonical pedagogical baseline for creating, reviewing, and testing MathQuest 7 daily sessions. It consolidates the decisions made during the design conversation so future developers and AI agents can continue the same learning experience consistently.

## Product intent

MathQuest 7 is a non-commercial, ad-free, privacy-first learning game for students preparing to enter Grade 7. The experience should feel like an adventure game, not a worksheet, while preserving sound instructional practice.

## Curriculum spine

Use the broad North Carolina Grade 7 standards followed by Union County Public Schools as the curriculum reference:

- Week 1 — The Number System (`NC.7.NS`)
- Week 2 — Ratios & Proportional Relationships (`NC.7.RP`)
- Week 3 — Expressions & Equations (`NC.7.EE`)
- Week 4 — Geometry & Statistics/Probability (`NC.7.G`, `NC.7.SP`)

The four-week program is a starting path, not an endpoint. After the core roadmap, learning continues through generated review and mastery practice.

## Daily 60-minute learning model

Every daily session follows this approximate pacing:

1. **First 15 minutes — Review + Mini-Lesson**
   - Quick review of prior learning when applicable.
   - Teach one main concept at a time.
   - State the rule in plain language.
   - Name a memorable strategy when useful.
   - Show one or more worked examples.
   - Include a teacher tip, analogy, animation, number line, diagram, or interactive visual.

2. **Next 30 minutes — Guided + Independent Practice**
   - Guided interaction first.
   - Student must make the guided interaction correct before advancing.
   - Default benchmark set contains exactly **10 questions**:
     - **Level 1:** 3 standard/basic problems.
     - **Level 2:** 4 multi-step/complex problems.
     - **Level 3:** 3 real-world word problems using North Carolina context.
   - Parents may request additional generated practice after the canonical 10-question benchmark set.

3. **Final 15 minutes — Error Analysis + Exit Ticket**
   - Itemized correct/incorrect feedback.
   - Step-by-step explanation for missed questions.
   - Reuse the named strategy from the mini-lesson.
   - Let the learner retry or return to guided practice.
   - Finish with an exit ticket and preview of the next lesson.

The timing is a pacing guide, not a penalty mechanism. Understanding takes priority over speed.

## Core instructional strategies

### Number Line

- Adding a positive moves right/up.
- Adding a negative moves left/down.
- Subtracting can be interpreted as moving left, but signed subtraction should transition into KCC when appropriate.

### Tug-of-War

Use for adding integers with different signs:

- Compare the absolute values.
- Subtract the smaller magnitude from the larger magnitude.
- Keep the sign of the value farther from zero.

Example: `-7 + 10 = 3` because positive 10 wins the tug-of-war by 3.

### KCC — Keep, Change, Change

Use for subtracting integers:

1. **Keep** the first number.
2. **Change** subtraction to addition.
3. **Change** the second number to its opposite.

Examples:

- `6 - (-3) → 6 + 3 = 9`
- `-4 - 5 → -4 + (-5) = -9`

The UI should visually animate the two sign changes where possible.

### PEMDAS

Use explicitly for multi-step numerical/algebraic expressions when order of operations matters.

### Inverse Operations / Balance Model

Use for equations and inequalities:

- Undo operations in reverse order.
- Preserve equality by applying the same operation to both sides.
- When multiplying/dividing an inequality by a negative, reverse the inequality symbol.

## Daily benchmark generation contract

Generate exactly 10 canonical benchmark questions per daily core session.

### Level 1 — Standard Practice (3 questions)

- Direct application of the day's primary rule.
- Keep numbers manageable enough to practice the concept without calculator dependence.

### Level 2 — Complex Practice (4 questions)

Use combinations of:

- multiple operations
- signed numbers
- fractions/decimals
- exponents where grade-appropriate
- multi-step equations
- mixed representations
- multi-step proportional reasoning

### Level 3 — NC Real-World Application (3 questions)

Use realistic but clearly educational/fictitious contexts involving places such as:

- Monroe
- Waxhaw
- Indian Trail
- Charlotte
- Marshville
- Weddington
- Union County

Good contexts include:

- temperature
- elevation
- hiking/trails
- money or practice bank balances
- community events
- maps and scale drawings
- shopping/discounts
- probability games
- sample surveys

Location references are contextual only. Do not claim endorsements or specific facts about real students or businesses.

## Example integer session style

### Mini-lesson

Explain:

- Same-sign addition: add magnitudes and keep the sign.
- Different-sign addition: use Tug-of-War.
- Subtraction: transform with KCC.

### Example Level 1

- `-8 + (-4)`
- `-12 + 20`
- `7 + (-15)`

### Example Level 2

- `5 - (-9)`
- `-6 - 3`
- `-2 - (-10)`
- `4 - 12`

### Example Level 3

Use contexts such as:

- temperature change
- a practice account balance
- movement from below sea level to above sea level

## Feedback protocol

For each question:

- Correct: show clear positive feedback and explain the method briefly.
- Incorrect: do not just reveal the answer.
  - identify the likely misconception
  - apply the named strategy
  - show the steps
  - allow retry or guided remediation

Suggested error categories include:

- sign error
- operation error
- arithmetic error
- strategy not understood
- not sure

## Mastery and progression

- Next lesson unlocks only at **≥80% mastery**.
- The learner must also pass the exit ticket.
- Require sufficient evidence before declaring mastery; one lucky answer is never enough.
- Previously learned concepts reappear in warm-ups and review questions.
- If the learner misses the exit ticket, route back into practice/review instead of unlocking the next day.

## Parent-controlled practice

The parent can request additional questions beyond the default 10-question core benchmark.

Supported practice amounts should include at least:

- 10
- 20
- 40
- Unlimited/mastery-driven

Additional questions must continue to use the same topic and gradually vary values, representations, and contexts.

## Calculator policy

Default benchmark instruction: **work without a calculator**.

A calculator may only be permitted when the lesson explicitly teaches calculator use or when computation complexity would distract from the target concept.

## Teaching tone

- Supportive and confident.
- Never shame mistakes.
- Treat mistakes as diagnostic learning opportunities.
- Use age-appropriate game language without sacrificing mathematical clarity.
- Prefer phrases such as “Try this strategy” or “Let’s rebuild that step” over simply “wrong.”

## Visual and interactive support

Prefer conceptual animations and manipulatives over decorative GIFs.

Examples:

- animated number line movement
- elevator moving up/down
- KCC signs flipping
- algebra balance scale
- ratio groups forming
- geometry tiles filling an area
- colored probability objects moving into a bag

Celebration/retry animations can supplement the learning visual, but should not replace it.

## Privacy baseline

- No ads.
- No in-app purchases.
- No commercial tracking.
- No sale of learner data.
- Student learning progress remains in the learner's browser/device in the current architecture.
- Parent can erase MathQuest local data.
- Never add learner PII collection merely to support test generation.

## Test requirements for future changes

Automated tests should verify at minimum:

1. Every daily benchmark contains exactly 10 core questions.
2. The level distribution is exactly `3 standard / 4 complex / 3 NC word problems`.
3. Every question includes a correct answer and valid answer choices.
4. Word problems use an approved NC context/location.
5. The KCC lesson retains Keep–Change–Change wording and examples.
6. Integer addition retains Number Line/Tug-of-War remediation concepts.
7. The default calculator policy is no-calculator for benchmarks.
8. Mastery gate remains at 80% plus exit-ticket clearance.
9. Parent-requested extra practice does not alter the canonical 10-question core set.
10. Generated-question tests run repeatedly to detect malformed or duplicate answer sets.
11. Privacy tests fail if analytics/ad/tracking SDKs or unexpected PII fields are introduced.

This file, `SESSION_GENERATION_SPEC.md`, and `session-generation-schema.json` together are the source of truth for future MathQuest test/session generation.
