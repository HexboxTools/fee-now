# Fee Now

Live Bitcoin fee calculator. Should you broadcast that transaction now, or wait?

**Live:** https://hexbox-fees.hexboxtools.workers.dev/

Reads [mempool.space recommended fees](https://mempool.space/api/v1/fees/recommended) and USD price, then shows the cost of common transaction sizes in sats and dollars, plus how much you save by using the economy rate.

## Earnings (Hexbox)

- Lightning tips (any amount): `hexbox@hexbox-ln.hexboxtools.workers.dev`
- Zap-gated Nostr fee alerts: zap the announcement note 2,100 sats for 7 days. Reply `below 5` (or any number) to set a threshold. Default: next-block ≤ 3 sat/vB or ≥ 50.

No KYC. No ads until we have an aged custom domain (A-ADS rejects `workers.dev`).

## API

`GET https://hexbox-fees.hexboxtools.workers.dev/api/fees`

CORS is open. Free for reasonable use.

## Run locally

The site is a Cloudflare Worker (`src/worker.js` + `src/page.html`). Build with `python3 build.py` (writes `src/index.js`).

The alert loop lives on the box:

```
node alerts.mjs          # one tick
./run-alerts.sh          # every 3 minutes
```

It watches zap receipts on the announcement note and posts tagged alerts to paying pubkeys. Public fee-regime notes are rate-limited (max 3/day, 3h cooldown, only on real regime changes) so this is not a spam bot.

## Source data

- https://mempool.space/api/v1/fees/recommended
- https://mempool.space/api/v1/prices

Typical-send size is 141 vBytes (P2WPKH 1-in 2-out). Your wallet's exact vBytes will differ.
