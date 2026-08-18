# MathQuest 7 Versioning Policy

MathQuest 7 uses semantic versioning in `version.json` and displays that version in the application UI.

## Required rule

Any pull request that changes a deployed MathQuest application file must also update `version.json`.

The CI workflow enforces this rule for these production-facing files:

- `index.html`
- `css/app.css`
- `js/app.js`
- `js/curriculum.mjs`
- `js/daily-session.mjs`
- `js/practice-timer.mjs`
- `js/mastery-session.mjs`
- `sw.js`
- `manifest.webmanifest`
- `icon.svg`
- `config.js`

Documentation-only, test-only, and CI-only changes do not require a version bump unless they also change deployed application behavior.

## Service worker cache must track the version

The service worker (`sw.js`) is cache-first for assets, so a cache name that does not change will keep serving old files to returning users and hide the update. Therefore, on every deployed change, set the `CACHE` constant in `sw.js` to `mathquest7-v<version>` matching `version.json`. CI enforces this: the build fails unless `sw.js` contains `mathquest7-v<version>`. `version.json` itself is served network-first by the service worker so the in-app version badge always reflects the deployed version.

## Semantic version guidance

Given a version `MAJOR.MINOR.PATCH`:

- **PATCH** — bug fixes and backward-compatible refinements. Example: `0.7.0 → 0.7.1`.
- **MINOR** — substantial new student/parent functionality, curriculum modules, or learning experiences that remain backward compatible. Example: `0.7.1 → 0.8.0`.
- **MAJOR** — breaking changes to stored progress/state, incompatible architecture changes, or a production-stable milestone where compatibility guarantees change.

## Release field

`version.json` also contains a short `release` identifier describing the release theme, for example:

```json
{
  "version": "0.7.1",
  "release": "session-generation-contract"
}
```

## Agent/developer checklist

Before opening a PR that changes the deployed app:

1. Decide the appropriate semantic version increment.
2. Update `version.json` in the same PR.
3. Ensure the UI still reads and displays `version.json`.
4. Run the test suite.
5. Let the CI version guard confirm the deployed-file change includes a real version change from `main`.

This policy is mandatory for future MathQuest production changes.
