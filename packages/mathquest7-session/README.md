# `@gymkathirza/mathquest7-session`

**Pre-release** ES module library extracted from [MathQuest 7](https://github.com/gymkathirza/MathQuest7): pure Grade 7 curriculum generators, daily 3/4/3 benchmark builders, and practice-timer helpers.

> **Warning:** This is an early pre-release (`0.1.0-pre.x`). APIs may change without a major bump. Do not rely on it in production yet.

- **License:** MIT  
- **Runtime:** Node ≥ 18 or any modern ESM browser bundler  
- **Registry:** [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) (not npmjs.org by default)

## What this is (and is not)

| Included | Not included |
| --- | --- |
| `curriculum.mjs` — topics, mastery gates, `generateProblem` | The MathQuest PWA / UI / DOM |
| `daily-session.mjs` — `generateDailyBenchmark` (3/4/3) | localStorage / parent PIN |
| `practice-timer.mjs` — active-time helpers | Service worker, assets, CSS |

Teach copy inside topic records may contain HTML strings intended for MathQuest’s Learn UI; generators and mastery helpers are otherwise DOM-free.

## Install (GitHub Packages)

1. Authenticate (personal access token **classic** with `read:packages`; use `write:packages` to publish):

```bash
npm login --scope=@gymkathirza --auth-type=legacy --registry=https://npm.pkg.github.com
# Username: your GitHub username
# Password: PAT (classic)
```

Or project `.npmrc` (never commit a real token — only `${NODE_AUTH_TOKEN}`):

```ini
@gymkathirza:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then: `export NODE_AUTH_TOKEN=<PAT classic with read:packages>` and `npm install`.

2. Install:

```bash
npm install @gymkathirza/mathquest7-session@0.1.0-pre.0
```

## Usage

```js
import {
  TOPICS,
  generateProblem,
  generateDailyBenchmark,
  CORE_DAILY_COUNT,
  LEVEL_COUNTS,
  todayKey,
} from '@gymkathirza/mathquest7-session';

const topicId = TOPICS[0].id;
const one = generateProblem(topicId);
const daily = generateDailyBenchmark(topicId); // length CORE_DAILY_COUNT (10)
console.log(LEVEL_COUNTS, todayKey());
```

Deep imports:

```js
import { generateDailyBenchmark } from '@gymkathirza/mathquest7-session/daily-session';
import { PASS_MASTERY } from '@gymkathirza/mathquest7-session/curriculum';
```

## Publish (maintainers)

```bash
cd packages/mathquest7-session
# Ensure NODE_AUTH_TOKEN is a PAT with write:packages (do not commit it)
npm publish --access public --tag next
```

GitHub Packages often creates packages as **private** first. For a general audience, set package visibility to **Public** in the GitHub UI: repository → Packages → package settings → Change visibility.

## Sync note

Module sources are copied from repo-root `js/` for a clean publishable surface. When changing generators in the PWA, update the copies under `packages/mathquest7-session/` (or re-copy) before bumping the package version.

## License

MIT — see [LICENSE](./LICENSE).
