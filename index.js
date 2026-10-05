(function () {
  'use strict';
  var VARIANTS = ['v1', 'v2', 'v3'];
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var frame = document.getElementById('view');
  var openNew = document.getElementById('openNew');

  // Hash is the source of truth so each variant has a shareable link (#v2); localStorage only remembers the last pick.
  function initial() {
    var h = location.hash.slice(1);
    if (VARIANTS.indexOf(h) > -1) return h;
    try { var s = localStorage.getItem('azamat-variant'); if (VARIANTS.indexOf(s) > -1) return s; } catch (e) {}
    return 'v1';
  }

  function show(v, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.v === v;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    var url = v + '.html';
    if (frame.getAttribute('src') !== url) frame.setAttribute('src', url);
    frame.setAttribute('aria-labelledby', 'tab-' + v);
    openNew.href = url;
    if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    try { localStorage.setItem('azamat-variant', v); } catch (e) {}
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.dataset.v); });
    // WAI-ARIA tabs pattern: arrows move between tabs
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      show(VARIANTS[(i + d + VARIANTS.length) % VARIANTS.length], true);
    });
  });

  window.addEventListener('hashchange', function () {
    var h = location.hash.slice(1);
    if (VARIANTS.indexOf(h) > -1) show(h);
  });

  show(initial());
})();
