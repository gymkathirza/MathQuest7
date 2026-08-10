# Student Registration Security Setup

MathQuest 7 now contains an approval-based registration/login UI, but **registration is intentionally disabled until a secure backend is configured**. Never place notification-provider secrets, Turnstile secrets, database service keys, or admin approval secrets in this public repository.

## Intended flow

1. Student/parent opens MathQuest and chooses **Request Access**.
2. They provide a student nickname, grade level, and parent/guardian email. Do not collect a child's legal name, DOB, school, address, or phone.
3. Cloudflare Turnstile provides a bot-challenge token.
4. The browser POSTs the request to a server-side registration endpoint.
5. The server validates Turnstile using the secret key.
6. The server rate-limits requests by IP/network and parent email and rejects duplicates/obvious abuse.
7. The server stores the request as `pending`.
8. The server sends the administrator an email notification containing request details and secure approve/reject links.
9. Approval generates a random student code and PIN. Store only a strong hash of the PIN.
10. The parent/guardian receives the approved student code/PIN.
11. Login is checked server-side and returns a random expiring session token. Store only a hash of that token server-side.
12. The browser stores the session token locally and verifies it when MathQuest opens.

## Recommended stack

- Static game: GitHub Pages
- Bot protection: Cloudflare Turnstile
- Database + server function: Supabase/Postgres + Edge Function (or an equivalent serverless backend)
- Email notifications: Resend (or another transactional email provider)

The backend can be replaced with another service as long as it implements the same actions: `register`, `login`, and `verifySession`, plus protected administrator approval/rejection endpoints.

## Required server-side secrets

Configure these only in the backend provider's encrypted secret/environment-variable store:

- `TURNSTILE_SECRET_KEY`
- database service credential (if required by the chosen platform)
- email provider API key
- administrator notification email
- cryptographically random approval-signing/admin secret

Do not commit `.env` files containing real values.

## Public config

After the backend is deployed, edit `config.js`:

```js
window.MQ7_CONFIG = {
  registrationRequired: true,
  registrationEndpoint: "https://YOUR-BACKEND-ENDPOINT",
  turnstileSiteKey: "YOUR_PUBLIC_TURNSTILE_SITE_KEY"
};
```

The Turnstile **site key** is public. The Turnstile **secret key** must never appear here.

## Backend request contract

### Register

POST JSON:

```json
{
  "action": "register",
  "nickname": "SkyBuilder",
  "grade": "Entering 7th Grade",
  "parentEmail": "parent@example.com",
  "turnstileToken": "..."
}
```

Successful response:

```json
{"message":"Registration request received and awaiting approval."}
```

### Login

POST JSON:

```json
{"action":"login","studentCode":"MQ7-ABC123","pin":"123456"}
```

Successful response:

```json
{"sessionToken":"cryptographically-random-token","nickname":"SkyBuilder"}
```

### Verify session

POST JSON:

```json
{"action":"verifySession","sessionToken":"..."}
```

Successful response:

```json
{"valid":true,"nickname":"SkyBuilder"}
```

## Abuse controls

Recommended minimums:

- Turnstile validation must happen server-side for every registration request.
- Rate-limit registration attempts by source IP/network and normalized parent email.
- Limit repeated pending registrations for the same email.
- Rate-limit failed login attempts by student code and IP.
- Never reveal whether a particular parent email already exists beyond what is necessary.
- Use generic errors for failed logins.
- Generate codes/PINs using a cryptographically secure random generator.
- Hash PINs with Argon2id, scrypt, or bcrypt; never store plaintext PINs.
- Hash session tokens in the database and expire them.
- Approval/rejection URLs must contain random, single-use, expiring tokens.
- Keep database tables inaccessible directly from the public browser; use the server endpoint.
- Log administrative approvals/rejections without storing unnecessary child information.

## Suggested rate limits

A reasonable starting point for this small private-use project is:

- Registration: 5 attempts per source network per hour.
- Registration: 3 attempts per normalized parent email per day.
- Login: 10 failed attempts per student code/source network per 15 minutes.
- Approval token: one use, expires after 48 hours.
- Student session: expires after 30 days and can be revoked.

Tune these if legitimate families encounter problems.

## Notification email

The administrator email should contain:

- request timestamp
- student nickname
- grade selection
- parent/guardian email
- approve button/link
- reject button/link

Do not include unnecessary child personal information.

## Important limitation

Because GitHub Pages is public static hosting, the repository itself cannot enforce account security. The secure backend is the enforcement boundary. Keep `registrationRequired: false` until the backend is deployed and tested; otherwise every student would be locked out.
