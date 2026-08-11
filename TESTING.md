# Testing MathQuest 7

The v0.7 branch includes a zero-dependency smoke test suite.

```bash
node --check app.js
node tests/smoke.mjs
```

The suite checks every curriculum generator 100 times, validates four answer choices with the correct answer present, verifies the KCC lesson, enforces the 80% + exit-ticket progression gate, checks the minimum-attempt evidence rule, validates parent practice thresholds, and bounds mastery between 0 and 100.

The same checks run automatically through `.github/workflows/ci.yml` on pull requests and pushes to `main`.
