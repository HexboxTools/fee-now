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
const RELAYS = ["wss://relay.damus.io","wss://nos.lol","wss://relay.primal.net","wss://relay.nostr.band","wss://nostr.mom"];
const SITE = "https://hexbox-fees.hexboxtools.workers.dev/";
const LN = "hexbox@hexbox-ln.hexboxtools.workers.dev";

const content = `Fee Now is live: a free Bitcoin fee calculator that tells you whether to broadcast now or wait.

It reads next-block, half-hour, hour, and economy sat/vB from mempool.space and shows the USD cost of a typical send — plus how much you save by using the economy rate.

${SITE}

No account, no cookies. If it saves you fees, tip any amount over Lightning:
${LN}

Want a Nostr ping when fees drop or spike? Zap this note 2,100 sats for 7 days of alerts, then reply "below 5" (or any number). Default: alert when next-block hits ≤ 3 sat/vB or ≥ 50.

JSON API: ${SITE}api/fees

#bitcoin #fees #lightning`;

const tags = [...new Set([...content.matchAll(/#(\w+)/g)].map(m => m[1].toLowerCase()))].map(t => ["t", t]);
const ev = finalizeEvent({ kind: 1, created_at: Math.floor(Date.now()/1000), content, tags }, SK);
if (!process.argv.includes("--post")) {
  console.log("DRY", ev.id);
  console.log(content);
  process.exit(0);
}
const pool = new SimplePool();
const results = await Promise.allSettled(pool.publish(RELAYS, ev));
pool.close(RELAYS);
const ok = results.filter(r => r.status === "fulfilled").length;
const note = nip19.noteEncode(ev.id);
let state = {};
try { state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); } catch {}
state.announceId = ev.id;
state.announceNote = note;
state.announceAt = Date.now();
state.announceNjump = `https://njump.me/${note}`;
state.subscribers = state.subscribers || [];
state.publicPosts = state.publicPosts || [];
state.seenZaps = state.seenZaps || [];
fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
console.log("POSTED", ev.id, "relays_ok", ok);
console.log("njump", state.announceNjump);
console.log("note", note);
