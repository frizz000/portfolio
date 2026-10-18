/* Trasa: language, generated contours, route rail, trail expanders, photo slots, form, game mount. */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- language ---------- */
  var META = {
    pl: { title: 'Piotr Jałocha | Eventy na żywo i oprogramowanie', desc: 'Piotr Jałocha: Sport Event Marketing Support w Red Bull, inżynier informatyki. Prowadzi eventy na żywo i buduje do nich własne narzędzia.',
          sending: 'Wysyłanie...', send: 'Wyślij wiadomość', ok: 'Wiadomość wysłana. Odezwę się najszybciej, jak mogę.', fail: 'Nie udało się wysłać. Napisz bezpośrednio na piotr.jalochaa@gmail.com.', need: 'Uzupełnij imię, poprawny email i wiadomość.' },
    en: { title: 'Piotr Jałocha | Live events and software', desc: 'Piotr Jałocha: Sport Event Marketing Support at Red Bull, computer science engineer. Runs live events and builds his own tools for them.',
          sending: 'Sending...', send: 'Send message', ok: 'Message sent. I will get back to you as soon as I can.', fail: 'Could not send. Please email piotr.jalochaa@gmail.com directly.', need: 'Please fill in your name, a valid email and a message.' }
  };
  var lang = store.get('lang');
  if (lang !== 'pl' && lang !== 'en') lang = 'pl';
  function setLang(l, silent) {
    lang = l;
    html.lang = l; html.setAttribute('data-lang', l);
    store.set('lang', l);
    doc.title = META[l].title;
    var m = $('meta[name="description"]'); if (m) m.content = META[l].desc;
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setLang === l)); });
    $$('[data-src] img').forEach(function (img) { var f = img.closest('[data-src]'); img.alt = f.dataset['alt' + (l === 'pl' ? 'Pl' : 'En')] || ''; });
    var rn = $('#rail'); if (rn) rn.setAttribute('aria-label', l === 'pl' ? 'Trasa' : 'Route');
    updateNow();
    if (!silent) doc.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l } }));
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.setLang); }); });

  /* ---------- generated contour field (seeded rings of drifting noise) ---------- */
  function rng(seed) { var s = seed * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function buildContours(svg) {
    var raw = svg.getAttribute('data-contours'), cut = raw.indexOf(',');
    var seed = parseInt(raw.slice(0, cut), 10), peaks = JSON.parse(raw.slice(cut + 1)), r = rng(seed), d = '', n = 0;
    peaks.forEach(function (pk) {
      var ph = [r() * 6.28, r() * 6.28, r() * 6.28], rings = pk[2];
      for (var i = 1; i <= rings; i++) {
        var R = i * 34 + 10, pts = [], steps = 96;
        for (var k = 0; k <= steps; k++) {
          var a = k / steps * Math.PI * 2, drift = i * 0.11;
          var rr = R * (1 + .16 * Math.sin(2 * a + ph[0] + drift) + .09 * Math.sin(3 * a + ph[1] - drift) + .05 * Math.sin(5 * a + ph[2] + drift * 2));
          pts.push((pk[0] + Math.cos(a) * rr * 1.25).toFixed(1) + ' ' + (pk[1] + Math.sin(a) * rr * .85).toFixed(1));
        }
        d += '<path pathLength="1" style="--i:' + (n++) + '" d="M' + pts.join('L') + 'Z"/>';
      }
    });
    svg.innerHTML = d;
  }
  $$('svg[data-contours]').forEach(buildContours);

  /* ---------- route rail: thin elevation profile + station markers (desktop); progress line + flag (mobile) ---------- */
  var stations = $$('main > header[data-grade], main > section[data-grade]').map(function (el) {
    return { el: el, id: el.id, grade: el.dataset.grade, top: 0, t: 0, mk: null };
  });
  var plot = $('#railPlot'), nowEl = $('#railNow'), barEl = $('#railBar');
  var NS = 'http://www.w3.org/2000/svg', desk = false, W = 0, H = 0, areaClip, svg, rider, progress = 0, active = 0, maxScroll = 1;
  var gradeClass = { start: 'g-start', black: 'g-black', red: 'g-red', blue: 'g-blue', green: 'g-green', finish: 'g-finish' };
  function elev(t) { var e = 1 - .74 * t + .07 * Math.sin(t * 23) + .05 * Math.sin(t * 51 + 1) + .05 * Math.sin(t * 9); return Math.max(.06, Math.min(1, e)); }
  function at(t) { var pad = 7; return [pad + elev(t) * (W - 2 * pad), t * H]; }
  function buildRail() {
    desk = window.matchMedia('(min-width:1024px)').matches;
    plot.innerHTML = ''; areaClip = rider = null;
    if (!desk) { measure(); labels(); paint(true); return; }
    var rect = plot.getBoundingClientRect(); W = rect.width; H = rect.height;
    svg = doc.createElementNS(NS, 'svg'); svg.setAttribute('class', 'rail-svg'); svg.setAttribute('aria-hidden', 'true');
    var line = '', i, N = 140;
    for (i = 0; i <= N; i++) { var p = at(i / N); line += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    svg.innerHTML = '<defs><clipPath id="railClip"><rect id="railClipRect" x="-20" y="-4" width="' + (W + 40) + '" height="0"/></clipPath></defs><path class="base" d="' + line + '"/><g clip-path="url(#railClip)"><path class="edge" d="' + line + '"/></g><circle class="rider" r="6"/>';
    plot.appendChild(svg);
    areaClip = $('#railClipRect', svg); rider = $('.rider', svg);
    measure();
    stations.forEach(function (s) {
      var a = doc.createElement('a'), pt = at(s.t);
      a.href = '#' + s.id; a.className = 'mk';
      a.style.left = pt[0] + 'px'; a.style.top = pt[1] + 'px';
      a.innerHTML = '<span class="shape ' + gradeClass[s.grade] + '" aria-hidden="true"></span><span class="mk-label" aria-hidden="true"></span>';
      s.mk = a; plot.appendChild(a);
    });
    labels(); paint(true);
  }
  function measure() {
    var vh = window.innerHeight, sy = window.scrollY;
    maxScroll = Math.max(1, doc.documentElement.scrollHeight - vh);
    stations.forEach(function (s) { s.top = s.el.getBoundingClientRect().top + sy; s.t = Math.min(1, Math.max(0, s.top / maxScroll)); });
  }
  function nameOf(s) { return s.el.getAttribute('data-name-' + lang) || s.id; }
  function shortOf(s) { return s.el.getAttribute('data-short-' + lang) || nameOf(s); }
  var gradeWord = { black: { pl: 'czarna', en: 'black' }, red: { pl: 'czerwona', en: 'red' }, blue: { pl: 'niebieska', en: 'blue' }, green: { pl: 'zielona', en: 'green' } };
  function fullLabel(s, i) {
    return (gradeWord[s.grade] ? 'S' + i + ' ' : '') + nameOf(s);
  }
  function labels() {
    stations.forEach(function (s, i) {
      if (!s.mk) return;
      var t = fullLabel(s, i);
      $('.mk-label', s.mk).textContent = t;
      s.mk.setAttribute('aria-label', t);
    });
  }
  function updateNow() {
    labels();
    var s = stations[active]; if (!s) return;
    if (nowEl) nowEl.textContent = desk ? shortOf(s) : nameOf(s);
  }
  var ticking = false;
  function paint(force) {
    ticking = false;
    var sy = window.scrollY; progress = Math.min(1, Math.max(0, sy / maxScroll));
    if (barEl) barEl.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    if (areaClip) {
      areaClip.setAttribute('height', (progress * H + 4).toFixed(1));
      var p = at(progress); rider.setAttribute('cx', p[0].toFixed(1)); rider.setAttribute('cy', p[1].toFixed(1));
    }
    var a = 0, line = sy + window.innerHeight * .35;
    stations.forEach(function (s, i) { if (s.top <= line) a = i; });
    if (sy >= maxScroll - 4) a = stations.length - 1;
    if (a !== active || force) {
      active = a;
      stations.forEach(function (s, i) { if (s.mk) { s.mk.classList.toggle('is-active', i === a); if (i === a) s.mk.setAttribute('aria-current', 'location'); else s.mk.removeAttribute('aria-current'); } });
    }
    updateNow();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { paint(false); }); } }

  /* ---------- the descent: one ink route running the whole page, stations hang off it ---------- */
  var descent = $('#descent'), mainEl = $('#main');
  function sv(tag, attrs) { var e = doc.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function buildDescent() {
    if (!descent) return;
    descent.innerHTML = '';
    var desk1 = window.matchMedia('(min-width:1024px)').matches;
    html.classList.toggle('lane', desk1);
    if (!desk1) { html.classList.remove('gut'); return; }
    var padx = window.innerWidth > 767 ? 48 : 20;
    var mr0 = mainEl.getBoundingClientRect();
    var cl0 = $('.st-line .wrap').getBoundingClientRect().left - mr0.left + padx;
    var gut = desk1 && cl0 >= 108;
    html.classList.toggle('gut', gut);
    var mr = mainEl.getBoundingClientRect(), sy = window.scrollY, MW = mr.width, MH = mr.height, mTop = mr.top + sy;
    var rel = function (r) { return { top: r.top + sy - mTop, bottom: r.bottom + sy - mTop, left: r.left - mr.left, right: r.right - mr.left }; };
    var awr = rel($('.st-line .wrap').getBoundingClientRect());
    var cl = awr.left + padx, cr = awr.right - padx;
    var fw = rel($('.st-field .wrap').getBoundingClientRect());
    var laneX = fw.left + padx + 30;
    var sx = laneX, sy0 = rel($('#start').getBoundingClientRect()).bottom;
    var xs = gut ? [cl - 74, cl - 74] : [9, 9];
    var laneIds = { field: 1, projects: 1 };
    var ck = rel($('.checker').getBoundingClientRect());
    var items = stations.slice(1).map(function (s, i) {
      var r = rel(s.el.getBoundingClientRect()), h = $('.st-head', s.el).getBoundingClientRect(), w = rel($$('.wrap', s.el).pop().getBoundingClientRect());
      var inLane = desk1 && laneIds[s.id], fin = s.grade === 'finish';
      var hy = fin ? (ck.top + ck.bottom) / 2 : ((gut || inLane) ? (h.top + h.height / 2 + sy - mTop) : r.top + 34);
      return { s: s, lane: inLane, fin: fin, x: inLane ? laneX : xs[(i + 1) % 2], hy: hy, end: fin ? hy : w.bottom - 6 };
    });
    var d = 'M' + sx.toFixed(1) + ' ' + sy0.toFixed(1), py = sy0, px = sx;
    items.forEach(function (it) {
      if (it.lane && Math.abs(px - it.x) > 4) {
        var wy = it.hy - 84, g0 = Math.min(130, (wy - py) / 2.2);
        d += ' C' + px.toFixed(1) + ' ' + (py + g0).toFixed(1) + ' ' + it.x.toFixed(1) + ' ' + (wy - g0).toFixed(1) + ' ' + it.x.toFixed(1) + ' ' + wy.toFixed(1) + ' L' + it.x.toFixed(1) + ' ' + it.hy.toFixed(1);
        if (it.end > it.hy) d += ' L' + it.x.toFixed(1) + ' ' + it.end.toFixed(1);
        px = it.x; py = it.end; return;
      }
      var g = Math.min(130, (it.hy - py) / 2.2);
      d += ' C' + px.toFixed(1) + ' ' + (py + g).toFixed(1) + ' ' + it.x.toFixed(1) + ' ' + (it.hy - g).toFixed(1) + ' ' + it.x.toFixed(1) + ' ' + it.hy.toFixed(1);
      if (it.end > it.hy) d += ' L' + it.x.toFixed(1) + ' ' + it.end.toFixed(1);
      px = it.x; py = it.end;
    });
    var s = sv('svg', { width: MW, height: MH, viewBox: '0 0 ' + MW + ' ' + MH });
    var weight = 1.75;
    s.appendChild(sv('path', { d: d, class: 'route', 'stroke-width': weight }));
    descent.appendChild(s);
    if (!desk1) return;
    function mark(x, y, cls, shapeCls, label) {
      var m = doc.createElement('div'); m.className = 'dmk ' + (cls || ''); m.style.left = x + 'px'; m.style.top = y + 'px';
      m.innerHTML = '<span class="shape ' + shapeCls + '">' + (label ? '<b>' + label + '</b>' : '') + '</span>';
      descent.appendChild(m);
    }
    function stub(x, y, x2, extra) { var st = sv('path', { d: 'M' + x + ' ' + y + ' H' + x2, class: 'stub' }); if (extra) st.setAttribute('style', extra); s.appendChild(st); }
    items.forEach(function (it) {
      if (!it.fin) return;
      stub(it.x, it.hy, it.x + (it.x < MW / 2 ? 1 : -1) * 44);
      mark(it.x, it.hy, 'on-orange', gradeClass[it.s.grade], '');
    });
    /* S1: the events are timing splits on the line, feeding the board */
    var board = $('.board'), brl = rel(board.getBoundingClientRect());
    $$('.board-row', board).forEach(function (row, i) {
      var r = rel(row.getBoundingClientRect()), y = (r.top + r.bottom) / 2;
      stub(laneX, y, brl.left + 2);
      mark(laneX, y, 'sp-mk', 'g-split', ('0' + (i + 1)).slice(-2));
    });
  }
  var rt;
  function rebuild() { clearTimeout(rt); rt = setTimeout(function () { buildRail(); buildDescent(); }, 120); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', rebuild);
  var lastH = 0;
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); onScroll(); var h = doc.body.scrollHeight; if (h !== lastH) { lastH = h; clearTimeout(rt); rt = setTimeout(buildDescent, 80); } }).observe(doc.body);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { measure(); labels(); paint(true); buildDescent(); });

  /* ---------- trail expanders (inline, no modal) ---------- */
  $$('.trail-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var trail = btn.closest('.trail'), open = !trail.classList.contains('open');
      trail.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      setTimeout(function () { measure(); onScroll(); buildDescent(); }, 520);
    });
  });

  /* ---------- optional photos: the <img> only enters the DOM if the file really loads ---------- */
  // Browsers log a console 404 for every missing image, so only files named in <html data-photos="dirt-jump forest-trail ..."> are probed.
  var have = (html.getAttribute('data-photos') || '').split(/\s+/);
  $$('[data-src]').forEach(function (fig) {
    if (have.indexOf(fig.dataset.src.replace(/^img\//, '').replace(/\.\w+$/, '')) < 0) return;
    var probe = new Image();
    probe.onload = function () {
      var img = doc.createElement('img'); img.src = fig.dataset.src; img.loading = fig.classList.contains('photo-hero') ? 'eager' : 'lazy'; img.decoding = 'async'; if (fig.dataset.w) { img.width = +fig.dataset.w; img.height = +fig.dataset.h; } img.alt = fig.dataset['alt' + (lang === 'pl' ? 'Pl' : 'En')] || '';
      (fig.querySelector('.photo-frame') || fig).appendChild(img);
      fig.hidden = false;
      measure(); buildDescent();
    };
    probe.src = fig.dataset.src;
  });

  /* ---------- contact form (Formspree) ---------- */
  var ENDPOINT = 'https://formspree.io/f/mqeggbao';
  var form = $('#contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = $('#formStatus'), btn = $('#formBtn');
    status.className = 'form-status';
    if (!form.checkValidity()) { status.className = 'form-status error'; status.textContent = META[lang].need; form.reportValidity(); return; }
    var label = btn.innerHTML;
    btn.disabled = true; btn.textContent = META[lang].sending;
    fetch(ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('bad'); status.className = 'form-status success'; status.textContent = META[lang].ok; form.reset(); })
      .catch(function () { status.className = 'form-status error'; status.textContent = META[lang].fail; })
      .then(function () { btn.disabled = false; btn.innerHTML = label; });
  });

  /* ---------- boot ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  function mountGame() {
    var mount = $('#the-line'), sec = $('#line');
    if (window.TheLine && mount && !mount.dataset.mounted) { mount.dataset.mounted = '1'; window.TheLine.mount(mount); if (sec) sec.classList.remove('no-game'); return true; }
    return false;
  }
  function boot() {
    setLang(lang, true);
    buildRail(); buildDescent();
    if (!mountGame()) { var sec = $('#line'); if (sec) sec.classList.add('no-game'); window.addEventListener('load', mountGame); }
    doc.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
