# Plan: ARIA / accessibility baseline (MathQuest 7)

## Goal

Make keyboard and assistive-tech support a default product rule for all UI surfaces, following [W3C Using ARIA](https://www.w3.org/TR/using-aria/) — especially the first rule: prefer native HTML semantics; use ARIA only to fill gaps.

## Surfaces in scope

| Surface | Intent |
| --- | --- |
| Document / landmarks | `lang`, skip link, `header`/`main`/`nav`, labeled sections |
| Practice answers | Real `<button>`s in a named group; feedback live region |
| Guided tokens | Operable as buttons (keyboard + name), not bare `div`s |
| Phase bar | `aria-current="step"` on active phase |
| Seasonal / claim banners | Region + polite live; decorative stars `aria-hidden` |
| Companion strip | Decorative art hidden from AT; polite status text when pet reacts |
| Break overlay | Existing `dialog`/`aria-modal`; focus move + light Tab trap |
| Parent PIN | Explicit `<label>`, error `role="alert"` |
| Toast | Keep `role="status"` + `aria-live="polite"` |
| Motion | Preserve existing `prefers-reduced-motion` behavior |

## Self-review vs W3C Using ARIA (updated plan)

1. **First rule** — Keep answer/CTA as native `<button>`; convert guided tokens from `div` to `button`; do not invent `role="button"` on real buttons.
2. **No redundant roles** — Do not add `role="main"` on `<main>` or `role="banner"` on `<header>` unless needed for legacy AT; native elements are enough.
3. **Naming** — Labels from visible text; use `aria-label` only when the control’s visible text is insufficient (day tiles keep tip as accessible name).
4. **`aria-hidden`** — Never hide focusable controls. Companion may use `aria-hidden` only when fully hidden/empty; when visible, expose a small live status and mark decorative SVG/emoji art `aria-hidden`.
5. **Live regions** — Sparingly: feedback (polite), toast (existing), PIN errors (alert), companion reaction status (polite). Avoid assertive spam on every cheer rotation.
6. **Dialogs** — Break overlay already has `role="dialog"` + `aria-modal` + labelled title; add initial focus + Tab cycle within the overlay; restore focus on dismiss.
7. **Out of scope for this pass** — Full custom drag-and-drop AT mapping for guided tiles (keyboard tap path is enough); cloud analytics; visual redesign.

## Deliverables

- Always-on Cursor rule: `.cursor/rules/mathquest-accessibility.mdc`
- Code: `index.html`, `js/app.js`, `css/app.css` (+ smoke asserts)
- Docs: `STATE.md`, `MEMORY.md`, brief README note; version **0.24.0**
- PR with UI verification notes; do not merge

## Test / verify

- `node --check js/app.js` + `node tests/smoke.mjs` (static a11y contract)
- Local serve + browser: Home banner, start lesson, answer question (live feedback), companion status, Parent PIN label/error if quick
