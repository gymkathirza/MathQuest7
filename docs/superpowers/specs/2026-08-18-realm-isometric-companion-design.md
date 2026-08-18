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
| Asset sourcing | **C — Hybrid**: license-safe free/open buildings + generated pets/skins |
| Surface coverage | **1 — One art system everywhere**: My Realm shop cards, stage, Free Preview, and practice strip |
| Licensing | **Strict**: only clearly free/open redistributable assets, or assets we generate for MathQuest |

## Licensing (hard rules)

MathQuest 7 is a public GitHub Pages project. Every vendored image must be safe to redistribute in this repo and ship to learners offline.

### Allowed sources

1. **Generated for MathQuest** (preferred when a matching free pack is unclear) — still WebP/PNG isometric art created for this project; record `Source: generated for MathQuest 7` + date in `assets/realm/LICENSE.md`. Treat as project-owned art for this repo.
2. **CC0 / public domain** packs (e.g. many [Kenney.nl](https://kenney.nl/assets) packs) — may be used without attribution, but we still list pack name + URL in `LICENSE.md` for provenance.
3. **CC-BY / CC-BY-SA** (or equivalent OSI-friendly / Creative Commons) — only if redistribution in a public app is clearly allowed; keep required attribution text in `assets/realm/LICENSE.md` (and a short credit line in README or PRIVACY-adjacent docs only if the license requires public display).

### Forbidden

- Assets with **unclear**, **missing**, or **“personal use only”** licenses
- **Freepik / Adobe Stock / shutterstock**-style downloads unless the specific file is explicitly free for redistribution under a clear OSS/CC license (default: do not use)
- **Giphy / random GIF hosts / CDN hotlinks**
- Packs that ban use in **educational**, **online**, or **redistributed** products
- Anything requiring a paid commercial license we have not purchased and documented
- “Free for personal use” itch/Craftpix freebies that disallow redistribution in a public game/app — **skip**; generate instead

### Process before shipping any third-party file

1. Confirm license text on the **official** pack page (not a mirror).
2. Prefer **CC0**; if not CC0, copy the exact attribution string into `assets/realm/LICENSE.md`.
3. If license is ambiguous after a short check → **do not vendor**; **generate** the building/pet/skin instead.
4. Smoke/CI may assert `assets/realm/LICENSE.md` exists and that every shipped `art` path is under `assets/realm/`.

### Hybrid default in practice

- Buildings: start with a **verified CC0** isometric pack; if a themed construct has no good match, **generate** that building.
- Pets + skins: **generate** the full set for style consistency (no third-party character packs unless they pass the same license gate).

## Non-goals (this change)

- Syllabus / week-gated building unlocks or coin-pacing redesign
- Animated pet idle loops (GIF/Lottie) — may follow later on the same asset paths (same license rules)
- External CDN or runtime fetch of art (privacy + offline PWA)
- Changing coin economy, costs, or shop catalog IDs
- Using paid or ambiguously licensed marketplace art
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

Buildings: prefer a **verified CC0** isometric pack (Kenney or equivalent); crop/remap to square-ish sprites named by building id. If no license-safe match exists for an id, **generate** that sprite instead of stretching a questionable freebie. Document every third-party pack (name, URL, license, date checked) and every generated file group in `assets/realm/LICENSE.md`.

Pets/skins: **generate** a consistent isometric-friendly set (WebP/PNG). Skins are tint or accessory variants of the same pet silhouette so shop “Wear” remains meaningful. Do not pull third-party character art unless it passes the Licensing hard rules above.

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
- Licensing: only CC0/public domain, clearly redistributable CC-BY(-SA), or MathQuest-generated art; when in doubt, generate.
