// ---- Static content (the party itself) ----
const PARTY_START = new Date("2026-10-17T14:00:00+05:00");
const PARTY_END = new Date("2026-10-17T18:00:00+05:00");

const PLAN = [
  ["14:00","Сбор экипажа","Бейджи космонавтов, фотозона с ракетой, аквагрим.","Встреча","var(--sky)"],
  ["14:30","Предполётный инструктаж","Аниматор‑капитан проводит разминку и делит всех на отряды.","Игры","var(--lemon)"],
  ["15:00","Миссия «Метеоритный дождь»","Квест по центру: карта, шифры и сундук с космическими сокровищами.","Квест","var(--pink)"],
  ["15:45","Дозаправка","Пицца, фруктовые шпажки, морс. Для взрослых — кофе и пирог.","Еда","var(--mint)"],
  ["16:20","Научное шоу","Дым из сухого льда, светящийся слайм и ракета на воде.","Шоу","var(--violet)"],
  ["17:00","Торт и 7 свечей","Поём, загадываем желание, дарим подарки.","Главное","var(--orange)"],
  ["17:20","Дискотека в невесомости","Танцы, мыльные пузыри и конкурс на лучший космический танец.","Танцы","var(--sky)"],
  ["17:50","Мягкая посадка","Каждому гостю — подарочный пакет с сюрпризом. Родители забирают ребят.","Прощание","var(--mint)"]
];

const CREW = [
  ["Алиса","штурман","var(--pink)"],["Тимур","бортинженер","var(--sky)"],["Айлин","связистка","var(--lemon)"],
  ["Даня","пилот","var(--mint)"],["Амир","астроном","var(--orange)"],["Соня","капитан отряда","var(--violet)"],
  ["Арсений","механик","var(--pink)"],["Мадина","исследовательница","var(--sky)"],["Лев","космобиолог","var(--lemon)"],
  ["Ева","фотограф миссии","var(--mint)"],["Бабушка Галя","главный кондитер","var(--orange)"],["Дедушка Серик","командир ЦУПа","var(--violet)"]
];

const ICON = {
  scope:'<path d="M3 11l14-6 2 5-14 6zM9 14l-2 7M11 13l3 8M17 5l2 5"/>',
  rover:'<rect x="4" y="8" width="16" height="7" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M12 8V4m-2 0h4"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h7"/>',
  flask:'<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/><path d="M7 15h10"/>',
  moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  radio:'<rect x="7" y="7" width="10" height="15" rx="2"/><path d="M10 7V2M10 12h4M10 16h4"/>',
  bricks:'<rect x="3" y="10" width="18" height="10" rx="2"/><path d="M7 10V7h4v3M13 10V7h4v3"/>',
  paint:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 3 0 4-1 3-2 3-4c0-4.5-4-8-9-8z"/><circle cx="8" cy="10" r="1.3"/><circle cx="12" cy="7" r="1.3"/><circle cx="16" cy="10" r="1.3"/>'
};
const GIFTS = [
  ["telescope","Детский телескоп","Чтобы разглядеть кратеры на Луне с балкона.","≈ 25–40 тыс. ₸","scope","var(--sky)"],
  ["rover","Радиоуправляемый луноход","Вездеход на больших колёсах, который ездит по песку и траве.","≈ 15–25 тыс. ₸","rover","var(--orange)"],
  ["lego","Конструктор «Космическая станция»","Большой набор с модулями и фигурками космонавтов.","≈ 20–45 тыс. ₸","bricks","var(--pink)"],
  ["chem","Набор юного химика","Безопасные опыты: вулкан, кристаллы, светящийся слайм.","≈ 8–15 тыс. ₸","flask","var(--mint)"],
  ["projector","Ночник‑проектор звёздного неба","Чтобы засыпать под созвездия.","≈ 7–12 тыс. ₸","moon","var(--violet)"],
  ["book","Энциклопедия космоса для детей","С картинками, окошками и фактами про планеты.","≈ 5–9 тыс. ₸","book","var(--lemon)"],
  ["walkie","Детские рации на двоих","Для секретных переговоров с друзьями во дворе.","≈ 7–12 тыс. ₸","radio","var(--sky)"],
  ["paints","Светящиеся краски и холст","Нарисовать свою галактику, которая горит в темноте.","≈ 5–8 тыс. ₸","paint","var(--pink)"]
];

const GREETINGS = ["Экипаж, на старт!","Пристегните ремни!","Ключ на старт, торт на стол!","Космос ждёт героев!","Три, два, один… праздник!","Невесомость гарантирована!"];

// ---- Helpers ----
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
const store = { get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3400); }

// ---- Shared state (filled from db when available) ----
const S = { uid:"me", rsvps:{}, gifts:{}, notes:{}, isOwner:false, online:false };
// Shared storage: same-origin Cloudflare Pages Function + D1 (see functions/api/[[path]].js).
// GID is a random per-browser secret that identifies the guest's own RSVP and gift picks.
const SITE = "m7";
const GID = (() => { try { let g = localStorage.getItem("invite-gid"); if (!g){ g = crypto.randomUUID(); localStorage.setItem("invite-gid", g); } return g; } catch { return crypto.randomUUID(); } })();
// The owners open the page once with #key=SECRET (a fragment never reaches the server; ?key= still works).
// The key is kept for the tab session and wiped from the address bar so it does not end up in history or shared links.
const OWNER_KEY = (() => {
  try {
    const k = new URLSearchParams(location.hash.slice(1)).get("key") || new URLSearchParams(location.search).get("key");
    if (k) { sessionStorage.setItem("invite-owner-key", k); history.replaceState(null, "", location.pathname); }
    return sessionStorage.getItem("invite-owner-key") || "";
  } catch (e) { return ""; }
})();
async function api(path, body, headers){
  const r = await fetch("/api/" + SITE + "/" + path, { method: body ? "POST" : "GET", cache:"no-store",
    headers: Object.assign({ "X-Guest-Id": GID }, body ? { "Content-Type":"application/json" } : {}, headers), body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok){ const e = new Error(j.error || r.status); e.status = r.status; e.code = j.error; throw e; }
  return j;
}
// No status or 404/5xx means the API is unreachable (static preview, offline): fall back to the chat flow
const apiDown = e => !e.status || e.status === 404 || e.status >= 500;

// ---- Greeting, calm mode ----
$("#greet").textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
const calmBox = $("#calm");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
function setCalm(on){ document.documentElement.classList.toggle("calm", on); calmBox.checked = on; store.set("miron7-calm", on); }
setCalm(!!store.get("miron7-calm"));
calmBox.addEventListener("change", () => setCalm(calmBox.checked));
const motionOK = () => !reduced && !calmBox.checked;

// ---- Countdown ----
function tick(){
  const now = new Date(), diff = PARTY_START - now;
  if (diff <= 0){
    $("#countLabel").textContent = now < PARTY_END ? "Праздник уже идёт!" : "Праздник состоялся. Спасибо, экипаж!";
    ["d","h","m","s"].forEach(k => $("#cd-"+k).textContent = "0");
  } else {
    const s = Math.floor(diff / 1000);
    $("#cd-d").textContent = Math.floor(s / 86400);
    $("#cd-h").textContent = String(Math.floor(s % 86400 / 3600)).padStart(2,"0");
    $("#cd-m").textContent = String(Math.floor(s % 3600 / 60)).padStart(2,"0");
    $("#cd-s").textContent = String(s % 60).padStart(2,"0");
  }
  highlightPlan(now);
}

// ---- Plan ----
$("#planList").innerHTML = PLAN.map(([t,h,p,tag,c], i) =>
  `<li class="card step" data-i="${i}"><time>${t}</time><div><h3>${h}</h3><p>${p}</p></div><span class="tag" style="background:${c}">${tag}</span></li>`).join("");
function highlightPlan(now){
  // Only light up a step on the party day, in Almaty time
  const steps = document.querySelectorAll(".step");
  let cur = -1;
  if (now >= PARTY_START && now < PARTY_END){
    PLAN.forEach(([t], i) => { const [h,m] = t.split(":"); if (now >= new Date(`2026-10-17T${h}:${m}:00+05:00`)) cur = i; });
  }
  steps.forEach((el, i) => el.classList.toggle("now", i === cur));
}
tick(); setInterval(tick, 1000);

// ---- Crew ----
const STATUS = { yes:["Летит","st-yes"], maybe:["Думает","st-maybe"], no:["Не сможет","st-no"] };
function latestByGuest(){
  const map = {};
  Object.values(S.rsvps).forEach(r => { if (!r?.guest) return; if (!map[r.guest] || (r.ts||0) > (map[r.guest].ts||0)) map[r.guest] = r; });
  return map;
}
function renderCrew(){
  const by = latestByGuest();
  const extra = Object.keys(by).filter(n => !CREW.some(c => c[0] === n)).map(n => [n,"гость миссии","var(--mint)"]);
  const all = CREW.concat(extra);
  $("#crewList").innerHTML = all.map(([n, role, c]) => {
    const r = by[n], st = r ? STATUS[r.status] : null;
    const initials = n.split(" ").map(w => w[0]).join("").slice(0,2);
    return `<div class="card member"><div class="ava" style="background:${c}">${esc(initials)}</div><div class="who"><b>${esc(n)}</b><small>${esc(role)}</small>
      <span class="st-badge ${st ? st[1] : "st-wait"}">${st ? st[0] : "Ждём ответ"}</span></div></div>`;
  }).join("");
  let yes = 0, kids = 0, adults = 0;
  Object.values(by).forEach(r => { if (r.status === "yes"){ yes++; kids += r.kids||0; adults += r.adults||0; } });
  const answered = Object.keys(by).length;
  $("#crewSum").innerHTML = `<span class="pill">Летят: <b>${yes}</b></span><span class="pill">Ответили: <b>${answered}</b> из ${all.length}</span>
    <span class="pill">На борту: <b>${kids}</b> ${plural(kids,"ребёнок","ребёнка","детей")} и <b>${adults}</b> ${plural(adults,"взрослый","взрослых","взрослых")}</span>`
    + (S.online ? "" : `<span class="pill" style="border-style:dashed">Ответы гостей собираем в чате родителей</span>`);
}

// ---- Guest select ----
const sel = $("#guest");
sel.innerHTML += CREW.map(([n]) => `<option>${esc(n)}</option>`).join("") + `<option value="__other">Другой гость</option>`;
sel.addEventListener("change", () => { $("#otherWrap").hidden = sel.value !== "__other"; $("#guestErr").hidden = true; });
const guestName = () => sel.value === "__other" ? $("#otherName").value.trim() : sel.value;

// ---- Gifts ----
function renderGifts(){
  $("#giftList").innerHTML = GIFTS.map(([id,h,p,price,ic,c]) => {
    const g = S.gifts[id], mine = g && g.by === S.uid, taken = g && !mine;
    const btn = mine ? `<button class="btn small ghost" data-gift="${id}" data-act="free">Передумал(а)</button>`
      : taken ? `<button class="btn small ghost" disabled>Уже выбрали</button>`
      : `<button class="btn small" data-gift="${id}" data-act="take">Я подарю</button>`;
    const meta = mine ? `Вы дарите этот подарок` : taken ? `Дарит: ${esc(g.name || "гость")}` : price;
    return `<article class="card gift ${mine ? "mine" : taken ? "taken" : ""}"><div class="ico" style="background:${c};color:var(--on-accent)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[ic]}</svg></div>
      <h3>${h}</h3><p>${p}</p><span class="meta">${meta}</span>${btn}</article>`;
  }).join("");
}
$("#giftList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-gift]"); if (!b) return;
  const id = b.dataset.gift, free = b.dataset.act === "free";
  const name = guestName() || S.me?.guest || "";
  if (!free && !name){ toast("Сначала выберите своё имя в анкете ниже."); sel.focus(); sel.scrollIntoView({block:"center", behavior: motionOK() ? "smooth" : "auto"}); return; }
  b.disabled = true;
  try {
    await api("gift", { id, action: free ? "free" : "take", name });
    if (free) toast("Подарок снова свободен.");
    else { toast("Готово! Подарок отмечен за вами."); burst(b); }
  } catch (err) {
    toast(err.code === "taken" ? "Кто‑то успел раньше. Выберите другой подарок."
      : err.code === "limit" ? "Можно отметить не больше пяти подарков."
      : err.code === "rate_limited" ? "Слишком много попыток. Подождите немного."
      : apiDown(err) ? "Бронь подарков пока недоступна. Напишите родителям Мирона в чат, что выбрали."
      : "Не получилось сохранить. Попробуйте ещё раз.");
  }
  await sync();
});

// ---- Wishes ----
function renderWishes(){
  const list = Object.values(S.rsvps).filter(r => r?.wish).sort((a,b) => (b.ts||0) - (a.ts||0));
  $("#wishList").innerHTML = list.length
    ? list.map(r => `<figure class="wish" style="margin:0"><p>${esc(r.wish)}</p><small>— ${esc(r.guest)}</small></figure>`).join("")
    : `<p class="empty">Пока здесь пусто. Первое пожелание — самое заметное!</p>`;
}

// ---- Form ----
const counts = { kids:1, adults:0 };
document.querySelectorAll("[data-step]").forEach(b => b.addEventListener("click", () => {
  const k = b.dataset.step; counts[k] = Math.max(0, Math.min(6, counts[k] + +b.dataset.d)); $("#"+k).textContent = counts[k];
}));
document.querySelectorAll("input[name=status]").forEach(r => r.addEventListener("change", () => $("#statusErr").hidden = true));

function fillForm(r, note){
  if (!r) return;
  if (CREW.some(c => c[0] === r.guest)) sel.value = r.guest; else { sel.value = "__other"; $("#otherWrap").hidden = false; $("#otherName").value = r.guest; }
  const radio = $("#st-" + r.status); if (radio) radio.checked = true;
  counts.kids = r.kids ?? 1; counts.adults = r.adults ?? 0; $("#kids").textContent = counts.kids; $("#adults").textContent = counts.adults;
  $("#wish").value = r.wish || ""; if (note != null) $("#note").value = note;
  renderPass(r, false);
}
function renderPass(r, animate){
  const p = $("#pass");
  if (!r){ p.className = "pass draft"; return; }
  $("#passName").textContent = r.guest;
  const seat = (CREW.findIndex(c => c[0] === r.guest) + 1) || 13;
  $("#passSeat").textContent = r.status === "yes" ? `${seat}${"АБВГ"[seat % 4]}` : "—";
  $("#passState").textContent = r.status === "yes" ? "на борту" : r.status === "maybe" ? "лист ожидания" : "в другой раз";
  p.className = "pass" + (r.status === "yes" ? " ok" : r.status === "no" ? " draft" : "");
  if (animate && r.status === "yes"){ p.classList.remove("ok"); void p.offsetWidth; p.classList.add("ok"); }
}

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const guest = guestName(), status = document.querySelector("input[name=status]:checked")?.value;
  $("#guestErr").hidden = !!guest; $("#statusErr").hidden = !!status;
  if (!guest){ (sel.value === "__other" ? $("#otherName") : sel).focus(); return; }
  if (!status) { $("#st-yes").focus(); return; }
  const rec = { guest, status, kids:counts.kids, adults:counts.adults, wish:$("#wish").value.trim().slice(0,220), ts:Date.now() };
  const note = $("#note").value.trim().slice(0,300);
  const btn = $("#submitBtn"); btn.disabled = true; $("#saveState").textContent = "Отправляем…";
  try {
    try {
      await api("rsvp", { guest, status, kids:rec.kids, adults:rec.adults, wish:rec.wish, note });
      store.set("miron7-rsvp", { rec, note });
      S.online = true;
      $("#saveState").textContent = "Ответ сохранён. Его видят родители Мирона.";
      sync();
    } catch (err) {
      if (!apiDown(err)) throw err;
      store.set("miron7-rsvp", { rec, note });
      S.rsvps.local = rec; renderAll();
      $("#saveState").textContent = "Ответ сохранён только на этом устройстве. Продублируйте его в чате родителей.";
    }
    renderPass(rec, true);
    toast(status === "yes" ? "Ура! Место на борту закреплено." : status === "maybe" ? "Хорошо, ждём вашего решения." : "Жаль! Мирон будет скучать.");
    if (status === "yes") burst($("#pass"));
  } catch (err) {
    $("#saveState").textContent = err?.code === "name_taken" ? "Этот гость уже ответил с другого устройства. Если это вы, напишите родителям Мирона в чат."
      : err?.code === "rate_limited" ? "Слишком много попыток. Подождите минуту и отправьте ещё раз."
      : "Не удалось отправить. Проверьте интернет и нажмите ещё раз.";
  } finally { btn.disabled = false; }
});

// ---- Candles easter egg ----
const candles = $("#candles");
candles.innerHTML = Array.from({length:7}, (_, i) => `<button class="candle" type="button" aria-pressed="false" aria-label="Задуть свечу ${i+1}"><span class="fl"></span><span class="st"></span></button>`).join("");
candles.addEventListener("click", e => {
  const c = e.target.closest(".candle"); if (!c || c.getAttribute("aria-pressed") === "true") return;
  c.setAttribute("aria-pressed","true");
  const left = candles.querySelectorAll('[aria-pressed="false"]').length;
  if (!left){
    toast("Желание загадано! Никому не рассказывайте.");
    burst(candles, 220);
    setTimeout(() => candles.querySelectorAll(".candle").forEach(x => x.setAttribute("aria-pressed","false")), 4500);
  }
});

// ---- Rocket easter egg ----
const rocket = $("#rocket");
rocket.addEventListener("click", () => {
  if (!motionOK()){ burst(rocket); return; }
  if (rocket.classList.contains("launch")) return;
  rocket.classList.add("launch"); burst(rocket, 120);
  setTimeout(() => rocket.classList.remove("launch"), 2450);
});

// ---- Confetti ----
const cv = $("#confetti"), cx = cv.getContext("2d");
let parts = [], raf = 0;
function resize(){ cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
addEventListener("resize", resize); resize();
function burst(el, n = 90){
  if (!motionOK()) return;
  const r = el.getBoundingClientRect(), cs = getComputedStyle(document.documentElement);
  const colors = ["--orange","--lemon","--mint","--pink","--sky","--violet"].map(v => cs.getPropertyValue(v).trim());
  for (let i = 0; i < n; i++) parts.push({
    x:(r.left + r.width/2) * devicePixelRatio, y:(r.top + r.height/3) * devicePixelRatio,
    vx:(Math.random()-.5) * 18, vy:(-Math.random() * 16 - 6), g:.45, rot:Math.random()*6, vr:(Math.random()-.5)*.4,
    w:(6 + Math.random()*8) * devicePixelRatio, h:(4 + Math.random()*6) * devicePixelRatio, c:colors[i % colors.length], life:140
  });
  if (!raf) raf = requestAnimationFrame(step);
}
function step(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts = parts.filter(p => p.life-- > 0 && p.y < cv.height + 40);
  for (const p of parts){
    p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life/40); cx.fillStyle = p.c; cx.fillRect(-p.w/2,-p.h/2,p.w,p.h); cx.restore();
  }
  raf = parts.length ? requestAnimationFrame(step) : 0;
  if (!raf) cx.clearRect(0,0,cv.width,cv.height);
}

// ---- Render all ----
function renderAll(){ renderCrew(); renderGifts(); renderWishes(); renderOwner(); }
function renderOwner(){
  if (!S.isOwner) return;
  $("#owner").hidden = false;
  const rows = Object.values(S.notes).sort((a,b) => (b.ts||0) - (a.ts||0));
  $("#ownerRows").innerHTML = rows.length ? rows.map(n => `<tr><td>${esc(n.guest)}</td><td>${STATUS[n.status]?.[0] || "—"}</td><td>${n.kids ?? 0} / ${n.adults ?? 0}</td><td>${esc(n.note) || "—"}</td></tr>`).join("")
    : `<tr><td colspan="4">Пока никто не ответил.</td></tr>`;
}

// Local fallback so a returning viewer sees their own answer even offline
const saved = store.get("miron7-rsvp");
if (saved?.rec){ fillForm(saved.rec, saved.note); }
renderAll();

// ---- Shared data ----
async function sync(){
  try {
    const j = await api("state");
    S.online = true;
    S.rsvps = Object.fromEntries(j.rsvps.map((r, i) => [i, r]));
    S.gifts = Object.fromEntries(Object.entries(j.gifts).map(([id, g]) => [id, { by: g.mine ? S.uid : "other", name: g.name }]));
    S.me = j.mine;
    if (j.mine && !$("#form").dataset.filled){ $("#form").dataset.filled = "1"; fillForm(j.mine, j.mine.note); }
    if (OWNER_KEY){
      try {
        S.notes = Object.fromEntries((await api("owner", null, { "X-Owner-Key": OWNER_KEY })).rows.map((r, i) => [i, r]));
        S.isOwner = true;
      } catch {}
    }
    renderAll();
  } catch { S.online = false; renderAll(); }
}
sync();
setInterval(() => { if (!document.hidden) sync(); }, 20000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });
