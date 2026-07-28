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
- 42 betting screenshots imported (the remaining image is the channel-logo change)
- 62 slips imported
- 110 selections across singles, accas and bet builders
- 28 confirmed wins, 7 confirmed losses and 27 awaiting a clear result
- 32 priced settlements returning `+15.87pts / +£158.67`

The complete Telegram export now supplies the original photo directory. Every
betting screenshot is matched to its source message; outcomes remain pending
unless a clear result confirmation appears in the export.

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
