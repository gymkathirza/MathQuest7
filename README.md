# MathQuest 7

MathQuest 7 is an iPad-friendly, browser-based Grade 7 math adventure game. It is designed to make practice feel like a quest-and-building game rather than a worksheet, while gradually increasing difficulty as the learner demonstrates mastery.

The current curriculum structure is organized around the broad Grade 7 mathematics domains used by Union County Public Schools and the Standard Course of Study.

## Game features

- Adaptive difficulty that starts with accessible warm-up questions and increases as the learner succeeds.
- Five math quest zones:
  - Integer Caverns — rational numbers and operations.
  - Ratio Raceway — ratios, rates, proportions, and percent.
  - Alchemist's Algebra Lab — expressions, equations, and inequalities.
  - Geometry Forge — scale drawings, circles, area, and related geometry skills.
  - Probability Wilds — sampling, probability, averages, and data reasoning.
- Immediate feedback after every answer.
- Explanations after mistakes so the learner can understand the method instead of only seeing the correct answer.
- Optional hints for difficult problems.
- XP, coins, streaks, mastery levels, and unlockable buildings.
- A realm-building reward system that gives learners a reason to continue practicing.
- A 60-minute expedition session timer.
- A movement/water/eye-rest checkpoint around the middle of a session.
- Parent dashboard with overall accuracy, problems solved, XP, best streak, and mastery by math zone.
- Automatic local progress saving.
- Progressive Web App (PWA) support so the game can be added to an iPad or phone Home Screen.
- Offline support after the game has been loaded successfully from the web at least once.

## How to play

1. Launch MathQuest 7.
2. Tap **Start Expedition**.
3. Open **Integer Caverns**, the first unlocked zone.
4. Answer the math challenge shown on screen.
5. Correct answers earn XP, coins, mastery progress, and streaks.
6. If an answer is incorrect, read the explanation and try the next related problem.
7. Use **Hint** whenever help is needed.
8. As mastery improves, the game increases the challenge level automatically.
9. Reach the required mastery in one zone to unlock the next zone.
10. Open **My Realm** to spend earned coins on buildings and cosmetic rewards.
11. Open **Parent** to review learning progress.

The game is intentionally mastery-oriented. Speed is not required, and mistakes are used as learning signals rather than as a reason to heavily penalize the learner.

## Play online with GitHub Pages

The intended deployment method is GitHub Pages.

Repository:

`https://github.com/gymkathirza/MathQuest7`

After GitHub Pages is enabled for the repository, the game should be available at:

`https://gymkathirza.github.io/MathQuest7/`

To enable GitHub Pages:

1. Open the repository on GitHub.
2. Open **Settings**.
3. Select **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch.
6. Select `/ (root)` as the folder.
7. Save the settings.
8. Open the published GitHub Pages URL after deployment completes.

Do not try to play the downloaded `index.html` from iPad Files or Quick Look. iPadOS may display the page without allowing the JavaScript game interactions to run correctly. Use the HTTPS GitHub Pages version in Safari instead.

## iPad installation

Recommended method:

1. Open the published MathQuest 7 URL in **Safari**.
2. Confirm that buttons such as **Start Expedition** are interactive.
3. Tap Safari's **Share** button.
4. Select **Add to Home Screen**.
5. Keep the name **MathQuest 7** and tap **Add**.
6. Launch the game from the new Home Screen icon.

When launched from the Home Screen, MathQuest 7 behaves more like a standalone app and uses the available iPad screen more effectively.

## iPhone installation

1. Open the live HTTPS game URL in Safari.
2. Tap **Share**.
3. Select **Add to Home Screen**.
4. Launch MathQuest 7 from the Home Screen icon.

The interface is responsive, although an iPad or larger display provides a better game experience.

## Mac installation and launch

No installation is required on a Mac.

To play in a browser:

1. Open the live MathQuest 7 URL in Safari, Chrome, Edge, or another current standards-compliant browser.
2. Play directly in the browser.

For a more app-like experience, browsers that support installing PWAs may offer an install or create-app option.

## Windows and Chromebook launch

No traditional installation is required.

1. Open the live MathQuest 7 URL in a current version of Chrome, Edge, or another modern browser.
2. Play directly in the browser.
3. If the browser offers **Install app**, **Create shortcut**, or a similar PWA option, it may be used for faster access.

## Android installation

1. Open the live HTTPS URL in Chrome or another modern Android browser.
2. Open the browser menu.
3. Choose **Add to Home screen** or **Install app** if available.
4. Launch MathQuest 7 from the Home Screen.

## Supported devices

MathQuest 7 is a web application and should work on most modern touch or desktop devices, including:

- iPad
- iPhone
- Mac
- Windows PCs and laptops
- Chromebooks
- Android tablets
- Android phones

A tablet or laptop-sized screen is recommended for the best experience.

## Operating system requirements

There is no strict operating-system dependency because the game runs in a browser.

Recommended environments include reasonably current versions of:

- iPadOS
- iOS
- macOS
- Windows
- ChromeOS
- Android

Very old operating-system versions may include browsers that lack modern PWA, service-worker, CSS, or JavaScript support.

## Browser requirements

MathQuest 7 requires a modern browser with JavaScript enabled.

Recommended browsers:

- Safari on iPad, iPhone, and Mac
- Google Chrome
- Microsoft Edge
- Other current Chromium- or WebKit-based browsers

The browser must support the standard web technologies used by the game, including:

- JavaScript
- `localStorage`
- modern CSS layout features
- service workers for offline caching
- Web App Manifest support for PWA installation where available

JavaScript must not be disabled.

Private/Incognito browsing is not recommended because browser storage behavior can differ and progress may not persist reliably.

## Internet requirements

An internet connection is required for the first load from the hosted HTTPS website.

After the first successful load, the service worker attempts to cache the core application files so the game can continue to work offline on the same browser/device.

Offline support depends on the browser retaining the cached site data. If browser data is cleared, the game may need to be loaded online again.

## Saving progress

Progress is saved automatically in the browser using `localStorage`.

Currently saved information includes:

- XP
- coins
- total problems answered
- correct-answer count
- current streak
- best streak
- mastery percentage by math zone
- adaptive difficulty level by math zone
- unlocked/built realm items

The 60-minute expedition timer is session-based and is not intended to permanently carry over between new sessions.

## Where progress is stored

Progress is stored locally on the specific browser/device that is being used.

For example, progress created in Safari on one iPad is not automatically synchronized with Chrome on a Mac or another iPad.

The current version does not use:

- a user account
- a cloud database
- automatic cross-device synchronization

Deleting browser website data, clearing local storage, or certain browser privacy actions can erase locally saved progress.

## Parent dashboard

Tap **Parent** in the bottom navigation to open the parent dashboard.

The current dashboard shows:

- total XP earned
- overall answer accuracy
- total problems solved
- best answer streak
- mastery percentage for each major math quest zone
- a description of how adaptive difficulty works

Future versions can expand this dashboard with session history, individual NC standard mastery, common error patterns, recommended next lessons, parent PIN protection, and multiple learner profiles.

## Adaptive difficulty

Each math zone tracks its own difficulty level.

The game starts with easier prerequisite-style questions. A sequence of correct answers can increase difficulty. When a learner struggles, the game can lower the current difficulty and provide an explanation before presenting another related challenge.

This approach is intended to keep learners in a productive challenge range instead of forcing every learner through exactly the same fixed sequence.

## Breaks and session length

A normal expedition is designed around approximately one hour of play and learning.

Around the midpoint, MathQuest 7 displays a checkpoint encouraging the learner to:

- stand up
- stretch
- drink water
- rest their eyes

The learner can then continue the expedition.

## Downloading the source code

To download the project from GitHub:

1. Open the MathQuest7 repository.
2. Tap or click **Code**.
3. Choose **Download ZIP**.
4. Extract the downloaded ZIP archive.

The primary application files are:

- `index.html` — game interface, logic, question generation, progress saving, and parent dashboard
- `manifest.webmanifest` — PWA metadata
- `sw.js` — service worker used for offline caching
- `icon.svg` — application icon
- `README.md` — documentation

Downloading the files is mainly useful for development or backup. For normal gameplay, use the hosted GitHub Pages URL rather than opening `index.html` directly from the device file manager.

## Running locally for development

Because the PWA uses a service worker, developers should use a local HTTP server instead of opening `index.html` with a `file://` URL.

Examples include a development web server supplied by an editor, Python's HTTP server, Node-based static servers, or another local HTTP server.

After starting a local server, open the localhost URL in a browser.

Service workers work on HTTPS sites and are also normally permitted on `localhost` for development.

## Updating the game

The production files are stored on the `main` branch.

When files in `main` change, GitHub Pages will publish the updated version after its deployment process completes.

Because MathQuest 7 includes offline caching, a device may briefly continue showing a cached version. Closing and reopening the application, refreshing Safari, or clearing the site cache may be necessary while testing new releases.

## Troubleshooting

### The page opens but nothing is clickable

Make sure the game is being opened from the HTTPS GitHub Pages URL in Safari or another browser. Do not use iPad Quick Look to run the game.

### The game opens as a document preview

You are probably opening the downloaded `index.html` file instead of the hosted website. Open the GitHub Pages URL in Safari.

### Progress disappeared

Possible causes include clearing browser website data, using Private/Incognito mode, switching browsers, switching devices, or reinstalling/clearing the browser application.

### Progress is different on another device

This is expected in the current version. Progress is local to each browser/device and is not yet cloud synchronized.

### Offline mode is not working

Open the game online at least once and allow the page to finish loading. Offline operation also depends on the browser retaining the service-worker cache.

### An update does not appear immediately

The service worker or browser cache may still contain an earlier version. Refresh the page or close and reopen the app. During development, clearing website data may also force a fresh version.

## Privacy and data

The current version stores gameplay progress locally in browser storage. It does not currently send learner progress to a backend database.

Parents should be aware that the GitHub Pages site itself is served through GitHub infrastructure, but learner game-state data implemented by this prototype remains in local browser storage.

## Current project status

This is an early playable prototype. The core adaptive learning loop, five math domains, reward system, realm-building system, break reminder, parent dashboard, PWA packaging, local progress saving, and offline caching are implemented.

Planned future enhancements may include:

- larger standards-aligned question banks
- richer Roblox/Minecraft-inspired exploration
- animated characters and NPC quest-givers
- bosses and multi-step missions
- interactive graphs and manipulatives
- sound and music controls
- multiple learner profiles
- parent PIN protection
- detailed session history
- mastery tracking by individual NC Grade 7 standard
- recommended next lessons
- optional encrypted cloud backup and cross-device synchronization

## Educational scope

MathQuest 7 is intended as a supplemental learning and practice experience. It is not a replacement for classroom instruction, a teacher, or official school assessment materials.

The goal is to help a learner entering Grade 7 build confidence, practice foundational and grade-level skills, receive explanations when they make mistakes, and advance into more difficult challenges as mastery improves.
