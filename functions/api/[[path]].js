// Cloudflare Pages Function: /api/<site>/<action>. Storage is D1, bound as env.DB.
// Guests have no accounts: the browser sends a random id (X-Guest-Id) that acts as a bearer secret for its own rows.
// Owners read private fields with X-Owner-Key matching OWNER_KEY_<SITE> (falls back to the shared OWNER_KEY secret).

const str = (max) => (v) => String(v ?? "").trim().slice(0, max);
const num = (min, max) => (v) => Math.min(max, Math.max(min, parseInt(v, 10) || 0));
const oneOf = (list) => (v) => (list.includes(v) ? v : list[0]);
const bool = (v) => v === true;

// Whitelist per site: unknown fields are dropped, every value is clamped.
const SITES = {
  m7: {
    pub: { guest: str(40), status: oneOf(["yes", "maybe", "no"]), kids: num(0, 6), adults: num(0, 6), wish: str(220) },
    priv: { note: str(300) },
    name: "guest",
  },
  wed: {
    pub: { name: str(80), status: oneOf(["yes", "no"]), guests: num(0, 6), wish: str(400) },
    priv: { meal: oneOf(["", "meat", "fish", "veg"]), bus: bool, song: str(100) },
    name: "name",
  },
};
const MAX_ROWS = 1000;
const MAX_GIFTS_PER_GUEST = 5;

// Per-IP limits as [max hits, window in seconds]. Generous enough for a family behind one mobile NAT.
const LIMITS = {
  post: [20, 60],          // any write
  newGuest: [30, 86400],   // new RSVP rows
  gift: [15, 86400],       // gift reservations
  ownerFail: [5, 60],      // wrong owner keys
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "no-referrer",
    },
  });

function clean(spec, src) {
  const out = {};
  for (const k in spec) out[k] = spec[k](src?.[k]);
  return out;
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// Names are compared loosely so "Тимур" and " тимур " count as the same guest.
const normName = (s) => String(s ?? "").toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/\s+/g, " ").trim();
// Public pages show "Наталия К." instead of a full name.
const shortName = (s) => {
  const [first, ...rest] = String(s ?? "").trim().split(/\s+/);
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first || "";
};

async function readBody(request) {
  const text = await request.text();
  if (text.length > 4000) throw Object.assign(new Error("too_large"), { status: 413 });
  try { return JSON.parse(text); } catch { throw Object.assign(new Error("bad_json"), { status: 400 }); }
}

// ---------- rate limiting: fixed windows in a small D1 table ----------
let hitsReady = null;
function ensureHits(DB) {
  hitsReady ??= DB.prepare("CREATE TABLE IF NOT EXISTS hits (k TEXT PRIMARY KEY, n INTEGER NOT NULL, exp INTEGER NOT NULL)")
    .run().catch((e) => { hitsReady = null; throw e; });
  return hitsReady;
}

async function ipTag(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("invites:" + ip));
  return [...new Uint8Array(buf).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bucket(kind, site, ip) {
  const [, win] = LIMITS[kind];
  const slot = Math.floor(Date.now() / 1000 / win);
  return { k: `${kind}:${site}:${ip}:${slot}`, exp: (slot + 1) * win * 1000 };
}

// Counts one hit and reports whether the caller is still within the limit.
async function hit(DB, kind, site, ip) {
  await ensureHits(DB);
  const { k, exp } = bucket(kind, site, ip);
  const row = await DB.prepare("INSERT INTO hits (k, n, exp) VALUES (?, 1, ?) ON CONFLICT (k) DO UPDATE SET n = n + 1 RETURNING n")
    .bind(k, exp).first();
  if (Math.random() < 0.02) await DB.prepare("DELETE FROM hits WHERE exp < ?").bind(Date.now()).run();
  return row.n <= LIMITS[kind][0];
}

async function peek(DB, kind, site, ip) {
  await ensureHits(DB);
  const row = await DB.prepare("SELECT n FROM hits WHERE k = ?").bind(bucket(kind, site, ip).k).first();
  return (row?.n || 0) < LIMITS[kind][0];
}

const tooMany = () => json({ error: "rate_limited" }, 429);

export async function onRequest({ request, env, params }) {
  const [site, action] = params.path || [];
  const cfg = SITES[site];
  if (!cfg) return json({ error: "not_found" }, 404);
  if (!env.DB) return json({ error: "no_db" }, 503);

  const url = new URL(request.url);
  const gid = request.headers.get("X-Guest-Id") || "";
  const validGid = /^[A-Za-z0-9-]{16,64}$/.test(gid);
  const isPost = request.method === "POST";

  // Blocks cross-site form posts; browsers always send Origin on POST fetches.
  const origin = request.headers.get("Origin");
  if (isPost && origin && origin !== url.origin) return json({ error: "forbidden" }, 403);

  try {
    const DB = env.DB;
    if (request.method === "GET" && action === "state") return await getState(DB, site, validGid ? gid : "");
    if (request.method === "GET" && action === "owner") {
      const ip = await ipTag(request);
      if (!(await peek(DB, "ownerFail", site, ip))) return tooMany();
      const key = env["OWNER_KEY_" + site.toUpperCase()] || env.OWNER_KEY || "";
      if (!safeEqual(request.headers.get("X-Owner-Key") || "", key)) {
        await hit(DB, "ownerFail", site, ip);
        return json({ error: "forbidden" }, 403);
      }
      return await getOwner(DB, site);
    }
    if (isPost && (action === "rsvp" || action === "gift")) {
      if (!validGid) return json({ error: "bad_guest" }, 400);
      const ip = await ipTag(request);
      if (!(await hit(DB, "post", site, ip))) return tooMany();
      const body = await readBody(request);
      if (action === "rsvp") return await saveRsvp(DB, site, cfg, gid, ip, body);
      return await saveGift(DB, site, cfg, gid, ip, body);
    }
    return json({ error: "not_found" }, 404);
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: "server" }, 500);
  }
}

async function allRows(DB, site) {
  const { results } = await DB.prepare("SELECT guest_id, pub, priv, ts FROM rsvp WHERE site = ? ORDER BY ts DESC LIMIT ?").bind(site, MAX_ROWS).all();
  return results.map((r) => ({ guest_id: r.guest_id, ts: r.ts, pub: JSON.parse(r.pub), priv: JSON.parse(r.priv) }));
}

async function getState(DB, site, gid) {
  const rows = await allRows(DB, site);
  const me = rows.find((r) => gid && r.guest_id === gid);
  const mine = me ? { ...me.pub, ...me.priv } : null;
  const { results: g } = await DB.prepare("SELECT gift_id, guest_id, name FROM gifts WHERE site = ?").bind(site).all();
  const gifts = {};

  // The wedding page only exposes aggregates, wishes with short names, and whether a gift is taken.
  if (site === "wed") {
    for (const r of g) gifts[r.gift_id] = { mine: !!gid && r.guest_id === gid };
    const people = rows.filter((r) => r.pub.status === "yes").reduce((a, r) => a + (r.pub.guests || 1), 0);
    const wishes = rows.filter((r) => r.pub.wish).slice(0, 100).map((r) => ({ name: shortName(r.pub.name), wish: r.pub.wish }));
    return json({ people, wishes, gifts, mine });
  }
  // The birthday page lists each guest; exact answer times are replaced by an order rank.
  for (const r of g) gifts[r.gift_id] = { mine: !!gid && r.guest_id === gid, name: r.name };
  return json({ rsvps: rows.map((r, i) => ({ ...r.pub, ts: rows.length - i })), gifts, mine });
}

async function getOwner(DB, site) {
  const rows = await allRows(DB, site);
  return json({ rows: rows.map((r) => ({ ...r.pub, ...r.priv, ts: r.ts })) });
}

async function saveRsvp(DB, site, cfg, gid, ip, body) {
  const pub = clean(cfg.pub, body);
  const priv = clean(cfg.priv, body);
  if (!pub[cfg.name]) return json({ error: "missing" }, 400);
  if (site === "wed" && pub.status !== "yes") { pub.guests = 0; priv.meal = ""; priv.bus = false; priv.song = ""; }

  // One answer per name: another browser cannot overwrite or impersonate a guest who already replied.
  const { results } = await DB.prepare("SELECT guest_id, pub FROM rsvp WHERE site = ?").bind(site).all();
  const exists = results.some((r) => r.guest_id === gid);
  const name = normName(pub[cfg.name]);
  if (results.some((r) => r.guest_id !== gid && normName(JSON.parse(r.pub)[cfg.name]) === name)) return json({ error: "name_taken" }, 409);
  if (!exists && !(await hit(DB, "newGuest", site, ip))) return tooMany();

  // The row cap is checked inside the insert so parallel requests cannot overshoot it.
  const res = await DB.prepare(
    "INSERT INTO rsvp (site, guest_id, pub, priv, ts) SELECT ?1, ?2, ?3, ?4, ?5 " +
    "WHERE (SELECT COUNT(*) FROM rsvp WHERE site = ?1) < ?6 OR EXISTS (SELECT 1 FROM rsvp WHERE site = ?1 AND guest_id = ?2) " +
    "ON CONFLICT (site, guest_id) DO UPDATE SET pub = excluded.pub, priv = excluded.priv, ts = excluded.ts"
  ).bind(site, gid, JSON.stringify(pub), JSON.stringify(priv), Date.now(), MAX_ROWS).run();
  if (res.meta.changes === 0) return json({ error: "full" }, 429);
  return json({ ok: true });
}

async function saveGift(DB, site, cfg, gid, ip, body) {
  const id = String(body?.id ?? "");
  if (!/^[a-z0-9_-]{1,24}$/i.test(id)) return json({ error: "bad_gift" }, 400);

  if (body.action === "free") {
    await DB.prepare("DELETE FROM gifts WHERE site = ? AND gift_id = ? AND guest_id = ?").bind(site, id, gid).run();
    return json({ ok: true });
  }
  if (body.action !== "take") return json({ error: "bad_action" }, 400);

  const held = await DB.prepare("SELECT COUNT(*) AS c FROM gifts WHERE site = ? AND guest_id = ?").bind(site, gid).first();
  if (held.c >= MAX_GIFTS_PER_GUEST) return json({ error: "limit" }, 429);
  if (!(await hit(DB, "gift", site, ip))) return tooMany();

  // The giver's label comes from their own RSVP; a typed name may not borrow another guest's name.
  const { results } = await DB.prepare("SELECT guest_id, pub FROM rsvp WHERE site = ?").bind(site).all();
  const own = results.find((r) => r.guest_id === gid);
  let name = own ? JSON.parse(own.pub)[cfg.name] : str(40)(body.name);
  if (!own && results.some((r) => normName(JSON.parse(r.pub)[cfg.name]) === normName(name))) name = "";
  name = str(40)(name);

  // The primary key makes this atomic: when two guests race, only one insert changes a row.
  const res = await DB.prepare(
    "INSERT INTO gifts (site, gift_id, guest_id, name, ts) VALUES (?, ?, ?, ?, ?) ON CONFLICT (site, gift_id) DO NOTHING"
  ).bind(site, id, gid, name, Date.now()).run();
  if (res.meta.changes === 0) {
    const row = await DB.prepare("SELECT guest_id FROM gifts WHERE site = ? AND gift_id = ?").bind(site, id).first();
    if (row?.guest_id !== gid) return json({ error: "taken" }, 409);
  }
  return json({ ok: true });
}
