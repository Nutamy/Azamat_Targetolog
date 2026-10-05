(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  // Inline onload/onerror attributes are blocked by the CSP, so these two hooks live here
  document.querySelectorAll('link[data-async-css]').forEach(function (l) { l.media = 'all'; });
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    // decode() rejects only for a broken image, so an already-finished load is checked without races
    if (img.complete) img.decode().catch(function () { img.remove(); });
    else img.addEventListener('error', function () { img.remove(); });
  });

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = new Intl.NumberFormat('ru-RU');

  /* 1. Текущий год */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 2. WhatsApp-ссылки: предзаполненное сообщение */
  var waMsg = encodeURIComponent('Здравствуйте, Азамат! Хочу обсудить проект по таргетированной рекламе.');
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    a.href = 'https://wa.me/77029992938?text=' + waMsg;
  });

  /* 3. Шапка при скролле */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 4. Счётчики цифр */
  function animateCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseInt(el.dataset.countTo, 10) || 0;
    if (reduced) { el.textContent = target; return; }
    var start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* 5. Появление блоков + заливка шкал */
  function fillBars(root) {
    root.querySelectorAll('[data-fill]').forEach(function (b) { b.classList.add('is-filled'); });
  }
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); fillBars(el); });
  } else {
    var groups = new Map();
    revealEls.forEach(function (el) {
      var i = groups.get(el.parentElement) || 0;
      el.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
      groups.set(el.parentElement, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-visible');
        fillBars(el);
        el.querySelectorAll('[data-count-to]').forEach(animateCount);
        setTimeout(function () { el.style.transitionDelay = ''; }, 900);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* 6. Интерактивный расчёт $1 → $3+ */
  var range = document.getElementById('roiRange');
  if (range) {
    var invEl = document.getElementById('roiInv'),
        retEl = document.getElementById('roiRet'),
        netEl = document.getElementById('roiNet');

    function tween(el, to) {
      if (reduced) { el.textContent = fmt.format(to); return; }
      var from = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 260, 1);
        el.textContent = fmt.format(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function render() {
      var v = parseInt(range.value, 10);
      range.style.setProperty('--fill', (((v - +range.min) / (+range.max - +range.min)) * 100) + '%');
      range.setAttribute('aria-valuetext', fmt.format(v) + ' тенге');
      tween(invEl, v); tween(retEl, v * 3); tween(netEl, v * 2);
    }
    range.addEventListener('input', render);
    render();
  }

  /* 6b. Пауза бегущей строки (WCAG 2.2.2) */
  var mq = document.querySelector('.marquee'), mqBtn = document.getElementById('marqueeToggle');
  if (mq && mqBtn) {
    mqBtn.addEventListener('click', function () {
      var paused = mq.classList.toggle('is-paused');
      mqBtn.setAttribute('aria-pressed', paused);
      mqBtn.setAttribute('aria-label', paused ? 'Запустить бегущую строку' : 'Остановить бегущую строку');
      mqBtn.querySelector('[data-icon="pause"]').classList.toggle('hidden', paused);
      mqBtn.querySelector('[data-icon="play"]').classList.toggle('hidden', !paused);
    });
  }

  /* 7. Копирование номера */
  var copyBtn = document.getElementById('copyPhone');
  if (copyBtn) {
    var label = copyBtn.querySelector('[data-label]');
    var defaultLabel = label ? label.textContent : '';
    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
    copyBtn.addEventListener('click', function () {
      var phone = '+7 702 999 29 38';
      var done = function () {
        if (!label) return;
        label.textContent = 'Скопировано';
        setTimeout(function () { label.textContent = defaultLabel; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone).then(done).catch(function () { fallbackCopy(phone); done(); });
      } else { fallbackCopy(phone); done(); }
    });
  }

  /* 8. Плашка скрывается на финальном CTA (чтобы не дублировать кнопку) */
  var bar = document.getElementById('mobileBar');
  var contact = document.getElementById('contact');
  if (bar && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.08 }).observe(contact);
  }
})();
