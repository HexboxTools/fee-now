#!/usr/bin/env node
process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});
// Fee Now alerter: watch zap-gated subscriptions + post rare public fee-regime notes.
// Usage: node alerts.mjs            (one shot)
//        node alerts.mjs --loop     (every 3 minutes)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { finalizeEvent, getPublicKey } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { SimplePool, useWebSocketImplementation } from "nostr-tools/pool";
import WebSocket from "ws";

useWebSocketImplementation(WebSocket);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "state.json");
const SK = Buffer.from(fs.readFileSync("/workspace/nostr/sk.hex", "utf8").trim(), "hex");
const PK = getPublicKey(SK);
const NPUB = nip19.npubEncode(PK);
const RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://relay.nostr.band",
  "wss://nostr.mom",
];
const SITE = "https://hexbox-fees.hexboxtools.workers.dev/";
const SUB_SATS = 2100;
const SUB_DAYS = 7;
const MAX_PUBLIC_PER_DAY = 3;
const PUBLIC_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000;

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); }
  catch { return { subscribers: [], publicPosts: [], lastFees: null, lastPublicAt: 0, announceId: null }; }
}
function saveState(s) {
  const tmp = STATE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, STATE_PATH);
}

async function getFees() {
  const [fees, prices] = await Promise.all([
    fetch("https://mempool.space/api/v1/fees/recommended").then((r) => r.json()),
    fetch("https://mempool.space/api/v1/prices").then((r) => r.json()),
  ]);
  return { fees, prices, btcUsd: Number(prices.USD) || 0, fetchedAt: Date.now() };
}

function parseBolt11Sats(inv) {
  if (!inv) return null;
  const s = String(inv).toLowerCase().replace(/^lightning:/, "");
  const m = s.match(/^lnbc(\d+)([munp]?)/);
  if (!m) return null;
  const n = Number(m[1]);
  const mult = m[2];
  if (mult === "m") return n * 100000;
  if (mult === "u") return n * 100;
  if (mult === "n") return n * 0.1;
  if (mult === "p") return n * 0.0001;
  if (mult === "") return n * 1e8;
  return null;
}

function zapSats(ev) {
  const desc = ev.tags.find((t) => t[0] === "description")?.[1];
  if (desc) {
    try {
      const req = JSON.parse(desc);
      const amt = req.tags?.find((t) => t[0] === "amount")?.[1];
      if (amt) return Number(amt) / 1000;
      if (req.pubkey) { /* keep going for amount */ }
    } catch {}
  }
  const bolt11 = ev.tags.find((t) => t[0] === "bolt11")?.[1];
  return parseBolt11Sats(bolt11);
}

function zapSender(ev) {
  const desc = ev.tags.find((t) => t[0] === "description")?.[1];
  if (!desc) return null;
  try {
    const req = JSON.parse(desc);
    return req.pubkey || null;
  } catch { return null; }
}

function parseThreshold(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  const out = {};
  const below = t.match(/\b(?:below|under|<=|less than)\s+(\d{1,4})\b/);
  const above = t.match(/\b(?:above|over|>=|greater than|spike(?:s)?(?: at)?)\s+(\d{1,4})\b/);
  if (below) out.below = Number(below[1]);
  if (above) out.above = Number(above[1]);
  return (out.below != null || out.above != null) ? out : null;
}

async function publish(content, extraTags = []) {
  const tags = [
    ...[...new Set([...content.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase()))].map((t) => ["t", t]),
    ...extraTags,
  ];
  const ev = finalizeEvent(
    { kind: 1, created_at: Math.floor(Date.now() / 1000), content, tags },
    SK
  );
  const pool = new SimplePool();
  const results = await Promise.allSettled(pool.publish(RELAYS, ev));
  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(new Date().toISOString(), "POSTED", ev.id, "relays_ok", ok);
  await new Promise((r) => setTimeout(r, 1500));
  return ev;
}

async function query(filter, ms = 12000) {
  const pool = new SimplePool();
  try {
    const evs = await Promise.race([
      pool.querySync(RELAYS, filter),
      new Promise((_, rej) => setTimeout(() => rej(new Error("query timeout")), ms)),
    ]);
    return evs || [];
  } catch (e) {
    console.log(new Date().toISOString(), "query_err", e.message);
    return [];
  }
}

function regime(fast) {
  if (fast <= 2) return "very-low";
  if (fast <= 5) return "low";
  if (fast <= 15) return "normal";
  if (fast <= 40) return "elevated";
  return "stressed";
}

function notableMove(prev, cur) {
  if (!prev) return { yes: true, why: "first snapshot" };
  const a = Number(prev.fastestFee);
  const b = Number(cur.fastestFee);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0) return { yes: false };
  const change = Math.abs(b - a) / a;
  if (regime(a) !== regime(b)) return { yes: true, why: `regime ${regime(a)} → ${regime(b)}` };
  if (change >= 0.4 && Math.abs(b - a) >= 3) return { yes: true, why: `${Math.round(change * 100)}% move` };
  return { yes: false };
}

function publicAllowed(state) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = (state.publicPosts || []).filter((p) => p.at > dayAgo);
  if (recent.length >= MAX_PUBLIC_PER_DAY) return false;
  if (state.lastPublicAt && Date.now() - state.lastPublicAt < PUBLIC_COOLDOWN_MS) return false;
  return true;
}

function typicalUsd(satvb, btcUsd) {
  const sats = 141 * satvb;
  return (sats / 1e8) * btcUsd;
}

async function syncZaps(state) {
  if (!state.announceId) return;
  const evs = await query({ kinds: [9735], "#e": [state.announceId] });
  console.log(new Date().toISOString(), "zaps_seen", evs.length);
  for (const ev of evs) {
    if ((state.seenZaps || []).includes(ev.id)) continue;
    state.seenZaps = state.seenZaps || [];
    state.seenZaps.push(ev.id);
    const sats = zapSats(ev) || 0;
    const sender = zapSender(ev);
    if (!sender || sats < SUB_SATS) {
      console.log(new Date().toISOString(), "zap_ignored", ev.id, "sats", sats, "sender", sender);
      continue;
    }
    const existing = (state.subscribers || []).find((s) => s.pubkey === sender);
    const now = Date.now();
    if (existing) {
      existing.expires = Math.max(existing.expires, now) + SUB_DAYS * 86400 * 1000;
      existing.satsPaid = (existing.satsPaid || 0) + sats;
      existing.lastZap = ev.id;
      console.log(new Date().toISOString(), "sub_extended", sender.slice(0, 12), "until", new Date(existing.expires).toISOString());
    } else {
      state.subscribers = state.subscribers || [];
      state.subscribers.push({
        pubkey: sender,
        below: 3,
        above: 50,
        since: now,
        expires: now + SUB_DAYS * 86400 * 1000,
        satsPaid: sats,
        lastZap: ev.id,
        lastAlertAt: { below: 0, above: 0 },
        armed: { below: true, above: true },
      });
      console.log(new Date().toISOString(), "sub_added", sender.slice(0, 12), "sats", sats);
    }
  }
}

async function syncReplies(state) {
  if (!state.announceId) return;
  const evs = await query({ kinds: [1], "#e": [state.announceId] });
  for (const ev of evs) {
    const th = parseThreshold(ev.content);
    if (!th) continue;
    const sub = (state.subscribers || []).find((s) => s.pubkey === ev.pubkey && s.expires > Date.now());
    if (!sub) continue;
    if (th.below != null) sub.below = th.below;
    if (th.above != null) sub.above = th.above;
    sub.armed = { below: true, above: true };
    console.log(new Date().toISOString(), "threshold_set", ev.pubkey.slice(0, 12), th);
  }
}

async function alertSubs(state, snap) {
  const fast = Number(snap.fees.fastestFee);
  const usd = typicalUsd(fast, snap.btcUsd);
  const active = (state.subscribers || []).filter((s) => s.expires > Date.now());
  for (const sub of active) {
    sub.armed = sub.armed || { below: true, above: true };
    sub.lastAlertAt = sub.lastAlertAt || { below: 0, above: 0 };
    const tags = [["p", sub.pubkey], ["t", "bitcoin"], ["t", "fees"]];
    if (sub.below != null && fast <= sub.below && sub.armed.below) {
      if (Date.now() - (sub.lastAlertAt.below || 0) >= ALERT_COOLDOWN_MS) {
        await publish(
          `Fee alert: next-block is now ${fast} sat/vB (~$${usd.toFixed(usd < 1 ? 3 : 2)} for a typical 141 vB send). Your threshold was ≤ ${sub.below}. Check ${SITE}\n\n#bitcoin #fees`,
          tags
        );
        sub.lastAlertAt.below = Date.now();
        sub.armed.below = false;
      }
    } else if (sub.below != null && fast > sub.below + 2) {
      sub.armed.below = true;
    }
    if (sub.above != null && fast >= sub.above && sub.armed.above) {
      if (Date.now() - (sub.lastAlertAt.above || 0) >= ALERT_COOLDOWN_MS) {
        await publish(
          `Fee alert: next-block jumped to ${fast} sat/vB (~$${usd.toFixed(usd < 1 ? 3 : 2)} for a typical 141 vB send). Your threshold was ≥ ${sub.above}. Check ${SITE}\n\n#bitcoin #fees`,
          tags
        );
        sub.lastAlertAt.above = Date.now();
        sub.armed.above = false;
      }
    } else if (sub.above != null && fast < sub.above - 5) {
      sub.armed.above = true;
    }
  }
}

function publicNote(snap, why) {
  const f = snap.fees;
  const usdFast = typicalUsd(f.fastestFee, snap.btcUsd);
  const usdEco = typicalUsd(f.economyFee, snap.btcUsd);
  return `Bitcoin fees right now: next-block ${f.fastestFee} sat/vB (~$${usdFast.toFixed(usdFast < 1 ? 3 : 2)} for a typical send), economy ${f.economyFee} sat/vB (~$${usdEco.toFixed(usdEco < 1 ? 3 : 2)}). ${why}.\n\nLive calculator: ${SITE}\n\n#bitcoin #fees`;
}

async function maybePublic(state, snap) {
  const move = notableMove(state.lastFees, snap.fees);
  if (!move.yes) return;
  if (!publicAllowed(state)) {
    console.log(new Date().toISOString(), "public_suppressed", move.why);
    return;
  }
  // First snapshot after launch: skip so we don't double-post with the announce.
  if (!state.lastFees) {
    console.log(new Date().toISOString(), "public_skip_first_snapshot");
    return;
  }
  const ev = await publish(publicNote(snap, move.why));
  state.publicPosts = state.publicPosts || [];
  state.publicPosts.push({ id: ev.id, at: Date.now(), why: move.why, fastest: snap.fees.fastestFee });
  state.lastPublicAt = Date.now();
}

export async function tick() {
  const state = loadState();
  const snap = await getFees();
  console.log(new Date().toISOString(), "fees", snap.fees, "subs", (state.subscribers || []).filter((s) => s.expires > Date.now()).length);
  await syncZaps(state);
  await syncReplies(state);
  await alertSubs(state, snap);
  await maybePublic(state, snap);
  state.lastFees = snap.fees;
  state.lastTick = Date.now();
  saveState(state);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const loop = process.argv.includes("--loop");
  const run = async () => {
    try { await tick(); }
    catch (e) { console.error(new Date().toISOString(), "tick_err", e); }
  };
  await run();
  if (loop) {
    const iv = setInterval(run, 3 * 60 * 1000);
    iv.unref && undefined;
    // keep process alive
    setInterval(() => {}, 1 << 30);
  }
}

console.log("pubkey", NPUB);
