<div align="center">

<img src="docs/preview-v1.jpg" alt="Сайт-визитка таргетолога Азамата Жеңісұлы — тёмный вариант" width="100%">

# Азамат Жеңісұлы · таргетолог

**Сайт-визитка и коммерческое предложение для таргетолога из Алматы.**
Три сайта на одной странице с вкладками: визитка таргетолога, свадьба и день рождения.

[![Live](https://img.shields.io/badge/демо-azamat--targetolog.pages.dev-10B981?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://azamat-targetolog.pages.dev/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![No framework](https://img.shields.io/badge/фреймворки-0-0D0F12?style=flat-square)

</div>

---

## Варианты

| | Вариант | Характер | Ссылка |
|:-:|---|---|---|
| <img src="docs/preview-v1.jpg" width="260"> | **1 · Тёмный** | Tech-стиль: графитовый фон, изумрудный акцент, бронзовый портрет, живой калькулятор окупаемости | [v1.html](https://azamat-targetolog.pages.dev/v1) |
| <img src="docs/preview-v2.jpg" width="260"> | **2 · Свадьба** | Приглашение «Айгерим & Тимур»: гранат, шафран и бирюза, казахский орнамент, программа дня, вишлист с бронью, анкета гостя | [v2.html](https://azamat-targetolog.pages.dev/v2) |
| <img src="docs/preview-v3.jpg" width="260"> | **3 · День рождения** | «Мирону 7»: космическая вечеринка, обратный отсчёт, список гостей, подарки, посадочный талон-RSVP | [v3.html](https://azamat-targetolog.pages.dev/v3) |

[`index.html`](index.html) — переключатель сайтов с вкладками. У каждого варианта своя ссылка через хэш: `/#v1`, `/#v2`, `/#v3`.

## Что внутри

- **Структура продающей страницы** — оффер, «Обо мне», система из 7 шагов, окупаемость, контакты, CTA в WhatsApp.
- **Калькулятор ROI** (вариант 1) — ползунок бюджета, считает целевой возврат ×3 и чистую прибыль.
- **Быстрая загрузка** — портрет в AVIF / WebP / JPEG с `srcset`, `fetchpriority="high"` для LCP, CSS собран Tailwind'ом и минифицирован, без JS-фреймворков.
- **Доступность** — семантическая разметка, `aria`-вкладки с управлением стрелками, видимый фокус, `prefers-reduced-motion`, пауза бегущей строки.
- **Превью в мессенджерах** — Open Graph и Twitter Card с картинкой `og-card.jpg` 1200×630 (baseline JPEG — прогрессивный WhatsApp показывает маленькой миниатюрой).
- **Безопасность** — заголовки CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` в [`_headers`](_headers).

## Структура

```
.
├── index.html            # tab switcher between the three sites
├── v1.html / v1.css      # dark variant
├── v2.html               # wedding invitation (self-contained, inline CSS/JS)
├── v3.html               # kids birthday invitation (self-contained, inline CSS/JS)
├── azamat-*.{avif,webp,jpg}       # portrait, white backdrop (unused since v2/v3 were replaced)
├── azamat-dark-*.{avif,webp,jpg}  # mirrored portrait, bronze backdrop (v1)
├── og-card.jpg           # link preview image (baseline JPEG)
├── docs/                 # README screenshots
├── _headers              # Cloudflare Pages security headers
└── tailwind/             # Tailwind configs and build scripts
```

## Сборка CSS

HTML можно править напрямую. Tailwind используется только в варианте 1 (`v2.html` и `v3.html` самодостаточны). Если меняются классы — пересоберите CSS:

```bash
cd tailwind
npm install
npm run build:v1
```

## Деплой

Статика без шага сборки — Cloudflare Pages раздаёт корень репозитория.
Build command: пусто · Output directory: `/`.

Локальный просмотр:

```bash
npx serve .
```

---

<div align="center">

Разработка — **[Алтын Клик](https://github.com/Nutamy)** · лендинги для малого бизнеса Алматы

<sub>© 2026 Азамат Жеңісұлы. Тексты и фотографии принадлежат владельцу сайта.</sub>

</div>
