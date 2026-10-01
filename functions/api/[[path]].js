// Cloudflare Pages Function: /api/<site>/<action>. Storage is D1, bound as env.DB.
// Guests have no accounts: the browser sends a random id (X-Guest-Id) that acts as a bearer secret for its own rows.
// Parents read private fields with X-Owner-Key matching the OWNER_KEY secret.

const str = (max) => (v) => String(v ?? "").trim().slice(0, max);
const num = (min, max) => (v) => Math.min(max, Math.max(min, parseInt(v, 10) || 0));
const oneOf = (list) => (v) => (list.includes(v) ? v : list[0]);
const bool = (v) => v === true;

// Whitelist per site: unknown fields are dropped, every value is clamped.
const SITES = {
  m7: {
    pub: { guest: str(40), status: oneOf(["yes", "maybe", "no"]), kids: num(0, 6), adults: num(0, 6), wish: str(220) },
    priv: { note: str(300) },
    required: ["guest"],
  },
  wed: {
    pub: { name: str(80), status: oneOf(["yes", "no"]), guests: num(0, 6), wish: str(400) },
    priv: { meal: oneOf(["", "meat", "fish", "veg"]), bus: bool, song: str(100) },
    required: ["name"],
  },
};
const MAX_ROWS = 1000;
const MAX_GIFTS_PER_GUEST = 5;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
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

async function readBody(request) {
  const text = await request.text();
  if (text.length > 4000) throw Object.assign(new Error("too_large"), { status: 413 });
  try { return JSON.parse(text); } catch { throw Object.assign(new Error("bad_json"), { status: 400 }); }
}

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
    if (request.method === "GET" && action === "state") return await getState(env.DB, site, cfg, validGid ? gid : "");
    if (request.method === "GET" && action === "owner") {
      if (!safeEqual(request.headers.get("X-Owner-Key") || "", env.OWNER_KEY || "")) return json({ error: "forbidden" }, 403);
      return await getOwner(env.DB, site);
    }
    if (isPost && action === "rsvp") {
      if (!validGid) return json({ error: "bad_guest" }, 400);
      return await saveRsvp(env.DB, site, cfg, gid, await readBody(request));
    }
    if (isPost && action === "gift") {
      if (!validGid) return json({ error: "bad_guest" }, 400);
      return await saveGift(env.DB, site, gid, await readBody(request));
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

async function getState(DB, site, cfg, gid) {
  const rows = await allRows(DB, site);
  const { results: g } = await DB.prepare("SELECT gift_id, guest_id, name FROM gifts WHERE site = ?").bind(site).all();
  const gifts = {};
  for (const r of g) gifts[r.gift_id] = { mine: !!gid && r.guest_id === gid, name: r.name };
  const me = rows.find((r) => gid && r.guest_id === gid);
  const mine = me ? { ...me.pub, ...me.priv } : null;

  // Birthday page shows each guest's status; the wedding page only exposes aggregates and wishes.
  if (site === "wed") {
    const people = rows.filter((r) => r.pub.status === "yes").reduce((a, r) => a + (r.pub.guests || 1), 0);
    const wishes = rows.filter((r) => r.pub.wish).slice(0, 100).map((r) => ({ name: r.pub.name, wish: r.pub.wish }));
    return json({ people, wishes, gifts, mine });
  }
  return json({ rsvps: rows.map((r) => ({ ...r.pub, ts: r.ts })), gifts, mine });
}

async function getOwner(DB, site) {
  const rows = await allRows(DB, site);
  return json({ rows: rows.map((r) => ({ ...r.pub, ...r.priv, ts: r.ts })) });
}

async function saveRsvp(DB, site, cfg, gid, body) {
  const pub = clean(cfg.pub, body);
  const priv = clean(cfg.priv, body);
  if (cfg.required.some((k) => !pub[k])) return json({ error: "missing" }, 400);
  if (site === "wed" && pub.status !== "yes") { pub.guests = 0; priv.meal = ""; priv.bus = false; priv.song = ""; }

  const exists = await DB.prepare("SELECT 1 AS x FROM rsvp WHERE site = ? AND guest_id = ?").bind(site, gid).first();
  if (!exists) {
    const c = await DB.prepare("SELECT COUNT(*) AS c FROM rsvp WHERE site = ?").bind(site).first();
    if (c.c >= MAX_ROWS) return json({ error: "full" }, 429);
  }
  await DB.prepare(
    "INSERT INTO rsvp (site, guest_id, pub, priv, ts) VALUES (?, ?, ?, ?, ?) " +
    "ON CONFLICT (site, guest_id) DO UPDATE SET pub = excluded.pub, priv = excluded.priv, ts = excluded.ts"
  ).bind(site, gid, JSON.stringify(pub), JSON.stringify(priv), Date.now()).run();
  return json({ ok: true });
}

async function saveGift(DB, site, gid, body) {
  const id = String(body?.id ?? "");
  if (!/^[a-z0-9_-]{1,24}$/i.test(id)) return json({ error: "bad_gift" }, 400);

  if (body.action === "free") {
    await DB.prepare("DELETE FROM gifts WHERE site = ? AND gift_id = ? AND guest_id = ?").bind(site, id, gid).run();
    return json({ ok: true });
  }
  if (body.action !== "take") return json({ error: "bad_action" }, 400);

  const held = await DB.prepare("SELECT COUNT(*) AS c FROM gifts WHERE site = ? AND guest_id = ?").bind(site, gid).first();
  if (held.c >= MAX_GIFTS_PER_GUEST) return json({ error: "limit" }, 429);

  // The primary key makes this atomic: when two guests race, only one insert changes a row.
  const res = await DB.prepare(
    "INSERT INTO gifts (site, gift_id, guest_id, name, ts) VALUES (?, ?, ?, ?, ?) ON CONFLICT (site, gift_id) DO NOTHING"
  ).bind(site, id, gid, str(40)(body.name), Date.now()).run();
  if (res.meta.changes === 0) {
    const row = await DB.prepare("SELECT guest_id FROM gifts WHERE site = ? AND gift_id = ?").bind(site, id).first();
    if (row?.guest_id !== gid) return json({ error: "taken" }, 409);
  }
  return json({ ok: true });
}
