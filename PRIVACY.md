# MathQuest 7 Privacy & Non-Commercial Use

MathQuest 7 is a non-commercial educational project created to improve the learning experience for kids. It has no advertising, no in-app purchases, no payment requests, no commercial tracking, and no sale of learner data.

## Student data in the current prototype

The current production architecture is intentionally local-first:

- Student progress is stored in the browser on the student's own device using `localStorage`.
- The parent PIN is stored in the same browser/device.
- MathQuest does not currently upload student progress, answers, mastery, XP, streaks, or the parent PIN to a MathQuest backend or cloud database.
- There is no analytics SDK, advertising SDK, payment SDK, or commercial tracking SDK in the app.
- Progress does not automatically synchronize between devices or browsers.

## Important hosting clarification

MathQuest is served through GitHub Pages. Opening any website necessarily makes normal HTTPS requests to the hosting provider. GitHub may therefore process ordinary web-hosting metadata such as IP address, request time, browser information, and requested files according to GitHub's own service and privacy practices.

That hosting traffic is different from MathQuest learner progress. The current MathQuest prototype does not send the learner's locally stored game progress to GitHub or to a MathQuest server.

## Clearing data

Parents can open **Parent Portal → Parent Controls → Clear All MathQuest Data** to remove MathQuest's locally stored learning progress, local parent PIN, legacy MathQuest browser keys, and MathQuest application caches from that browser/device.

Clearing local data cannot remove ordinary hosting logs maintained by GitHub as part of serving the website.

## Future cloud features

If optional accounts, cloud backup, cross-device synchronization, notifications, or analytics are ever introduced, this privacy statement and the in-app disclosure must be updated before those features are enabled. Such functionality must be opt-in and should minimize collected learner information.
