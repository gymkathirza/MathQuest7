# MathQuest 7 v0.7 — Summer Quest

This release expands the prototype into a continuous 20-day / four-week Grade 7 preparation path.

## Student flow

Each day follows: Warm-up → Learn/Watch → Guided Practice → Independent Practice → Error Review → Exit Ticket. A 30-minute movement/water/eye-rest checkpoint is built into the 60-minute session timer.

## Progression

The next day remains locked until the current lesson reaches at least 80% mastery and the student passes the 3-question exit ticket. A minimum of five independent attempts is required before mastery can qualify, and parent-configured practice volume can require 10, 20, or 40 generated questions before the exit ticket appears.

## Curriculum

The 20 daily topics span NC.7.NS, NC.7.RP, NC.7.EE, NC.7.G, and NC.7.SP. Week 1 includes a dedicated Keep–Change–Change (KCC) lesson for subtracting integers with an animated sign-flip teaching visual.

## Dynamic practice

Problems are generated on-device, so the practice supply is not a fixed question bank. Parents can increase practice volume without a new deployment.

## Validation

Run:

```bash
node --check js/app.js
node tests/smoke.mjs
```

The smoke suite exercises all 20 generators 100 times each (2,000 generated problems) and verifies 80% mastery gating, required exit clearance, minimum evidence, parent practice thresholds, KCC presence, and mastery bounds.
