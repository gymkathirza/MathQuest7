# Harden + Delight + Admin Implementation Plan

> **For agentic workers:** Execute task-by-task with test loops. Checkboxes track progress.

**Goal:** Ship P0 hardening (practice/break timers, claim/preview safety), P1 seasonal “Back to school!” Home banner + star shower, and Parent/Admin coin-award audit trail — then open a PR.

**Architecture:** Pure helpers in `practice-timer.mjs` / `rewards.mjs` / new `seasonal.mjs`; UI wiring in `app.js` + `index.html` + `css/app.css`; local-only state; vendored/CSS effects only (no CDN).

**Tech Stack:** Vanilla ES modules, CSS animations, GitHub Pages PWA.

## Global Constraints

- Local-first / privacy: no analytics, no remote GIFs/CDNs for seasonal art.
- Coins remain cosmetic (never unlock lessons).
- Version bump deployed files + `sw.js` CACHE must match `version.json`.
- Respect `prefers-reduced-motion` for star shower / cheer loops.
- Preserve smoke invariants (3/4/3, 80% gate, NC contexts, KCC).

---

### Task 1: Cap background/idle catch-up + break cascade (Harden)

**Files:** `js/practice-timer.mjs`, `js/app.js`, `tests/smoke.mjs`

- [x] Cap `pauseSegment` / mastery flush so away time past `lastActiveAt + IDLE_PAUSE_MS` is not credited
- [x] On break end, set `nextBreakMin` to next threshold above current minutes (no cascade)
- [x] Persist `breakEndsAt`; on `visibilitychange` visible, sync countdown / end if due
- [x] Guard double `awardBreakBonus`
- [x] Smoke tests for capped pause + next-break scheduling

### Task 2: Claim / preview timer safety (Harden)

**Files:** `js/app.js`

- [ ] Clear preview timer on navigate away; claim button debounce / single-flight
- [ ] Smoke: claim remains idempotent (existing)

### Task 3: Seasonal Home banner + star shower (Delight)

**Files:** Create `js/seasonal.mjs`; Modify `index.html`, `css/app.css`, `js/app.js`, `sw.js`

- [ ] Season config: Back to school (Aug–Sep window), dismissible local key
- [ ] Home banner + encouraging CSS cheer frames; star shower particles
- [ ] Reduced-motion: no shower / static cheer
- [ ] Register module in SW ASSETS; smoke asserts seasonal module + banner mount

### Task 4: Parent coin award log + confirm (Admin)

**Files:** `js/rewards.mjs`, `js/app.js`, `index.html`, `tests/smoke.mjs`

- [ ] `parentCoinAwards` log on award; show last N in dashboard
- [ ] Confirm custom awards; toast with new balance (existing toast OK)
- [ ] Export includes log via full state JSON (automatic)

### Task 5: Version, docs, verify, PR

- [ ] Bump to `0.22.0`, sync SW + app fallback, STATE/MEMORY/README as needed
- [ ] `node --check js/app.js` && `node tests/smoke.mjs`
- [ ] Commit, push, `gh pr create`
