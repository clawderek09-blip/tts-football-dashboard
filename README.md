# The Tipping Station Football Dashboard

A football-channel companion to the existing Tipping Station horse-racing
results dashboard.

## What is tracked

- Singles and in-play calls
- Multi-match accas
- Same-game bet builders through the same reusable `slip -> legs` data model
- Match result, first-half goals, team goals, BTTS, double chance and other
  football markets
- Exact points and GBP P/L only where both result and odds are verified

## Current import

The supplied Telegram HTML covers 22–28 July 2026:

- 107 exported messages
- 43 linked screenshots
- 21 written/partially written slips imported
- 40 selections across singles and accas

The Telegram photo directory was not part of the uploaded export, so
screenshot-only tips are intentionally excluded until the images are supplied.

## Run locally

```bash
npm install
npm run validate:data
npm run dev
```

Open <http://localhost:3000>.

## Build

```bash
npm run build
```

For the deployable Cloudflare package:

```bash
npm run build:cloudflare
```

The production package is intentionally static. Next exports the dashboard to
`out/`, then `scripts/build-static-worker.mjs` packages those files behind a
small Cloudflare asset Worker in `.open-next/`. This avoids loading the full
Node-compatible Next server runtime for a dashboard that has no dynamic server
features.
