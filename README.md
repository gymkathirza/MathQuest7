# MathQuest 7

An iPad-friendly adaptive Grade 7 math adventure game aligned to the broad North Carolina Grade 7 math domains.

## iPad installation

1. Publish this repository with GitHub Pages from the `main` branch and repository root.
2. Open the GitHub Pages URL in Safari on the iPad.
3. Tap **Share → Add to Home Screen**.
4. Launch **MathQuest 7** from its Home Screen icon.

## Progress

Learning progress, XP, coins, mastery, adaptive levels, and buildings are stored locally in the browser using `localStorage`. The 60-minute expedition timer is session-only and resets for each fresh game session.

The service worker caches the app after its first successful HTTPS load so it can continue working offline.