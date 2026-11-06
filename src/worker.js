const PAGE = __HTML__;
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
