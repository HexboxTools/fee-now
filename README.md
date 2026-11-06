# Fee Now

Live Bitcoin fee calculator + Lightning tips + L402-paid forecast for AI agents.

**Live:** https://hexbox-fees.hexboxtools.workers.dev/

## Humans

Reads [mempool.space recommended fees](https://mempool.space/api/v1/fees/recommended) and USD price, then shows the cost of common transaction sizes in sats and dollars, plus how much you save by using the economy rate.

## AI agents / bots

Designed so autonomous agents discover and pay automatically:

| Path | What |
|------|------|
| `/llms.txt` | LLM / agent crawl brief |
| `/openapi.json` | OpenAPI 3 |
| `/.well-known/ai-plugin.json` | AI plugin manifest |
| `/api/agent.json` | Compact machine discovery |
| `/agents` | Human+agent docs |
| `/api/fees` | **Free** live fees JSON (CORS open) |
| `/api/v1/forecast` | **Paid** L402 best-time-to-send forecast (21 sats) |
| `/api/v1/forecast/sample` | Free schema sample |

Pay flow: `GET /api/v1/forecast` → HTTP 402 + `WWW-Authenticate: L402 macaroon=…, invoice=lnbc…` → pay bolt11 → retry with `Authorization: L402 <macaroon>:<preimage>`.

## Earnings (Hexbox)

- Lightning tips: `hexbox@hexbox-ln.hexboxtools.workers.dev`
- L402 forecast: 21 sats per call
- Zap-gated Nostr fee alerts: zap the announcement note 2,100 sats for 7 days

No KYC. Hexbox identity only.

## SEO pages

- `/should-i-send-bitcoin-now`
- `/bitcoin-fee-history`
- `/fees/next-block` · `/fees/half-hour` · `/fees/hour` · `/fees/economy`
- `/fees/target/{satvb}`

## Deploy

```
./deploy.sh
```

Alert loop on the box: `./run-alerts.sh`
