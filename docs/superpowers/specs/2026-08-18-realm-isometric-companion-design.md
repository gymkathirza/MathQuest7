# Realm isometric companion art — design

**Date:** 2026-08-18  
**Status:** Approved in chat; awaiting user review of this written spec  
**Version impact:** Product MINOR or PATCH bump when implemented (deployed assets + UI)

## Goal

Replace emoji-only My Realm visuals with a consistent **isometric diorama** look, and show owned rewards during practice so purchases feel present in the learning loop.

## Decisions (locked)

| Choice | Decision |
|--------|----------|
| Visual style | **C — Isometric diorama** |
| Practice placement | **1 — Corner companion strip** (bottom-right) |
| Asset sourcing | **C — Hybrid**: free CC0 isometric buildings + generated pets/skins |
| Surface coverage | **1 — One art system everywhere**: My Realm shop cards, stage, Free Preview, and practice strip |

## Non-goals (this change)

- Syllabus / week-gated building unlocks or coin-pacing redesign
- Animated pet idle loops (GIF/Lottie) — may follow later on the same asset paths
- External CDN or runtime fetch of art (privacy + offline PWA)
- Changing coin economy, costs, or shop catalog IDs

## Current behavior (baseline)

- Owned buildings live in `state.realm[]`; pets in `state.pets[]`; skins in `state.petSkins[]`; active selection via `activePet` / `activePetSkin`.
- `realmStageView()` drives My Realm stage + Free Preview.
- Practice (`#learn` phases, especially benchmark practice) does **not** render realm items.
- Icons are emoji strings on `REALM_BUILDINGS` / `REALM_PETS` / `REALM_PET_SKINS`.

## Architecture

### Asset layout (vendored, web-root relative)

```
assets/realm/
  buildings/<buildingId>.webp   # one file per REALM_BUILDINGS id
  pets/<petId>.webp             # base pet
  pets/<skinId>.webp            # optional full-body skin variant OR
  pets/overlays/<skinId>.webp   # accessory overlay drawn on top of base
  LICENSE.md                    # pack attribution + generated-art note
```

All paths resolve with `new URL('../assets/realm/...', import.meta.url)` from `js/` modules (or equivalent root-relative `/assets/...` from HTML/CSS). Service worker must cache every shipped asset.

### Catalog metadata (`js/rewards.mjs`)

Extend each catalog entry (keep existing `id`, `name`, `cost`, `blurb`, `icon` emoji):

- `art`: relative path under `assets/realm/` (required for buildings and base pets)
- Skins: either `art` (full replacement) or `overlay` (drawn atop base pet art)
- Helper: `realmArtUrl(entry)` → absolute URL string for `<img src>`
- Helper: `companionStripView(state)` → `{ pet: {src, alt, fallbackIcon}, buildings: [...up to 4], overflow: N }` derived from owned + active pet/skin
- Keep emoji as **fallback** if image fails to load (`onerror` → show `icon`)

Building pack: prefer **Kenney** (or equivalent **CC0**) isometric town/nature tiles, remapped/cropped to square-ish sprites named by building id. Document exact pack name + URL in `assets/realm/LICENSE.md`.

Pets/skins: generate a consistent isometric-friendly set (still PNG/WebP, not emoji). Skins are tint or accessory variants of the same pet silhouette so shop “Wear” remains meaningful.

### UI surfaces

1. **My Realm stage** (`#realmStage`)  
   Replace emoji `<span>` plots/pet with `<img>` using the same view model; ghost preview uses opacity + “Free preview” label (existing behavior).

2. **Shop cards** (`#realmShop`)  
   Card icon area uses `<img class="realmArt">` instead of large emoji; emoji may remain as tiny secondary fallback text only if needed for a11y.

3. **Practice companion strip**  
   - Mount: fixed/absolute **bottom-right** inside `#learn .lesson` (or a dedicated `#realmCompanion` node in `index.html` under `#learn`).
   - Visible whenever `#learn` is shown **and** the learner owns at least one building **or** has an active/owned pet.
   - Content: active pet (with skin) + up to **4** most recently purchased buildings (`state.realm` order, take last 4). If more buildings owned, show `+N` chip.
   - Non-interactive (`pointer-events: none` or no buttons); must not cover answer choices on typical iPad/phone widths — strip sized ~96–120px tall, max ~40% viewport width, with safe padding from answer buttons.
   - Refresh on `save()` / reward award / when entering learn or showing a practice question.
   - Hidden on Home and Parent screens.

### Data flow

```
purchase / equip → save() → renderRealm() + renderCompanionStrip()
showBenchQuestion / setPhase('practice'|…) → renderCompanionStrip()
Free Preview → realmStageView(preview) only (strip shows owned state, not ghost-only items)
```

Free Preview does **not** temporarily add unowned items to the practice strip (avoids confusing “I have this” during practice). Preview remains stage-only.

### Caching / versioning

- Add `assets/realm/**` files to `sw.js` `ASSETS` (list concrete files, matching existing pattern).
- Bump `version.json` and `sw.js` `CACHE` to `mathquest7-v<version>`.
- Update `docs/VERSIONING.md` / CI asset lists if the repo’s version-guard pattern requires registering new deployed paths.
- Update `docs/STATE.md` (and README only if user-facing description of My Realm changes meaningfully).

## Error handling

- Missing art file or load error → fall back to existing emoji `icon` (no blank hole).
- Empty realm + no pets → companion strip not rendered (no empty frame).
- Unknown catalog id in state → skip that item (already partially true via `buildingById` / `petById`).

## Testing

- Smoke: catalog length unchanged; each building/pet has non-empty `art` path; helper returns ≤4 buildings + overflow math.
- Smoke: app source includes companion strip mount / `renderCompanionStrip` (or equivalent) and practice path refreshes it.
- Smoke: `sw.js` includes at least one `assets/realm/` path and CACHE matches `version.json`.
- Manual: buy building + adopt pet → Home stage + shop cards show art; enter practice → corner strip shows pet + building; Free Preview still works.

## Privacy

No new network calls, analytics, or remote image hosts. Parent export/reset behavior unchanged. Attribution stays in-repo (`LICENSE.md`).

## Implementation sketch (for later plan — not this PR unless combined)

1. Add asset folders + LICENSE + first building/pet files.  
2. Extend `rewards.mjs` metadata + `companionStripView`.  
3. Update `renderRealm` / `renderRealmStage` to use `<img>`.  
4. Add `#realmCompanion` + CSS + `renderCompanionStrip`.  
5. Wire refresh into practice/learn renders and `save()`.  
6. SW / version / STATE / smoke tests.

## Open points resolved in this spec

- Strip shows **owned** state only (not Free Preview ghosts).  
- Building selection for strip: **last 4 entries** in `state.realm` (purchase order).  
- Skin rendering: prefer dedicated `art` per skin id when provided; else base pet `art` + optional `overlay`.
