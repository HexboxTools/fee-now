const PAGE = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Fee Now \u2014 live Bitcoin transaction fees in sat/vB and USD</title>\n  <meta name=\"description\" content=\"Live Bitcoin fee calculator. See current sat/vB rates, the USD cost of a typical send, and whether you should broadcast now or wait. Free. Tips via Lightning.\">\n  <link rel=\"canonical\" href=\"https://hexbox-fees.hexboxtools.workers.dev/\">\n  <meta name=\"robots\" content=\"index,follow\">\n  <meta property=\"og:title\" content=\"Fee Now \u2014 should you send that Bitcoin transaction right now?\">\n  <meta property=\"og:description\" content=\"Live sat/vB rates, USD cost for a typical send, and a wait-or-broadcast call. Free Bitcoin fee calculator by Hexbox Tools.\">\n  <meta property=\"og:type\" content=\"website\">\n  <meta property=\"og:url\" content=\"https://hexbox-fees.hexboxtools.workers.dev/\">\n  <meta name=\"twitter:card\" content=\"summary\">\n  <meta name=\"theme-color\" content=\"#0c0d10\">\n  <style>\n    :root {\n      --bg: #0c0d10; --card: #16181d; --ink: #e8eaed; --muted: #9aa0a6;\n      --line: #2a2d34; --orange: #f7931a; --green: #3dd68c; --red: #ff6b6b;\n      --blue: #7ab8ff; --yellow: #ffd36b;\n    }\n    * { box-sizing: border-box; }\n    html, body { margin: 0; background: var(--bg); color: var(--ink);\n      font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif; }\n    a { color: var(--orange); text-decoration: none; }\n    a:hover { text-decoration: underline; }\n    header, main, footer { max-width: 840px; margin: 0 auto; padding: 0 20px; }\n    header { padding-top: 36px; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }\n    .brand { font-weight: 750; letter-spacing: -0.03em; font-size: 22px; }\n    .brand span { color: var(--orange); }\n    .meta { color: var(--muted); font-size: 13px; }\n    h1 { font-size: clamp(28px, 5vw, 42px); letter-spacing: -0.04em; line-height: 1.15; margin: 18px 0 10px; }\n    .sub { color: var(--muted); margin: 0 0 28px; max-width: 42em; }\n    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }\n    .tile { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 14px 14px; }\n    .tile .k { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }\n    .tile .v { font-variant-numeric: tabular-nums; font-size: 32px; font-weight: 720; letter-spacing: -0.04em; margin-top: 6px; }\n    .tile .u { color: var(--muted); font-size: 13px; }\n    .advice { margin: 16px 0 28px; padding: 16px 18px; border-radius: 14px; border: 1px solid var(--line); background: var(--card); }\n    .advice.great { border-color: #1e5c40; background: #10261c; }\n    .advice.good { border-color: #1e5c40; }\n    .advice.high { border-color: #6a4a12; background: #241c10; }\n    .advice.hot { border-color: #6a2424; background: #2a1212; }\n    .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; margin-bottom: 8px; background: #2a2d34; color: var(--muted); }\n    .advice.great .badge, .advice.good .badge { background: #1e5c40; color: var(--green); }\n    .advice.high .badge { background: #6a4a12; color: var(--yellow); }\n    .advice.hot .badge { background: #6a2424; color: var(--red); }\n    table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 14px; overflow: hidden; border: 1px solid var(--line); }\n    th, td { padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums; }\n    th:first-child, td:first-child { text-align: left; }\n    th { font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; background: #12141a; }\n    tr + tr td { border-top: 1px solid var(--line); }\n    td .usd { display: block; color: var(--muted); font-size: 12px; }\n    .calc, .pay, .how { margin: 28px 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 20px; }\n    h2 { font-size: 18px; margin: 0 0 12px; letter-spacing: -0.02em; }\n    label { display: block; color: var(--muted); font-size: 13px; margin-bottom: 6px; }\n    input { width: 100%; background: #0c0d10; color: var(--ink); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; font: inherit; font-variant-numeric: tabular-nums; }\n    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }\n    .result { margin-top: 8px; font-size: 15px; }\n    .paybox { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }\n    .paybox img { width: 148px; height: 148px; border-radius: 10px; background: #fff; }\n    code, .ln { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13.5px; word-break: break-all; }\n    button.copy { background: var(--orange); color: #1a1003; border: 0; border-radius: 8px; padding: 8px 12px; font-weight: 700; cursor: pointer; }\n    button.copy:hover { filter: brightness(1.08); }\n    .how p { color: #c9cdd3; margin: 0 0 10px; }\n    footer { color: var(--muted); font-size: 13px; padding: 12px 20px 48px; }\n    @media (max-width: 720px) {\n      .grid { grid-template-columns: 1fr 1fr; }\n      .row2 { grid-template-columns: 1fr; }\n      th, td { padding: 10px 8px; font-size: 13px; }\n    }\n  </style>\n  <script type=\"application/ld+json\">\n  {\"@context\":\"https://schema.org\",\"@type\":\"WebApplication\",\"name\":\"Fee Now\",\"url\":\"https://hexbox-fees.hexboxtools.workers.dev/\",\"applicationCategory\":\"FinanceApplication\",\"operatingSystem\":\"Any\",\"offers\":{\"@type\":\"Offer\",\"price\":\"0\",\"priceCurrency\":\"USD\"},\"description\":\"Live Bitcoin transaction fee calculator with sat/vB rates and USD costs.\"}\n  </script>\n</head>\n<body>\n  <header>\n    <div class=\"brand\">Fee <span>Now</span></div>\n    <div class=\"meta\" id=\"stamp\">Updated %%UPDATED%% \u00b7 BTC $%%USD%%</div>\n  </header>\n  <main>\n    <h1>Should you send that Bitcoin transaction right now?</h1>\n    <p class=\"sub\">Live next-block, half-hour, hour, and economy fee rates from mempool.space, converted into sats and dollars for common transaction sizes. No account. No tracker cookies.</p>\n\n    <div class=\"grid\" id=\"tiles\">\n      <div class=\"tile\"><div class=\"k\">Next block</div><div class=\"v\" id=\"v-fast\">%%FAST%%</div><div class=\"u\">sat/vB</div></div>\n      <div class=\"tile\"><div class=\"k\">~30 minutes</div><div class=\"v\" id=\"v-half\">%%HALF%%</div><div class=\"u\">sat/vB</div></div>\n      <div class=\"tile\"><div class=\"k\">~1 hour</div><div class=\"v\" id=\"v-hour\">%%HOUR%%</div><div class=\"u\">sat/vB</div></div>\n      <div class=\"tile\"><div class=\"k\">Economy</div><div class=\"v\" id=\"v-eco\">%%ECO%%</div><div class=\"u\">sat/vB</div></div>\n    </div>\n\n    <div class=\"advice %%LEVEL%%\" id=\"advice\">\n      <div class=\"badge\" id=\"badge\">%%LEVEL%%</div>\n      <div id=\"advice-text\">%%ADVICE%%</div>\n    </div>\n\n    <table>\n      <thead>\n        <tr>\n          <th>Transaction</th>\n          <th>vBytes</th>\n          <th>Next block</th>\n          <th>Economy</th>\n          <th>You save by waiting</th>\n        </tr>\n      </thead>\n      <tbody id=\"rows\"></tbody>\n    </table>\n\n    <div class=\"calc\">\n      <h2>Custom size</h2>\n      <div class=\"row2\">\n        <div>\n          <label for=\"vb\">Transaction weight (vBytes)</label>\n          <input id=\"vb\" type=\"number\" min=\"1\" step=\"1\" value=\"141\">\n        </div>\n        <div>\n          <label for=\"rate\">Fee rate (sat/vB) \u2014 leave blank to use next-block</label>\n          <input id=\"rate\" type=\"number\" min=\"1\" step=\"1\" placeholder=\"next-block rate\">\n        </div>\n      </div>\n      <div class=\"result\" id=\"custom\"></div>\n    </div>\n\n    <div class=\"pay\" id=\"support\">\n      <h2>Keep it running</h2>\n      <p style=\"color:var(--muted);margin:0 0 14px\">Fee Now is free. If a cheap-fee window saved you money, send a Lightning tip \u2014 any amount \u2014 to Hexbox Tools. No KYC, no signup.</p>\n      <div class=\"paybox\">\n        <img alt=\"Lightning address QR code\" width=\"148\" height=\"148\"\n          src=\"https://api.qrserver.com/v1/create-qr-code/?size=148x148&amp;data=lightning%3Ahexbox%40hexbox-ln.hexboxtools.workers.dev\">\n        <div>\n          <div class=\"ln\" id=\"ln\">hexbox@hexbox-ln.hexboxtools.workers.dev</div>\n          <p style=\"margin:10px 0\"><button class=\"copy\" type=\"button\" id=\"copy-ln\">Copy Lightning address</button></p>\n          <p style=\"color:var(--muted);font-size:13px;margin:0\">Want a Nostr ping when fees drop below your target? Zap the announcement note 2,100 sats for 7 days of alerts, then reply <code>below 5</code> (or any number). Default alert: fastest fee \u2264 3 sat/vB or \u2265 50. Announcement: <a id=\"announce-link\" href=\"https://njump.me/note18w2lcptvf32552u8jw6049pq8t38xtxzx47dpqx9x5d24hjlv9fqaqekhq\">announcement note</a>.</p>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"how\">\n      <h2>How Bitcoin fees work</h2>\n      <p>Bitcoin miners pick transactions by fee rate, measured in satoshis per virtual byte (sat/vB). A typical single-sig send is about 141 vBytes, so a 4 sat/vB rate costs 564 sats. When the mempool is busy, next-block rates jump; when it empties, economy rates can sit at 1 sat/vB.</p>\n      <p>Next-block is what you pay to aim for confirmation in the next block (~10 minutes on average). Economy is a low-priority rate that may take hours. If the gap between them is wide and your payment can wait, using economy is how you stop overpaying.</p>\n      <p>Fees often ease on weekends and during quieter UTC hours, and they spike when inscriptions, batch settlements, or sudden demand clog the mempool. This page rereads <a href=\"https://mempool.space/api/v1/fees/recommended\">mempool.space recommended fees</a> and <a href=\"https://mempool.space/api/v1/prices\">USD price</a> about every 30 seconds. Treat sizes as estimates \u2014 your wallet will show the exact vBytes for the transaction it builds.</p>\n      <p>JSON API (free, CORS open): <a href=\"/api/fees\"><code>/api/fees</code></a>.</p>\n    </div>\n  </main>\n  <footer>\n    Built by <a href=\"https://github.com/HexboxTools/fee-now\">Hexbox Tools</a>. Payments settle to the Hexbox Lightning address above. Not financial advice \u2014 just the current fee market.\n  </footer>\n  <script id=\"boot\" type=\"application/json\">%%DATA%%</script>\n  <script>\n    const boot = JSON.parse(document.getElementById(\"boot\").textContent || \"{}\");\n    const $ = (id) => document.getElementById(id);\n    function fmtSats(n) { return Math.round(n).toLocaleString() + \" sats\"; }\n    function fmtUsd(n) {\n      if (!Number.isFinite(n)) return \"\";\n      if (n < 0.01) return \"$\" + n.toFixed(4);\n      if (n < 1) return \"$\" + n.toFixed(3);\n      return \"$\" + n.toFixed(2);\n    }\n    function money(cell) {\n      if (!cell) return \"\u2014\";\n      return fmtSats(cell.sats) + '<span class=\"usd\">' + fmtUsd(cell.usd) + \"</span>\";\n    }\n    function render(data) {\n      if (!data || !data.fees) return;\n      $(\"v-fast\").textContent = data.fees.fastestFee;\n      $(\"v-half\").textContent = data.fees.halfHourFee;\n      $(\"v-hour\").textContent = data.fees.hourFee;\n      $(\"v-eco\").textContent = data.fees.economyFee;\n      const adv = $(\"advice\");\n      adv.className = \"advice \" + (data.advice && data.advice.level || \"ok\");\n      $(\"badge\").textContent = (data.advice && data.advice.level) || \"\";\n      $(\"advice-text\").textContent = (data.advice && data.advice.text) || \"\";\n      const usd = data.btcUsd ? Math.round(data.btcUsd).toLocaleString() : \"\u2014\";\n      const when = data.updated ? new Date(data.updated).toLocaleString(\"en-CA\", { timeZone: \"America/Toronto\" }) + \" ET\" : \"\";\n      $(\"stamp\").textContent = (when ? (\"Updated \" + when + \" \u00b7 \") : \"\") + \"BTC $\" + usd;\n      const body = $(\"rows\");\n      body.innerHTML = (data.rows || []).map(function (r) {\n        return \"<tr><td>\" + r.label + \"</td><td>\" + r.vb + \"</td><td>\" + money(r.fastest) + \"</td><td>\" + money(r.economy) + \"</td><td>\" + money(r.save) + \"</td></tr>\";\n      }).join(\"\");\n      window.__fees = data;\n      updateCustom();\n    }\n    function updateCustom() {\n      const data = window.__fees;\n      if (!data || !data.fees) return;\n      const vb = Math.max(1, Number($(\"vb\").value) || 141);\n      const rate = Number($(\"rate\").value);\n      const used = Number.isFinite(rate) && rate > 0 ? rate : Number(data.fees.fastestFee) || 0;\n      const sats = Math.round(vb * used);\n      const usd = (sats / 1e8) * (Number(data.btcUsd) || 0);\n      const eco = Math.round(vb * (Number(data.fees.economyFee) || 0));\n      const save = Math.max(0, sats - eco);\n      $(\"custom\").innerHTML = vb + \" vB at \" + used + \" sat/vB = <strong>\" + fmtSats(sats) + \"</strong> (\" + fmtUsd(usd) + \"). Economy would be \" + fmtSats(eco) + \"; waiting saves \" + fmtSats(save) + \".\";\n    }\n    $(\"vb\").addEventListener(\"input\", updateCustom);\n    $(\"rate\").addEventListener(\"input\", updateCustom);\n    $(\"copy-ln\").addEventListener(\"click\", async function () {\n      const addr = $(\"ln\").textContent.trim();\n      try { await navigator.clipboard.writeText(addr); $(\"copy-ln\").textContent = \"Copied\"; setTimeout(() => $(\"copy-ln\").textContent = \"Copy Lightning address\", 1500); }\n      catch (e) { $(\"copy-ln\").textContent = \"Copy failed\"; }\n    });\n    render(boot);\n    async function refresh() {\n      try {\n        const r = await fetch(\"/api/fees\", { cache: \"no-store\" });\n        if (!r.ok) return;\n        render(await r.json());\n      } catch (e) {}\n    }\n    setInterval(refresh, 30000);\n  </script>\n</body>\n</html>\n";
const SRC = "https://mempool.space";
const LN = "hexbox@hexbox-ln.hexboxtools.workers.dev";
const SIZES = [
  { id: "send", label: "Typical send (P2WPKH 1-in 2-out)", vb: 141 },
  { id: "pay", label: "Simple payment (P2WPKH 1-in 1-out)", vb: 111 },
  { id: "batch", label: "Batch spend (2-in 2-out)", vb: 208 },
  { id: "open", label: "Lightning channel open (approx.)", vb: 300 },
];

let cache = { t: 0, data: null };

function cost(vb, satvb, usd) {
  const sats = Math.round(vb * satvb);
  return { sats, usd: (sats / 1e8) * usd };
}

function advice(fast) {
  if (fast <= 2)
    return { level: "great", text: "Fees are very low. A good time to send, consolidate UTXOs, or open Lightning channels." };
  if (fast <= 5)
    return { level: "good", text: "Fees are low. Fine to send now. Use the economy rate if you can wait a few blocks." };
  if (fast <= 15)
    return { level: "ok", text: "Normal fee market. Send if you need a confirmation soon; pick economy if the payment can wait." };
  if (fast <= 40)
    return { level: "high", text: "Fees are elevated. Delay non-urgent on-chain transactions or use the economy rate." };
  return { level: "hot", text: "The fee market is stressed. Avoid non-urgent on-chain transactions until it cools." };
}

function build(fees, prices) {
  const usd = Number(prices.USD) || 0;
  const rows = SIZES.map((s) => ({
    ...s,
    fastest: cost(s.vb, fees.fastestFee, usd),
    halfHour: cost(s.vb, fees.halfHourFee, usd),
    hour: cost(s.vb, fees.hourFee, usd),
    economy: cost(s.vb, fees.economyFee, usd),
    save: cost(s.vb, Math.max(0, fees.fastestFee - fees.economyFee), usd),
  }));
  return {
    fees,
    prices,
    btcUsd: usd,
    rows,
    advice: advice(Number(fees.fastestFee) || 0),
    updated: new Date().toISOString(),
    source: SRC + "/api/v1/fees/recommended",
    ln: LN,
  };
}

async function fetchJson(url, ms = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error("http " + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFees() {
  const now = Date.now();
  if (cache.data && now - cache.t < 20000) return cache.data;
  let fees, prices;
  try {
    [fees, prices] = await Promise.all([
      fetchJson(SRC + "/api/v1/fees/recommended"),
      fetchJson(SRC + "/api/v1/prices"),
    ]);
  } catch (e) {
    fees = await fetchJson(SRC + "/api/v1/fees/recommended");
    prices = await fetchJson(SRC + "/api/v1/prices");
  }
  cache = { t: now, data: build(fees, prices) };
  return cache.data;
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=15",
      ...extra,
    },
  });
}

function html(data) {
  const safe = JSON.stringify(data).replace(/</g, "\\u003c");
  const page = PAGE.replace("%%DATA%%", safe)
    .replaceAll("%%FAST%%", String(data.fees.fastestFee))
    .replaceAll("%%HALF%%", String(data.fees.halfHourFee))
    .replaceAll("%%HOUR%%", String(data.fees.hourFee))
    .replaceAll("%%ECO%%", String(data.fees.economyFee))
    .replaceAll("%%USD%%", String(Math.round(data.btcUsd)))
    .replaceAll("%%ADVICE%%", data.advice.text)
    .replaceAll("%%LEVEL%%", data.advice.level)
    .replaceAll("%%UPDATED%%", data.updated);
  return new Response(page, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=15",
    },
  });
}

const ROBOTS = `User-agent: *
Allow: /
Sitemap: https://hexbox-fees.hexboxtools.workers.dev/sitemap.xml
`;

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hexbox-fees.hexboxtools.workers.dev/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
</urlset>
`;

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "Content-Type",
        },
      });
    }
    if (url.pathname === "/robots.txt") {
      return new Response(ROBOTS, { headers: { "content-type": "text/plain" } });
    }
    if (url.pathname === "/sitemap.xml") {
      return new Response(SITEMAP, { headers: { "content-type": "application/xml" } });
    }
    if (url.pathname === "/health") {
      return json({ ok: true, service: "hexbox-fees", ln: LN });
    }
    try {
      const data = await fetchFees();
      if (url.pathname === "/api/fees") return json(data);
      if (url.pathname === "/" || url.pathname === "/index.html") return html(data);
      return json({ error: "not found" }, 404);
    } catch (e) {
      if (url.pathname === "/api/fees") {
        return json({ error: "upstream unavailable", detail: String(e.message || e) }, 502);
      }
      if (url.pathname === "/" || url.pathname === "/index.html") {
        const fallback = {
          fees: { fastestFee: "—", halfHourFee: "—", hourFee: "—", economyFee: "—" },
          prices: {},
          btcUsd: 0,
          rows: [],
          advice: { level: "ok", text: "Live fee data is temporarily unavailable. Refresh in a moment." },
          updated: new Date().toISOString(),
          source: SRC,
          ln: LN,
          error: String(e.message || e),
        };
        return html(fallback);
      }
      return json({ error: "not found" }, 404);
    }
  },
};
