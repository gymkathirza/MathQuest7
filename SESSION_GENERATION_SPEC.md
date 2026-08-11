# MathQuest 7 Daily Session Generation Specification

This document is the canonical contract for generating daily Summer Quest sessions. Future maintainers and AI agents should preserve this structure unless the curriculum is intentionally revised.

## Curriculum framework

MathQuest 7 follows the broad North Carolina Grade 7 math standards used by Union County Public Schools:

- Week 1: Number System (`NC.7.NS`)
- Week 2: Ratios & Proportional Relationships (`NC.7.RP`)
- Week 3: Expressions & Equations (`NC.7.EE`)
- Week 4: Geometry & Statistics/Probability (`NC.7.G`, `NC.7.SP`)

## Daily 60-minute cadence

- **15 minutes — Mini-Lesson / Review**
  - Review prior learning when applicable.
  - Teach one core idea.
  - Name the strategy when useful (for example KCC, PEMDAS, Tug-of-War, inverse operations).
  - Include at least one worked example.
  - Include a visual analogy, animation, or teacher tip.
- **30 minutes — Practice**
  - Exactly **10 benchmark problems** by default.
  - Level 1: 3 standard practice problems.
  - Level 2: 4 multi-step / complex problems.
  - Level 3: 3 real-world word problems using North Carolina context.
- **15 minutes — Error Analysis + Exit Ticket**
  - Itemized feedback for missed work.
  - Step-by-step remediation using the named strategy from the mini-lesson.
  - Exit ticket and next-day preview.

## Practice generation rules

### Level 1 — Standard Practice

Generate exactly 3 problems focused on the day's primary rule or skill.

### Level 2 — Multi-Step / Complex

Generate exactly 4 problems. These may include multiple operations, fractions, decimals, exponents where grade-appropriate, mixed representations, or multi-step reasoning.

### Level 3 — NC Real-World Application

Generate exactly 3 word problems. Rotate naturally among locations such as:

- Monroe
- Waxhaw
- Indian Trail
- Charlotte
- Marshville
- Weddington
- Union County

Locations should be context only. Do not imply endorsement, school affiliation, or specific facts about a real student.

## Feedback protocol

For each answer:

- Mark correct answers clearly.
- For incorrect answers, explain the reasoning step by step.
- Reuse the named lesson strategy where applicable.
- Encourage correction and retry instead of immediately moving on.
- Track performance locally in the browser.

The next lesson does not unlock until the current topic has at least **80% mastery** and the exit ticket is passed.

## Benchmark rules

- Benchmark problems should be completed **without a calculator** unless a lesson explicitly teaches calculator use.
- Use a supportive teacher voice.
- Prefer visual explanations, number lines, diagrams, drag/drop, animations, or manipulatives when they improve understanding.
- Avoid relying on answer memorization. Generate fresh values and contexts.

## Session timers

The 60-minute structure is a pacing target rather than a forced countdown that penalizes the learner. The UI may show suggested phase timing and reminders, but understanding takes priority over speed.

## Extensibility

Parents may request additional practice beyond the default 10 problems. Additional problems should preserve the same skill focus and gradually vary values/contexts. Extra practice does not replace the canonical 3/4/3 benchmark set used for the daily core session.
