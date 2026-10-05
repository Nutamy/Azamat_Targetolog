(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let still = reduced;
  try { if (localStorage.getItem("calm") === "1") still = true; } catch (e) {}

  const toastEl = $("#toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  // ---------- calm mode (grump mode from the emotional-design playbook) ----------
  const calmBtn = $("#calm");
  function applyCalm() {
    document.body.classList.toggle("still", still);
    calmBtn.setAttribute("aria-pressed", String(still));
  }
  calmBtn.addEventListener("click", () => {
    still = !still;
    try { localStorage.setItem("calm", still ? "1" : "0"); } catch (e) {}
    applyCalm();
    toast(still ? "Анимации выключены" : "Анимации снова с нами");
  });
  applyCalm();

  // ---------- split names into animated letters ----------
  document.querySelectorAll("[data-split]").forEach((el, gi) => {
    const txt = el.textContent;
    el.setAttribute("aria-label", txt);
    el.innerHTML = [...txt].map((ch, i) =>
      `<span class="char" aria-hidden="true" style="animation-delay:${gi * 380 + i * 55}ms">${esc(ch)}</span>`).join("");
  });

  // ---------- countdown ----------
  const WEDDING = new Date("2027-06-12T15:00:00+05:00").getTime();
  const cells = {};
  document.querySelectorAll("#count b").forEach((b) => (cells[b.dataset.k] = b));
  function setCell(k, v) {
    const span = cells[k].firstElementChild;
    if (span.textContent === v) return;
    const n = document.createElement("span");
    n.textContent = v;
    if (!still) n.className = "tick";
    cells[k].replaceChildren(n);
  }
  function tickCount() {
    let d = Math.max(0, WEDDING - Date.now());
    const days = Math.floor(d / 864e5); d -= days * 864e5;
    const h = Math.floor(d / 36e5); d -= h * 36e5;
    const m = Math.floor(d / 6e4); d -= m * 6e4;
    const s = Math.floor(d / 1e3);
    setCell("d", String(days));
    setCell("h", String(h).padStart(2, "0"));
    setCell("m", String(m).padStart(2, "0"));
    setCell("s", String(s).padStart(2, "0"));
  }
  tickCount();
  setInterval(tickCount, 1000);

  // ---------- schedule ----------
  const PROGRAM = [
    ["13:00", "Трансфер из города", "Автобус от площади Республики. Водитель подождёт до 13:10.", "bus", "turq"],
    ["14:00", "Сбор гостей и welcome", "Лимонады с облепихой, лёгкие закуски, фотозона из живых тюльпанов.", "glass", "saffron"],
    ["15:00", "Выездная регистрация", "Арка с видом на горы. Платочки для мам и пап раздадим заранее.", "rings", "pom"],
    ["15:40", "Поздравления и общее фото", "Обнимашки, шампанское и большой кадр всех гостей с дрона.", "camera", "turq"],
    ["16:30", "Беташар", "Традиционное открытие лица невесты под песню-наставление акына.", "veil", "saffron"],
    ["17:00", "Банкет", "Бешбармак, плов из казана, тосты и первые танцы между переменами блюд.", "plate", "pom"],
    ["19:00", "Первый танец", "Мы долго репетировали. Пожалуйста, не снимайте момент, где Тимур сбивается.", "music", "turq"],
    ["20:00", "Шашу и игры", "Осыпаем молодых сладостями и монетками на счастье. Ловите: это к достатку.", "coins", "saffron"],
    ["21:00", "Торт", "Три яруса: фисташка, малина и апорт — алматинское яблоко, конечно.", "cake", "pom"],
    ["22:00", "Фейерверк и бенгальские огни", "Все выходим на лужайку. Огни выдадим у выхода из шатра.", "spark", "turq"],
    ["23:30", "Трансфер обратно", "Автобус до площади Республики. Такси тоже вызовем, не переживайте.", "moon", "saffron"],
  ];
  const tl = $("#tl");
  tl.innerHTML = PROGRAM.map(([t, h, p, ic, c], i) => `
    <li style="--i:${i};--c:var(--${c})" data-t="${t}">
      <time datetime="2027-06-12T${t}">${t}</time>
      <span class="ic" aria-hidden="true"><svg><use href="#i-${ic}"/></svg></span>
      <div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>
    </li>`).join("");
  // Highlight the current item only on the wedding day itself (Almaty time).
  function markNow() {
    const now = new Date(Date.now() + 5 * 36e5);
    const isDay = now.toISOString().slice(0, 10) === "2027-06-12";
    const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
    let idx = -1;
    PROGRAM.forEach(([t], i) => { const [hh, mm] = t.split(":").map(Number); if (hh * 60 + mm <= mins) idx = i; });
    tl.querySelectorAll("li").forEach((li, i) => li.classList.toggle("now", isDay && i === idx));
  }
  markNow();
  setInterval(markNow, 60000);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { tl.classList.add("anim"); io.disconnect(); } }), { threshold: .15 });
    io.observe(tl);
  }

  // ---------- guests & tables ----------
  const TABLES = [
    { name: "Алатау", c: "pom", guests: [
      ["Сауле и Ерлан Жумабековы", "родители невесты"], ["Роза-апа Жумабекова", "бабушка невесты"],
      ["Дина Жумабекова", "сестра невесты"], ["Арман Жумабеков", "брат невесты"], ["Гульнар Искакова", "тётя невесты"], ["Бауыржан Искаков", "дядя невесты"] ] },
    { name: "Кок-Тобе", c: "saffron", guests: [
      ["Марина и Олег Соколовы", "родители жениха"], ["Валентина Петровна Соколова", "бабушка жениха"],
      ["Кирилл Соколов", "брат жениха"], ["Алина Соколова", "невестка"], ["Светлана Ким", "крёстная жениха"] ] },
    { name: "Медеу", c: "turq", guests: [
      ["Асель Нурланова", "подружка невесты"], ["Жанель Бекова", "подружка невесты"], ["Мадина Серикова", "подруга с универа"],
      ["Томирис Ахметова", "подруга детства"], ["Ерик Ахметов", "плюс один Томирис"], ["Лаура Оспанова", "коллега"] ] },
    { name: "Шарын", c: "pom", guests: [
      ["Даниил Орлов", "шафер"], ["Алихан Сейтказиев", "друг жениха"], ["Нуржан Тулегенов", "друг по походам"],
      ["Руслан Ким", "друг по походам"], ["Айдана Тулегенова", "жена Нуржана"], ["Максим Ли", "сосед по общаге"] ] },
    { name: "Кольсай", c: "saffron", guests: [
      ["Ербол и Жанна Сатпаевы", "друзья семьи"], ["Игорь Васильев", "начальник Тимура"], ["Алия Абдрахманова", "наставница Айгерим"],
      ["Самал Кенжебаева", "коллега"], ["Денис Павлов", "коллега"] ] },
    { name: "Бутаковка", c: "turq", guests: [
      ["Дана Мусина", "координатор свадьбы"], ["Айжан Мусина", "фотограф"], ["Тимофей Гончаров", "видеограф"],
      ["Ержан Абенов", "ведущий"], ["DJ Qaz", "музыка вечера"] ] },
  ];
  const tablesEl = $("#tables");
  tablesEl.innerHTML = TABLES.map((t, ti) => `
    <article class="tbl" style="--c:var(--${t.c})" data-ti="${ti}">
      <header><h3>${esc(t.name)}</h3><span class="num">Стол ${ti + 1}</span></header>
      <ul>${t.guests.map(([n, r]) => `<li data-n="${esc(n.toLowerCase())}"><span>${esc(n)}</span><small>${esc(r)}</small></li>`).join("")}</ul>
    </article>`).join("");
  const total = TABLES.reduce((a, t) => a + t.guests.length, 0);
  const found = $("#found");
  found.textContent = `${TABLES.length} столов · ${total} приглашений`;
  $("#gq").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase().replace(/ё/g, "е");
    let hits = [];
    tablesEl.querySelectorAll(".tbl").forEach((tbl) => {
      let any = false;
      tbl.querySelectorAll("li").forEach((li) => {
        const m = q.length > 1 && li.dataset.n.replace(/ё/g, "е").includes(q);
        li.classList.toggle("hit", m);
        if (m) { any = true; hits.push([li.firstElementChild.textContent, +tbl.dataset.ti]); }
      });
      tbl.classList.toggle("dim", q.length > 1 && !any);
    });
    if (q.length < 2) { found.textContent = `${TABLES.length} столов · ${total} приглашений`; return; }
    if (!hits.length) { found.textContent = "Не нашли такого имени. Проверьте написание или спросите Дану."; return; }
    const [n, ti] = hits[0];
    found.innerHTML = hits.length === 1
      ? `${esc(n)}: <b>стол ${ti + 1}, «${esc(TABLES[ti].name)}»</b>`
      : `Нашли ${hits.length} совпадения — отмечены ниже`;
  });

  // ---------- gifts ----------
  const GIFTS = [
    ["coffee", "Кофемашина с капучинатором", "Чтобы утро начиналось без спора, кто варит кофе.", "~ 180 000 ₸", "pom"],
    ["pot", "Чугунный казан на 8 литров", "Для плова на всю будущую родню.", "~ 45 000 ₸", "saffron"],
    ["film", "Проектор для киновечеров", "Смотреть кино на стене спальни.", "~ 120 000 ₸", "turq"],
    ["tent", "Палатка на двоих и два спальника", "Мы ещё не все озёра обошли.", "~ 150 000 ₸", "pom"],
    ["bed", "Сатиновое бельё, евро", "Два комплекта: светлый и цвета граната.", "~ 60 000 ₸", "saffron"],
    ["robot", "Робот-пылесос", "Пусть убирает, пока мы в горах.", "~ 140 000 ₸", "turq"],
    ["dice", "Настольные игры для компании", "Каркассон, Диксит и что-нибудь на ваш вкус.", "~ 35 000 ₸", "pom"],
    ["leaf", "Большая монстера в кашпо", "Первое общее растение, которое выживет.", "~ 30 000 ₸", "saffron"],
    ["plane", "Вклад в медовый месяц", "Любая сумма в поездку в Сванетию.", "по желанию", "turq"],
  ];
  // ---------- shared storage: same-origin API (Cloudflare Pages Functions + D1) ----------
  const SITE = "wed";
  // Random id kept in this browser; it identifies the guest's own RSVP and gift picks
  const GID = (() => { try { let g = localStorage.getItem("invite-gid"); if (!g) { g = crypto.randomUUID(); localStorage.setItem("invite-gid", g); } return g; } catch (e) { return crypto.randomUUID(); } })();
  // The owners open the page once with #key=SECRET (a fragment never reaches the server; ?key= still works).
  // The key is kept for the tab session and wiped from the address bar so it does not end up in history or shared links.
  const OWNER_KEY = (() => {
    try {
      const k = new URLSearchParams(location.hash.slice(1)).get("key") || new URLSearchParams(location.search).get("key");
      if (k) { sessionStorage.setItem("invite-owner-key", k); history.replaceState(null, "", location.pathname); }
      return sessionStorage.getItem("invite-owner-key") || "";
    } catch (e) { return ""; }
  })();
  async function api(path, body, headers) {
    const r = await fetch("/api/" + SITE + "/" + path, { method: body ? "POST" : "GET", cache: "no-store",
      headers: Object.assign({ "X-Guest-Id": GID }, body ? { "Content-Type": "application/json" } : {}, headers), body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || r.status); e.status = r.status; e.code = j.error; throw e; }
    return j;
  }
  // No status or 404/5xx means the API is not reachable (static preview, offline): fall back to the copy-paste flow
  const apiDown = (e) => !e.status || e.status === 404 || e.status >= 500;

  const giftEl = $("#giftlist");
  let giftState = {};  // gid -> {by}
  const uid = "me";
  function renderGifts() {
    giftEl.innerHTML = GIFTS.map(([ic, h, p, price, c], i) => {
      const gid = "g" + i;
      const by = giftState[gid]?.by;
      const mine = by && by === uid;
      const taken = by && !mine;
      const shared = gid === "g8"; // the honeymoon fund accepts many givers
      let btn;
      if (shared) btn = `<button class="gbtn" type="button" data-gift="${gid}" data-fund="1">Хочу вложиться</button>`;
      else if (mine) btn = `<button class="gbtn mine" type="button" data-gift="${gid}" aria-pressed="true">Вы дарите · отменить</button>`;
      else if (taken) btn = `<button class="gbtn taken" type="button" disabled>Уже выбрали</button>`;
      else btn = `<button class="gbtn" type="button" data-gift="${gid}" aria-pressed="false">Я подарю</button>`;
      return `<article class="gift${taken ? " is-taken" : ""}" style="--c:var(--${c})">
        <span class="gi" aria-hidden="true"><svg><use href="#i-${ic}"/></svg></span>
        <h3>${esc(h)}</h3><p>${esc(p)}</p>
        <div class="row"><span class="price">${esc(price)}</span>${btn}</div>
      </article>`;
    }).join("");
  }
  renderGifts();
  giftEl.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-gift]");
    if (!b) return;
    if (b.dataset.fund) { burstAt(e.clientX, e.clientY, 40); toast("Спасибо! Конверт или перевод — как вам удобнее"); return; }
    const gid = b.dataset.gift;
    const mine = giftState[gid]?.by === uid;
    b.disabled = true;
    try {
      await api("gift", { id: gid, action: mine ? "free" : "take", name: $("#f-name").value.trim() });
      if (mine) toast("Бронь снята");
      else { burstAt(e.clientX, e.clientY, 50); toast("Записали: этот подарок ваш"); }
    } catch (err) {
      toast(err.code === "taken" ? "Этот подарок только что выбрал другой гость"
        : err.code === "limit" ? "Можно отметить не больше пяти подарков"
        : err.code === "rate_limited" ? "Слишком много попыток. Подождите немного"
        : apiDown(err) ? "Бронь подарков пока недоступна. Напишите молодожёнам, что выбрали"
        : "Не получилось сохранить, попробуйте ещё раз");
    }
    await sync();
  });

  // ---------- RSVP ----------
  const form = $("#form");
  const yesFields = $("#yes-fields");
  const formStatus = $("#form-status");
  function syncYes() {
    const st = form.status.value;
    yesFields.hidden = st === "no";
  }
  form.addEventListener("change", syncYes);
  syncYes();
  const MEAL = { meat: "бешбармак", fish: "форель", veg: "овощное" };

  function collect() {
    const st = form.status.value;
    return {
      name: $("#f-name").value.trim().slice(0, 80),
      status: st,
      guests: st === "yes" ? Math.min(6, Math.max(1, parseInt($("#f-count").value, 10) || 1)) : 0,
      meal: st === "yes" ? form.meal.value : "",
      bus: st === "yes" && $("#f-bus").checked,
      song: st === "yes" ? $("#f-song").value.trim().slice(0, 100) : "",
      wish: $("#f-wish").value.trim().slice(0, 400),
    };
  }
  function validate(d) {
    let ok = true;
    $("#err-name").hidden = !!d.name; if (!d.name) ok = false;
    $("#err-status").hidden = !!d.status; if (!d.status) ok = false;
    if (!ok) (d.name ? $("#f-yes") : $("#f-name")).focus();
    return ok;
  }
  function asText(d) {
    return d.status === "yes"
      ? `${d.name}: буду на свадьбе 12.06. Нас ${d.guests}, горячее — ${MEAL[d.meal]}${d.bus ? ", нужен трансфер" : ""}.${d.song ? " Песня: " + d.song + "." : ""}${d.wish ? " Пожелание: " + d.wish : ""}`
      : `${d.name}: к сожалению, не смогу прийти 12.06.${d.wish ? " Пожелание: " + d.wish : ""}`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = collect();
    if (!validate(d)) return;
    const send = $("#send");
    send.disabled = true;
    formStatus.className = "status";
    formStatus.textContent = "Отправляем…";
    try {
      await api("rsvp", d);
      filled = true; // keep the thank-you message instead of the "already answered" one
      $("#fallback").hidden = true;
      formStatus.className = "status ok";
      formStatus.textContent = d.status === "yes" ? `Ура, ${d.name.split(" ")[0]}! Ждём вас 12 июня.` : "Спасибо, что ответили. Будем скучать!";
      send.textContent = "Обновить ответ";
      if (d.status === "yes") { const r = send.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top, 140); }
      await sync();
    } catch (err) {
      formStatus.className = "status bad";
      if (err.code === "name_taken") {
        formStatus.textContent = "Гость с таким именем уже ответил с другого устройства. Если это вы, напишите Дане, и она поправит ответ.";
        $("#f-name").focus();
        return;
      }
      formStatus.textContent = err.code === "rate_limited" ? "Слишком много попыток. Подождите минуту и отправьте ещё раз."
        : apiDown(err) ? "Сайт сейчас не принимает ответы." : "Не получилось сохранить.";
      $("#fb-text").textContent = asText(d);
      $("#fallback").hidden = false;
    } finally { send.disabled = false; }
  });
  $("#fb-copy").addEventListener("click", () => copyText($("#fb-text").textContent));

  function fillForm(d) {
    $("#f-name").value = d.name || "";
    if (d.status) form.status.value = d.status;
    if (d.guests) $("#f-count").value = d.guests;
    if (d.meal) form.meal.value = d.meal;
    $("#f-bus").checked = !!d.bus;
    $("#f-song").value = d.song || "";
    $("#f-wish").value = d.wish || "";
    syncYes();
    $("#send").textContent = "Обновить ответ";
    formStatus.className = "status ok";
    formStatus.textContent = "Вы уже ответили. Можно изменить ответ.";
  }

  // ---------- wishes, counter, owner summary ----------
  const WISH_TINTS = ["var(--tint-pom)", "var(--tint-saf)", "var(--tint-turq)"];
  function renderPublic(people, wishes) {
    $("#yes-count").textContent = people;
    $("#yes-label").textContent = people === 1 ? "гость уже подтвердил" : "гостей уже подтвердили";
    $("#wall").innerHTML = wishes.length
      ? wishes.map((d, i) => `<figure class="wish" style="--c:${WISH_TINTS[i % 3]};margin-inline:0"><q>${esc(d.wish)}</q><span>— ${esc(d.name || "Гость")}</span></figure>`).join("")
      : `<div class="empty">Здесь появятся пожелания гостей. Оставьте первое в анкете выше.</div>`;
  }
  function renderOwner(docs) {
    $("#summary").hidden = false;
    const yes = docs.filter((d) => d.status === "yes");
    const people = yes.reduce((a, d) => a + (d.guests || 1), 0);
    const no = docs.filter((d) => d.status === "no").length;
    const cnt = (k) => yes.filter((d) => d.meal === k).reduce((a, d) => a + (d.guests || 1), 0);
    const bus = yes.filter((d) => d.bus).reduce((a, d) => a + (d.guests || 1), 0);
    $("#stats").innerHTML = [
      [people, "придут (человек)"], [no, "не смогут"], [bus, "мест в автобусе"],
      [cnt("meat"), "бешбармак"], [cnt("fish"), "форель"], [cnt("veg"), "овощное"],
    ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
    $("#rows").innerHTML = docs.length ? docs.map((d) => `<tr>
      <td>${esc(d.name)}</td><td>${d.status === "yes" ? "придёт" : "не сможет"}</td><td>${d.guests || "—"}</td>
      <td>${esc(MEAL[d.meal] || "—")}</td><td>${d.bus ? "да" : "—"}</td><td>${esc(d.song || "—")}</td></tr>`).join("")
      : `<tr><td colspan="6">Пока никто не ответил.</td></tr>`;
  }

  // ---------- data layer ----------
  let filled = false;
  async function sync() {
    try {
      const j = await api("state");
      giftState = Object.fromEntries(Object.entries(j.gifts).map(([id, g]) => [id, { by: g.mine ? uid : "other" }]));
      renderGifts();
      renderPublic(j.people, j.wishes);
      if (j.mine && !filled) { filled = true; fillForm(j.mine); }
      if (OWNER_KEY) {
        try { renderOwner((await api("owner", null, { "X-Owner-Key": OWNER_KEY })).rows); } catch (e) {}
      }
    } catch (e) { $("#yes-count").textContent = "—"; }
  }
  sync();
  setInterval(() => { if (!document.hidden) sync(); }, 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });

  // ---------- copy helpers ----------
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); toast("Скопировано"); }
    catch (e) { toast("Выделите текст и скопируйте вручную"); }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy],[data-copy-text]");
    if (!b) return;
    copyText(b.dataset.copyText || $(b.dataset.copy).textContent.trim());
  });

  // ---------- petals (ambient hero) ----------
  const COLORS = ["#FFD27A", "#FFFFFF", "#FF9DB8", "#7FE3DC", "#F6B24A"];
  const pc = $("#petals"), px = pc.getContext("2d");
  let petals = [], pw = 0, ph = 0, dpr = 1;
  function sizePetals() {
    dpr = Math.min(2, devicePixelRatio || 1);
    pw = pc.clientWidth; ph = pc.clientHeight;
    pc.width = pw * dpr; pc.height = ph * dpr;
    px.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, pw / 18));
    petals = Array.from({ length: n }, () => newPetal(true));
  }
  function newPetal(anywhere) {
    return {
      x: Math.random() * pw, y: anywhere ? Math.random() * ph : -20,
      r: 4 + Math.random() * 7, vy: .35 + Math.random() * .8, sw: Math.random() * 6.28,
      rot: Math.random() * 6.28, vr: (Math.random() - .5) * .04, c: COLORS[(Math.random() * COLORS.length) | 0], a: .5 + Math.random() * .5,
    };
  }
  function drawPetal(ctx, p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function petalFrame() {
    px.clearRect(0, 0, pw, ph);
    for (const p of petals) {
      if (!still) {
        p.sw += .02; p.y += p.vy; p.x += Math.sin(p.sw) * .6; p.rot += p.vr;
        if (p.y > ph + 20) Object.assign(p, newPetal(false));
      }
      drawPetal(px, p);
    }
    requestAnimationFrame(petalFrame);
  }
  sizePetals();
  addEventListener("resize", sizePetals);
  requestAnimationFrame(petalFrame);

  // ---------- burst (shashu: sweets & coins) ----------
  const bc = $("#burst"), bx = bc.getContext("2d");
  let parts = [], running = false;
  function sizeBurst() {
    const r = Math.min(2, devicePixelRatio || 1);
    bc.width = innerWidth * r; bc.height = innerHeight * r;
    bx.setTransform(r, 0, 0, r, 0, 0);
  }
  sizeBurst();
  addEventListener("resize", sizeBurst);
  const BURST = ["#D1144F", "#E8920C", "#0B8F8B", "#FFD27A", "#FF9DB8", "#6C2B6D"];
  function burstAt(x, y, n) {
    if (still) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, v = 4 + Math.random() * 8;
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, g: .28, life: 90 + Math.random() * 40,
        r: 3 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
        c: BURST[(Math.random() * BURST.length) | 0], coin: Math.random() < .25,
      });
    }
    if (!running) { running = true; requestAnimationFrame(burstFrame); }
  }
  function burstFrame() {
    bx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      bx.save(); bx.translate(p.x, p.y); bx.rotate(p.rot); bx.globalAlpha = Math.min(1, p.life / 30);
      if (p.coin) {
        bx.fillStyle = "#F2B53A"; bx.beginPath(); bx.ellipse(0, 0, p.r + 2, (p.r + 2) * Math.abs(Math.cos(p.rot * 2)) + 1, 0, 0, 6.283); bx.fill();
      } else {
        bx.fillStyle = p.c; bx.fillRect(-p.r, -p.r * .4, p.r * 2, p.r * .8);
      }
      bx.restore();
    }
    if (parts.length) requestAnimationFrame(burstFrame);
    else { running = false; bx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  let ampClicks = 0;
  $("#amp").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, 120);
    ampClicks++;
    const lines = ["Шашу! Это к счастью молодых", "Ещё горсть конфет на удачу", "Кто поймал монетку — к достатку", "Вы точно лучший гость"];
    toast(still ? "Шашу! (анимации выключены)" : lines[(ampClicks - 1) % lines.length]);
  });
})();
