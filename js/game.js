/* The Line - one-button downhill mini-game (MTB <-> SKI). Vanilla canvas, no deps.
   API: window.TheLine.mount(el) */
(function () {
  'use strict';
  if (window.TheLine) return;

  var INK = '#0E1317', SNOW = '#F1F5F7', ORANGE = '#93A424', WHITE = '#FBFCFD';
  var FD = "'Big Shoulders Display','Arial Narrow',Impact,sans-serif";
  var FM = "'JetBrains Mono',ui-monospace,Menlo,monospace";
  var STEP = 8, DT = 1 / 120, VIEW_H = 330;
  var GCOL = ['#1FA35B', '#1D6FE8', '#E5322D', INK];
  function gradeOf(m) { return m < 250 ? 0 : m < 600 ? 1 : m < 1000 ? 2 : 3; }
  var T_ROCK = 0, T_ROOT = 1, T_TREE = 2, T_FLAG = 3, T_BOULDER = 4;

  var CPS = [
    { pl: 'AKREDYTACJE', en: 'ACCRED' }, { pl: 'HARMONOGRAM', en: 'RUN-OF-SHOW' },
    { pl: 'CATERING', en: 'CATERING' }, { pl: 'ŁĄCZNOŚĆ', en: 'CREW COMMS' }, { pl: 'NA ŻYWO', en: 'LIVE' }
  ];
  var S = {
    pl: {
      title: 'THE LINE', sub: 'Zjedź w dół i zbierz pełny zestaw checkpointów eventowych. Skacz nad skałami, korzeniami, drzewami i uskokami.',
      play: 'Graj', resume: 'Wznów', pause: 'Pauza', paused: 'Pauza', mode: 'Tryb jazdy', mtb: 'MTB', ski: 'Narty',
      best: 'Rekord', hint: 'Spacja, klik lub dotyk: skok. Przytrzymaj, by skoczyć wyżej. P lub Esc: pauza.',
      calm: 'Tryb spokojny: wolniejsze tempo, bez wstrząsów.', crash: 'Wypadek', again: 'Kliknij lub naciśnij Spację, by jechać dalej.',
      nb: 'Nowy rekord!', set: 'Checkpointy', go: 'WSZYSTKIE SYSTEMY GO',
      smooth: 'GŁADKO', root: 'KORZEŃ', carve: 'CARVE', cliff: 'USKOK', gap: 'PRZERWA',
      alt: 'Opis tekstowy: jednoprzyciskowa gra zręcznościowa. Rower zjazdowy lub narty freeride zjeżdżają w dół stoku. Skacz nad przeszkodami i zbieraj pięć checkpointów eventowych: akredytacje, harmonogram, catering, łączność i na żywo. Gra jest opcjonalna, nic na stronie nie zależy od wyniku.',
      lbl: 'The Line: gra zjazdowa. Rider na rowerze lub nartach zjeżdża po stoku; skacz Spacją lub dotykiem.',
      live0: 'Start', live1: 'Wypadek. Wynik: ',
      focus: 'Kliknij grę lub zaznacz ją klawiszem Tab, by grać.', fh: 'Kliknij, by grać', grade: 'Trasa', g0: 'ZIELONA', g1: 'NIEBIESKA', g2: 'CZERWONA', g3: 'CZARNA'
    },
    en: {
      title: 'THE LINE', sub: 'Ride downhill and collect the full set of event checkpoints. Jump rocks, roots, trees and drops.',
      play: 'Play', resume: 'Resume', pause: 'Pause', paused: 'Paused', mode: 'Rider mode', mtb: 'MTB', ski: 'SKI',
      best: 'Best', hint: 'Space, click or tap: jump. Hold to jump higher. P or Esc: pause.',
      calm: 'Calm mode: slower pace, no screen shake.', crash: 'Wipeout', again: 'Click or press Space to ride again.',
      nb: 'New best!', set: 'Checkpoints', go: 'ALL SYSTEMS GO',
      smooth: 'SMOOTH', root: 'ROOT', carve: 'CARVE', cliff: 'CLIFF DROP', gap: 'GAP',
      alt: 'Text description: a one-button arcade game. A downhill mountain bike or a freeride skier descends a slope. Jump obstacles and collect five event checkpoints: accreditation, run-of-show, catering, crew comms and live. The game is optional; nothing on this page depends on your score.',
      lbl: 'The Line: downhill game. A rider on a bike or skis descends a slope; jump with Space or tap.',
      live0: 'Started', live1: 'Wipeout. Score: ',
      focus: 'Click the game or focus it with Tab to play.', fh: 'Click to focus', grade: 'Trail', g0: 'GREEN', g1: 'BLUE', g2: 'RED', g3: 'BLACK'
    }
  };

  function lang() { return String(document.documentElement.lang || 'pl').toLowerCase().indexOf('en') === 0 ? 'en' : 'pl'; }
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, String(v)); } catch (e) { /* ignore */ } }
  function sm(t) { return t * t * (3 - 2 * t); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function el(tag, cls, parent, txt) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (txt != null) e.textContent = txt; if (parent) parent.appendChild(e); return e;
  }

  function Game(root) {
    var rmq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var reduce = rmq.matches;
    if (rmq.addEventListener) rmq.addEventListener('change', function () { reduce = rmq.matches; setLang(); });

    /* ---------- DOM ---------- */
    root.classList.add('tl'); root.textContent = '';
    var bar = el('div', 'tl-bar', root);
    var modeGrp = el('div', 'tl-modes', bar); modeGrp.setAttribute('role', 'group');
    var bMtb = el('button', 'tl-mode', modeGrp); bMtb.type = 'button';
    var bSki = el('button', 'tl-mode', modeGrp); bSki.type = 'button';
    var bPause = el('button', 'tl-btn tl-pausebtn', bar); bPause.type = 'button';
    var stage = el('div', 'tl-stage', root); stage.tabIndex = 0; stage.setAttribute('role', 'group');
    var canvas = el('canvas', 'tl-canvas', stage); canvas.setAttribute('role', 'img');
    var hud = el('div', 'tl-hud', stage); hud.setAttribute('aria-hidden', 'true');
    var hDist = el('div', 'tl-dist', hud); var hDistN = el('span', 'tl-distn', hDist, '0'); el('span', 'tl-distu', hDist, ' m');
    var hMeta = el('div', 'tl-meta', hud);
    var hGrade = el('span', 'tl-grade', hMeta); var hGDot = el('i', 'tl-gdot', hGrade); var hGTxt = el('span', '', hGrade);
    var hSpeed = el('span', '', hMeta, '— km/h'); var hBest = el('span', '', hMeta, '');
    var hSign = el('div', 'tl-grade tl-sign', stage); hSign.setAttribute('aria-hidden', 'true'); hSign.hidden = true;
    var hSDot = el('i', 'tl-gdot', hSign); var hSTxt = el('span', '', hSign);
    var fHint = el('div', 'tl-focushint', stage, ''); fHint.setAttribute('aria-hidden', 'true');
    var card = el('div', 'tl-card', stage);
    var cTitle = el('h3', 'tl-ctitle', card); var cText = el('p', 'tl-ctext', card);
    var cBtn = el('button', 'tl-btn tl-go', card); cBtn.type = 'button';
    var cHint = el('p', 'tl-chint', card);
    var live = el('div', 'tl-sr', root); live.setAttribute('aria-live', 'polite');
    var chipsBox = el('ul', 'tl-chips', root); var chips = [];
    for (var ci = 0; ci < 5; ci++) chips.push(el('li', 'tl-chip', chipsBox));
    var altP = el('p', 'tl-alt', root);
    var ctx = canvas.getContext('2d');

    /* ---------- state ---------- */
    var W = 0, H = 0, dpr = 1, sc = 1, vw = 400;
    var mode = lsGet('theline.mode') === 'ski' ? 'ski' : 'mtb';
    var state = 'idle', visible = false, hovered = false, raf = 0, last = 0, acc = 0;
    var held = false, jumpReq = false, ptrId = null;
    var best = { mtb: +lsGet('theline.best.mtb') || 0, ski: +lsGet('theline.best.ski') || 0 };
    var V0, VMAX, rnd = Math.random;

    // terrain
    var hs = [], gp = [], idx0 = 0, tgi = 0, drop = 0, cliff = null, gapA = null, nextFeat = 0, lastPlan = 0, cpCool = 0, p1 = 0, p2 = 0;
    var gaps = [], obs = [], cps = [];
    var i;
    for (i = 0; i < 8; i++) gaps.push({ on: false, x0: 0, x1: 0, y0: 0, y1: 0 });
    for (i = 0; i < 56; i++) obs.push({ on: false, t: 0, x: 0, w: 0, h: 0, y: null, hit: false, seed: 0 });
    for (i = 0; i < 8; i++) cps.push({ on: false, k: 0, x: 0, h: 0, gy: null, gyFix: 0, age: 0, col: -1 });
    // rider
    var x = 0, y = 0, px = 0, py = 0, vx = 0, vy = 0, grounded = true, rot = 0, sq = 0, sqv = 0, slopeP = 0.3, wr = 0;
    var holdT = 0, coyote = 0, airPress = 0, buf = 0, airT = 0, apexY = 0, overGap = false, crashT = 0, settled = false, spin = 0, trailT = 0;
    var cx = 0, cy = 0, pcx = 0, pcy = 0, shake = 0, T = 0, bonus = 0, mask = 0, flourish = 0, maskClear = 0, newBest = false, lastCrashScore = 0;
    var lastDist = -1, lastSpd = -2, lastGr = -1;
    var MS = [500, 1000], msI = 0, signT = 0, signB = 0, PAR = 0.1;
    // pools
    var NP = 220, P = new Float32Array(NP * 8), pi = 0; // x y vx vy life max size kind
    var pops = []; for (i = 0; i < 8; i++) pops.push({ on: false, s: '', x: 0, y: 0, life: 0, c: INK });
    var lines = []; for (i = 0; i < 12; i++) lines.push({ x: rnd(), y: rnd(), l: 20 + rnd() * 40, s: 0.7 + rnd() });

    /* ---------- strings / labels ---------- */
    function tr(k) { return S[lang()][k]; }
    function setLang() {
      var L = lang();
      card.setAttribute('lang', L);
      bMtb.textContent = tr('mtb'); bSki.textContent = tr('ski');
      modeGrp.setAttribute('aria-label', tr('mode'));
      bPause.textContent = tr('pause'); altP.textContent = tr('alt'); fHint.textContent = tr('fh');
      canvas.setAttribute('aria-label', tr('lbl')); stage.setAttribute('aria-label', tr('lbl'));
      for (var k = 0; k < 5; k++) chips[k].textContent = CPS[k][L];
      chipsBox.setAttribute('aria-label', tr('set'));
      updateModeUI(); updateCard(); lastDist = -1; lastSpd = -2; lastGr = -1; hudUpdate();
      if (!raf) render(1);
    }
    function updateModeUI() {
      bMtb.setAttribute('aria-pressed', mode === 'mtb'); bSki.setAttribute('aria-pressed', mode === 'ski');
      bMtb.classList.toggle('is-on', mode === 'mtb'); bSki.classList.toggle('is-on', mode === 'ski');
      hBest.textContent = tr('best') + ' ' + best[mode] + ' m';
    }
    function updateCard() {
      var show = state !== 'run';
      card.hidden = !show; card.className = 'tl-card' + (state === 'crashed' ? ' tl-card--toast' : state === 'idle' ? ' tl-card--idle' : '');
      bPause.disabled = state !== 'run'; bPause.hidden = false;
      if (state === 'idle') { cTitle.textContent = tr('title'); cText.textContent = tr('sub') + (reduce ? ' ' + tr('calm') : ''); cBtn.textContent = tr('play'); cBtn.hidden = false; cHint.textContent = tr('hint'); }
      else if (state === 'paused') { cTitle.textContent = tr('paused'); cText.textContent = ''; cBtn.textContent = tr('resume'); cBtn.hidden = false; cHint.textContent = tr('hint'); }
      else if (state === 'crashed') {
        cTitle.textContent = tr('crash') + ' · ' + lastCrashScore + ' m';
        cText.textContent = (newBest ? tr('nb') + ' ' : '') + tr('again'); cBtn.hidden = true; cHint.textContent = '';
      }
      focusUpdate();
    }
    function focused() { return stage.contains(document.activeElement); }
    function focusUpdate() { fHint.hidden = true; }
    function hideSign() { hSign.hidden = true; signT = 0; }
    function showSign(m) {
      var g = gradeOf(m); hSDot.style.background = GCOL[g]; hSTxt.textContent = m + ' M \u00B7 ' + tr('g' + g);
      hSign.hidden = false; hSign.classList.remove('is-in'); void hSign.offsetWidth; hSign.classList.add('is-in');
      signT = 2.8; signB = hSign.offsetTop + hSign.offsetHeight; say(m + ' m, ' + tr('grade') + ' ' + tr('g' + g));
    }
    function hudUpdate() {
      var d = Math.max(0, Math.floor(x / 10 + bonus)); if (d !== lastDist) { lastDist = d; hDistN.textContent = d; }
      var s = state === 'idle' ? -1 : Math.round(vx * 0.26); if (s !== lastSpd) { lastSpd = s; hSpeed.textContent = (s < 0 ? '—' : s) + ' km/h'; }
      var gr = gradeOf(Math.max(0, Math.floor(x / 10))); if (gr !== lastGr) { lastGr = gr; hGTxt.textContent = tr('g' + gr); hGDot.style.background = GCOL[gr]; hGrade.setAttribute('data-g', gr); }
    }
    function chipsUpdate() { for (var k = 0; k < 5; k++) chips[k].classList.toggle('is-on', !!(mask & (1 << k))); }
    function say(s) { live.textContent = ''; setTimeout(function () { live.textContent = s; }, 30); }

    /* ---------- terrain ---------- */
    function baseY(wx) { var a = clamp(wx / 500, 0, 1); return wx * 0.30 + a * (14 * Math.sin(wx / 110 + p1) + 6 * Math.sin(wx / 45 + p2)); }
    function gy(wx) {
      for (var g = 0; g < 8; g++) { var G = gaps[g]; if (G.on && wx > G.x0 && wx < G.x1) return null; }
      var f = wx / STEP, fl = Math.floor(f), j = fl - idx0;
      if (j < 0) return hs[0]; if (j + 1 >= hs.length) return hs[hs.length - 1];
      return hs[j] + (hs[j + 1] - hs[j]) * (f - fl);
    }
    function sl(wx) { var j = Math.floor(wx / STEP) - idx0; if (j < 0 || j + 1 >= hs.length) return 0.3; return (hs[j + 1] - hs[j]) / STEP; }
    function gapAt(wx) { for (var g = 0; g < 8; g++) { var G = gaps[g]; if (G.on && wx > G.x0 - 4 && wx < G.x1 + 4) return G; } return null; }
    function free(arr) { for (var q = 0; q < arr.length; q++) if (!arr[q].on) return arr[q]; return null; }
    function addObs(t, ox, w, h) {
      var o = free(obs); if (!o) return null;
      o.on = true; o.t = t; o.x = ox; o.w = w; o.h = h; o.y = null; o.hit = false; o.seed = rnd(); return o;
    }
    function addCp(ox, h, gyFix) {
      var c = free(cps); if (!c) return;
      var avail = [];
      for (var k = 0; k < 5; k++) {
        if (mask & (1 << k)) continue; var used = false;
        for (var q = 0; q < 8; q++) if (cps[q].on && cps[q].k === k && cps[q].col < 0) used = true;
        if (!used) avail.push(k);
      }
      if (!avail.length) return;
      c.on = true; c.k = avail[Math.floor(rnd() * avail.length)]; c.x = ox; c.h = h; c.gy = null; c.gyFix = gyFix == null ? 0 : gyFix; c.hasFix = gyFix != null; c.age = 0; c.col = -1;
    }
    function plan(wx) {
      var d = wx / 10, vEst = Math.min(VMAX, V0 + d * 0.07) * 1.05, dens = Math.min(1, d / 2200);
      var sp = vEst * (1.5 - 0.78 * dens) * (0.85 + rnd() * 0.5) * (mode === 'ski' ? 1 - 0.1 * clamp((d - 500) / 1000, 0, 1) : 1), r = rnd(), kind;
      cpCool -= wx - lastPlan; lastPlan = wx;
      if (mode === 'mtb') {
        if (d < 110) kind = r < 0.5 ? 'rock' : r < 0.78 ? 'root' : 'tree';
        else kind = r < 0.26 ? 'rock' : r < 0.44 ? 'root' : r < 0.62 ? 'tree' : r < 0.8 ? 'gap' : 'boulder';
      } else {
        if (d < 80) kind = r < 0.55 ? 'rock' : 'tree';
        else if (d < 1000) kind = r < 0.3 ? 'rock' : r < 0.56 ? 'tree' : r < 0.8 ? 'boulder' : 'cliff';
        else kind = r < 0.26 ? 'rock' : r < 0.52 ? 'tree' : r < 0.9 ? 'boulder' : 'cliff';
      }
      if (kind === 'boulder' && d < 500) kind = 'rock';
      var ox = wx + STEP * 2, len = 40, lastY = hs.length ? hs[hs.length - 1] : 0, cpX = null, cpH = 0, fix;
      if (kind === 'gap') {
        var gw = (reduce ? clamp(vEst * 0.34, 50, 125) : clamp(vEst * 0.4, 66, 125)) * (0.92 + rnd() * 0.12), n = Math.ceil(gw / STEP), G = free(gaps);
        if (G) {
          var dep = 18 + rnd() * 16; gapA = { x0: wx - STEP, x1: wx - STEP + (n + 1) * STEP, depth: dep };
          G.on = true; G.x0 = gapA.x0; G.x1 = gapA.x1; G.y0 = lastY; G.y1 = baseY(G.x1) + drop + dep;
          addObs(T_FLAG, G.x0 - 2, 0, 18); addObs(T_FLAG, G.x1 + 2, 0, 18);
          len = (n + 1) * STEP + 30; cpX = (G.x0 + G.x1) / 2; cpH = 58; fix = lastY + 6;
        }
      } else if (kind === 'cliff') {
        var cd = 55 + rnd() * 40; cliff = { x0: wx + STEP, len: 30, depth: cd };
        addObs(T_FLAG, wx - 18, 0, 18); len = 60 + vEst * 0.5; cpX = wx + 50; cpH = 56; fix = lastY + cd * 0.5;
      } else {
        var o;
        if (kind === 'rock') o = addObs(T_ROCK, ox, 22 + rnd() * 6, 16 + rnd() * 4);
        else if (kind === 'boulder') o = addObs(T_BOULDER, ox, 34 + rnd() * 6, 26 + rnd() * 4);
        else if (kind === 'root') o = addObs(T_ROOT, ox, 34, 6);
        else o = addObs(T_TREE, ox, 20, 40 + rnd() * 8);
        len = 40;
        if (reduce) { /* tap-only players: never chain obstacles */ }
        else if (mode === 'ski' && d > 1000 && kind === 'boulder' && rnd() < 0.42) { addObs(T_ROCK, ox + 62, 22, 17); len = 100; }
        else if (d > 300 && rnd() < 0.14 + 0.36 * dens && (kind === 'rock' || kind === 'root')) { addObs(kind === 'rock' ? T_ROCK : T_ROOT, ox + 56, kind === 'rock' ? 22 : 34, kind === 'rock' ? 17 : 6); len = 100; }
        cpX = ox + (len > 40 ? 28 : o ? o.w / 2 + 16 : 0); cpH = kind === 'root' ? 54 : kind === 'tree' ? 64 : 58;
      }
      if (cpCool <= 0 && cpX != null) { addCp(cpX, cpH + rnd() * 6, fix); cpCool = 480 + rnd() * 380; }
      else if (cpCool < -260) { addCp(wx + len + 110, 20 + rnd() * 5, null); cpCool = 520 + rnd() * 300; len += 160; }
      nextFeat = wx + len + sp;
    }
    function genOne() {
      var wx = tgi * STEP;
      if (wx >= nextFeat) plan(wx);
      var yy = baseY(wx) + drop, g = 0;
      if (cliff) {
        if (wx >= cliff.x0 + cliff.len) { drop += cliff.depth; cliff = null; yy = baseY(wx) + drop; }
        else if (wx > cliff.x0) yy += cliff.depth * sm((wx - cliff.x0) / cliff.len);
      }
      if (gapA) {
        if (wx >= gapA.x1) { drop += gapA.depth; gapA = null; yy = baseY(wx) + drop; }
        else { g = 1; yy = baseY(wx) + drop + gapA.depth; }
      }
      hs.push(yy); gp.push(g); tgi++;
    }
    function ensure(maxX) { while (tgi * STEP < maxX) genOne(); }
    function trim() {
      if ((cx / STEP - idx0) > 520) { hs.splice(0, 200); gp.splice(0, 200); idx0 += 200; }
      for (var q = 0; q < 8; q++) if (gaps[q].on && gaps[q].x1 < cx - 200) gaps[q].on = false;
    }

    /* ---------- reset ---------- */
    function setTuning() { V0 = reduce ? 150 : 195; VMAX = reduce ? 270 : 380; }
    function reset() {
      setTuning(); p1 = rnd() * 6; p2 = rnd() * 6;
      hs = []; gp = []; idx0 = -80; tgi = -80; drop = 0; cliff = null; gapA = null; nextFeat = 560; lastPlan = 0; cpCool = 300;
      for (i = 0; i < 8; i++) gaps[i].on = false;
      for (i = 0; i < obs.length; i++) obs[i].on = false;
      for (i = 0; i < cps.length; i++) cps[i].on = false;
      for (i = 0; i < NP; i++) P[i * 8 + 4] = 0;
      for (i = 0; i < pops.length; i++) pops[i].on = false;
      x = 0; vx = V0 * 0.9; vy = 0; grounded = true; rot = 0; sq = 0; sqv = 0; holdT = 0; coyote = 0; airPress = 0; buf = 0; airT = 0; overGap = false;
      crashT = 0; settled = false; spin = 0; shake = 0; T = 0; bonus = 0; mask = 0; flourish = 0; maskClear = 0; newBest = false; held = held && state === 'run';
      jumpReq = false; acc = 0; last = 0; msI = 0; hideSign();
      cx = -vw * 0.28; ensure(vw + 700); y = gy(0); slopeP = sl(0); px = x; py = y; wr = 0;
      cx = x - vw * 0.28; cy = y - VIEW_H * 0.64; pcx = cx; pcy = cy; chipsUpdate(); lastDist = -1; lastSpd = -2; lastGr = -1; hudUpdate();
    }

    /* ---------- fx ---------- */
    function emit(ex, ey, evx, evy, life, size, kind) {
      var b = (pi++ % NP) * 8; P[b] = ex; P[b + 1] = ey; P[b + 2] = evx; P[b + 3] = evy; P[b + 4] = life; P[b + 5] = life; P[b + 6] = size; P[b + 7] = kind;
    }
    function burst(ex, ey, n, spd, kind, up) {
      if (reduce) n = Math.ceil(n * 0.5);
      for (var q = 0; q < n; q++) { var a = rnd() * 6.283, s = spd * (0.3 + rnd() * 0.7); emit(ex, ey, Math.cos(a) * s - vx * 0.15, Math.sin(a) * s - (up || 0), 0.4 + rnd() * 0.4, 1.4 + rnd() * 2, kind); }
    }
    function popup(s, wx, wy, c) {
      var p = free(pops); if (!p) p = pops[0];
      p.on = true; p.s = s; p.x = wx; p.y = wy; p.life = 1.1; p.c = c || INK;
    }
    function doShake(a) { if (!reduce) shake = Math.max(shake, a); }

    /* ---------- input actions ---------- */
    function press() {
      if (state !== 'run') return;
      held = true; jumpReq = true;
    }
    function release() { held = false; }
    function start() {
      if (state === 'run') return;
      var wasIdleOrCrash = state === 'idle' || state === 'crashed';
      if (wasIdleOrCrash) { state = 'run'; reset(); say(tr('live0')); }
      else state = 'run';
      updateCard(); try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); }
      last = 0; acc = 0; schedule();
    }
    function pause(auto) {
      if (state !== 'run') return;
      state = 'paused'; held = false; updateCard(); if (raf) { cancelAnimationFrame(raf); raf = 0; } render(1);
      if (!auto) { try { cBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    function setMode(m) {
      if (m === mode) return;
      mode = m; lsSet('theline.mode', m); held = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      state = 'idle'; reset(); updateModeUI(); updateCard(); render(1);
    }
    function crash(why) {
      if (state !== 'run') return;
      state = 'crashed'; crashT = 0; settled = false; held = false; flourish = 0;
      var score = Math.max(0, Math.floor(x / 10 + bonus)); lastCrashScore = score;
      newBest = score > best[mode] && score > 20;
      if (score > best[mode]) { best[mode] = score; lsSet('theline.best.' + mode, score); }
      hideSign(); updateModeUI(); updateCard(); say(tr('live1') + score + ' m');
      vy = -240 - rnd() * 80; vx *= 0.6; grounded = false; spin = (rnd() < 0.5 ? -1 : 1) * (6 + rnd() * 4);
      if (why === 'fall') { vy = 0; vx *= 0.5; }
      burst(x, y - 14, 22, 160, 0, 40); burst(x, y - 14, 8, 120, 1, 30); doShake(10);
    }

    /* ---------- simulation ---------- */
    function cpBoardW(c) { ctx.font = '800 11px ' + FD; return ctx.measureText(CPS[c.k][lang()]).width + 14; }
    function step(dt) {
      px = x; py = y; pcx = cx; pcy = cy; T += dt;
      var j;
      if (state === 'run') {
        var m = x / 10, vt = Math.min(VMAX, V0 + m * (mode === 'ski' ? 0.075 : 0.07));
        vx += (vt - vx) * Math.min(1, dt * 1.1);
        x += vx * dt; wr += vx * dt / 8.2;
        ensure(x + vw + 700);
        // input
        if (jumpReq) {
          jumpReq = false;
          if (grounded || coyote > 0) {
            var J = mode === 'ski' ? 365 : 405; vy = -J; grounded = false; coyote = 0; holdT = 0; airT = 0; apexY = y; overGap = false;
            sqv -= 3; burst(x, y, 5, 70, 0, 20);
          } else { airPress = 0.14; if (mode === 'ski') buf = 0.1; }
        }
        if (grounded) {
          coyote = 0.08;
          var g = gy(x);
          if (g == null) { grounded = false; vy = slopeP * vx; airT = 0; apexY = y; holdT = 9; }
          else {
            var s = sl(x);
            if (s - slopeP > 0.42) { grounded = false; vy = slopeP * vx; airT = 0; apexY = y; holdT = 9; y = g; }
            else { y = g; slopeP = s; }
          }
          if (grounded) {
            trailT -= dt;
            if (trailT <= 0) {
              trailT = reduce ? 0.07 : 0.035; var big = mode === 'ski' ? 1.4 : 1;
              emit(x - 8, y - 1, -vx * 0.25 - rnd() * 30, -20 - rnd() * 55 * big, 0.35 + rnd() * 0.3, 1.2 + rnd() * 1.8 * big, 0);
              if (mode === 'ski' && !reduce) emit(x - 10, y - 1, -vx * 0.2, -10 - rnd() * 30, 0.5, 2.2, 0);
            }
          }
        } else {
          coyote -= dt; airT += dt; if (airPress > 0) airPress -= dt;
          var G0 = mode === 'ski' ? 1350 : 1700;
          vy += ((held && holdT < 0.34 && vy < 0) ? G0 * 0.5 : G0) * dt; holdT += dt; y += vy * dt;
          if (y < apexY) apexY = y;
          var gg = gy(x);
          if (gg == null) {
            overGap = true; var gap = gapAt(x);
            if (gap && y > gap.y0 + 70) crash('fall');
          } else if (y >= gg && vy >= -60) {
            if (y - gg > 24) { y = gg; crash('wall'); }
            else land(gg);
          }
        }
        wr += 0;
        // collisions
        for (j = 0; j < obs.length; j++) {
          var o = obs[j]; if (!o.on) continue;
          if (o.x < cx - 260) { o.on = false; continue; }
          if (o.t === T_FLAG) continue;
          if (Math.abs(o.x - x) > 50 || o.hit) continue;
          if (o.y == null) { o.y = gy(o.x); if (o.y == null) continue; }
          var hw, top;
          if (o.t === T_ROOT) { hw = 13; top = o.y - 6; }
          else if (o.t === T_TREE) { hw = 5.5; top = o.y - Math.min(o.h - 8, 36); }
          else { hw = o.w * 0.4; top = o.y - o.h * 0.85; }
          if (x + 8 > o.x - hw && x - 8 < o.x + hw && y - 3 > top && y - 28 < o.y) {
            if (o.t === T_ROOT) {
              o.hit = true; vx *= 0.8; sqv += 3; popup(tr('root'), x, y - 30, INK); burst(x, y, 6, 90, 0, 40);
              if (grounded) { grounded = false; vy = -150; airT = 0; apexY = y; holdT = 9; } doShake(3);
            } else { crash('hit'); break; }
          }
        }
        // checkpoints
        for (j = 0; j < cps.length; j++) {
          var c = cps[j]; if (!c.on) continue;
          if (c.col >= 0) { c.col += dt * 1.8; if (c.col >= 1) c.on = false; continue; }
          if (c.x < cx - 200) { c.on = false; continue; }
          if (c.x - x < vw) c.age += dt;
          if (Math.abs(c.x - x) > 70) continue;
          if (c.gy == null) { c.gy = gy(c.x); if (c.gy == null) c.gy = c.hasFix ? c.gyFix : null; if (c.gy == null) continue; }
          var bw = cpBoardW(c), by = c.gy - c.h;
          if (x + 9 > c.x - bw / 2 && x - 9 < c.x + bw / 2 && y - 3 > by - 17 && y - 28 < by - 1) collect(c, by);
        }
        // timers
        if (buf > 0) buf -= dt;
        if (flourish > 0) { flourish -= dt; }
        if (maskClear > 0) { maskClear -= dt; if (maskClear <= 0) { mask = 0; chipsUpdate(); } }
        trim(); hudUpdate();
        if (msI < MS.length && x / 10 >= MS[msI]) showSign(MS[msI++]);
        if (signT > 0) { signT -= dt; if (signT <= 0) hideSign(); }
      } else if (state === 'crashed') {
        crashT += dt;
        x += vx * dt; vx *= Math.exp(-0.9 * dt);
        vy += 1700 * dt; y += vy * dt; rot += spin * dt;
        ensure(x + vw + 700);
        var g2 = gy(x);
        if (g2 != null && y >= g2) {
          y = g2; if (vy > 120) { vy *= -0.32; spin *= 0.6; burst(x, y, 4, 60, 0, 20); } else { vy = 0; vx *= Math.exp(-6 * dt); spin *= Math.exp(-6 * dt); }
        }
        if (g2 == null) { var gp2 = gapAt(x); if (gp2 && y > gp2.y0 + 150) { vy = 0; vx = 0; spin = 0; } }
        if (crashT > 0.7 && Math.abs(vx) < 8 && Math.abs(vy) < 20 || crashT > 2.6) settled = true;
      }
      // camera
      var tcx = x - vw * 0.28 + (state === 'run' ? vx * 0.06 : 0), tcy = y - VIEW_H * 0.64;
      cx += (tcx - cx) * Math.min(1, dt * 8);
      var ce = tcy - cy, crate = (grounded ? 6 : 3.5) + clamp(Math.abs(ce) - 28, 0, 120) * 0.07;
      cy += ce * Math.min(1, dt * crate);
      cy = clamp(cy, y - VIEW_H * 0.82, y - VIEW_H * 0.2);
      // rider pose
      var tr_ = grounded ? Math.atan(slopeP) : Math.atan2(vy, Math.max(vx, 1)) * 0.55;
      if (state === 'run') rot += (tr_ - rot) * Math.min(1, dt * (grounded ? 16 : 6));
      sqv += (-sq * 380 - sqv * 16) * dt; sq += sqv * dt;
      shake *= Math.exp(-7 * dt);
      // particles / pops
      for (j = 0; j < NP; j++) {
        var b = j * 8; if (P[b + 4] <= 0) continue;
        P[b + 4] -= dt; P[b] += P[b + 2] * dt; P[b + 1] += P[b + 3] * dt; P[b + 3] += 380 * dt; P[b + 2] *= (1 - 1.2 * dt);
      }
      for (j = 0; j < pops.length; j++) if (pops[j].on) { pops[j].life -= dt; pops[j].y -= 26 * dt; if (pops[j].life <= 0) pops[j].on = false; }
    }
    function land(g) {
      var impact = vy, air = airT, fall = y - apexY;
      y = g; vy = 0; grounded = true; slopeP = sl(x);
      sqv += clamp(impact / 900, 0, 1.2) * 5;
      if (air < 0.18) { burst(x, y, 3, 50, 0, 10); return; }
      burst(x, y - 1, 8 + Math.min(14, impact / 60 | 0), 120, 0, 40);
      var txt = '', add = 0;
      if (mode === 'mtb') {
        if (airPress > 0) { add += 8; vx = Math.min(VMAX * 1.12, vx * 1.05); txt = tr('smooth'); airPress = 0; }
        else if (impact > 560) { vx *= 0.9; doShake(5); }
      } else if (held) { add += 3; txt = tr('carve'); burst(x, y - 1, 12, 150, 0, 30); }
      if (overGap) { add += 10; txt = tr('gap'); }
      else if (fall > 55 && mode === 'ski') { add += 15; txt = tr('cliff'); doShake(3); }
      overGap = false;
      if (add) { bonus += add; popup('+' + add + ' m ' + txt, x, y - 40, ORANGE); }
      if (buf > 0 && mode === 'ski') { jumpReq = true; }
    }
    function collect(c, by) {
      c.col = 0; mask |= 1 << c.k; bonus += 6; chipsUpdate();
      burst(c.x, by - 8, 16, 150, 1, 20); popup('+' + CPS[c.k][lang()], c.x, by - 24, ORANGE);
      if (mask === 31) {
        flourish = 1.9; maskClear = 1.3; bonus += 50; vx = Math.min(VMAX * 1.1, vx * 1.04);
        burst(x, y - 30, 30, 220, 1, 60); doShake(4); say(tr('go'));
      }
    }

    /* ---------- render ---------- */
    function ridge(wx, ph, wl, wl2) { return 1 - Math.abs(Math.sin(wx / wl + ph)) * 0.8 + 0.25 * Math.sin(wx / wl2 + ph * 2); }
    function render(a) {
      if (!W) return;
      var rx = px + (x - px) * a, ry = py + (y - py) * a, ccx = pcx + (cx - pcx) * a, ccy = pcy + (cy - pcy) * a;
      var shx = shake ? (Math.random() - 0.5) * shake : 0, shy = shake ? (Math.random() - 0.5) * shake : 0, k = dpr;
      var c = ctx, q, w;
      c.setTransform(k, 0, 0, k, 0, 0);
      c.fillStyle = SNOW; c.fillRect(0, 0, W, H);
      // sun
      c.fillStyle = ORANGE; c.beginPath(); c.arc(W * 0.62, H * 0.24, Math.max(14, H * 0.065), 0, 6.283); c.fill();
      // mountains (parallax)
      var dev = ccy - ccx * 0.3, L = [[0.07, 0.62, 0.04, 90, 520, 130], [0.15, 0.7, 0.055, 70, 340, 90], [0.28, 0.78, 0.08, 55, 230, 60]];
      for (q = 0; q < 3; q++) {
        var ly = L[q]; c.fillStyle = 'rgba(14,19,23,' + ly[2] + ')'; c.beginPath(); c.moveTo(0, H);
        for (var sx = 0; sx <= W + 12; sx += 12) {
          var wx = sx / sc + ccx * ly[0];
          c.lineTo(sx, H * ly[1] * 0.78 + (-ly[3] * ridge(wx, q * 1.7, ly[4], ly[5]) + dev * ly[0]) * sc * 0.9 + H * 0.12);
        }
        c.lineTo(W + 12, H); c.closePath(); c.fill();
      }
      // world
      c.setTransform(k * sc, 0, 0, k * sc, (-ccx * sc + shx) * k, (-ccy * sc + shy) * k);
      var x0 = ccx, x1 = ccx + vw, i0 = Math.floor(x0 / STEP) - 1, i1 = Math.floor(x1 / STEP) + 2, bot = ccy + VIEW_H + 80;
      var lw = 1 / sc;
      // decor firs
      c.fillStyle = 'rgba(14,19,23,0.13)';
      for (var cell = Math.floor(x0 / 74) - 1; cell < x1 / 74 + 1; cell++) {
        if (hash(cell) > 0.4) continue;
        var tx = cell * 74 + hash(cell + 9) * 50, tg = gy(tx); if (tg == null) continue;
        var th = 20 + hash(cell + 3) * 16;
        c.beginPath(); c.moveTo(tx, tg + 4); c.lineTo(tx - th * 0.28, tg + 4); c.lineTo(tx - th * 0.1, tg - th * 0.45); c.lineTo(tx - th * 0.22, tg - th * 0.45); c.lineTo(tx, tg - th); c.lineTo(tx + th * 0.22, tg - th * 0.45); c.lineTo(tx + th * 0.1, tg - th * 0.45); c.lineTo(tx + th * 0.28, tg + 4); c.closePath(); c.fill();
      }
      // terrain runs
      var run = false, runStart = 0, runs = [];
      for (q = i0; q <= i1; q++) {
        var jj = q - idx0; if (jj < 0 || jj >= hs.length) { if (run) { runs.push([runStart, q - 1]); run = false; } continue; }
        if (!gp[jj]) { if (!run) { run = true; runStart = q; } }
        else if (run) { runs.push([runStart, q - 1]); run = false; }
      }
      if (run) runs.push([runStart, i1]);
      for (w = 0; w < runs.length; w++) {
        var ra = runs[w][0], rb = runs[w][1];
        c.beginPath(); c.moveTo(ra * STEP, hs[ra - idx0]);
        for (q = ra + 1; q <= rb; q++) c.lineTo(q * STEP, hs[q - idx0]);
        c.lineTo(rb * STEP, bot); c.lineTo(ra * STEP, bot); c.closePath(); c.fillStyle = WHITE; c.fill();
        c.lineJoin = 'round';
        for (var kk = 1; kk <= 9; kk++) {
          var off = 9 + kk * 12 + kk * kk * 0.8;
          if (kk === 4) { c.strokeStyle = 'rgba(147,164,36,0.6)'; c.lineWidth = lw * 1.6; c.setLineDash([9 * lw, 7 * lw]); }
          else { c.strokeStyle = 'rgba(14,19,23,' + (0.22 - kk * 0.017).toFixed(3) + ')'; c.lineWidth = lw * 1.1; }
          c.beginPath(); c.moveTo(ra * STEP, hs[ra - idx0] + off);
          for (q = ra + 1; q <= rb; q++) c.lineTo(q * STEP, hs[q - idx0] + off);
          c.stroke(); c.setLineDash([]);
        }
        drawTrail(c, ra, rb, lw);
        c.strokeStyle = INK; c.lineWidth = lw * 2.6; c.beginPath(); c.moveTo(ra * STEP, hs[ra - idx0]);
        for (q = ra + 1; q <= rb; q++) c.lineTo(q * STEP, hs[q - idx0]); c.stroke();
      }
      drawScree(c, x0, x1, lw);
      // pits
      c.fillStyle = INK;
      for (q = 0; q < 8; q++) {
        var G = gaps[q]; if (!G.on || G.x1 < x0 - 20 || G.x0 > x1 + 20) continue;
        c.beginPath(); c.moveTo(G.x0, G.y0); c.lineTo(G.x1, G.y1); c.lineTo(G.x1, bot); c.lineTo(G.x0, bot); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(147,164,36,0.9)'; c.lineWidth = lw * 2; c.beginPath(); c.moveTo(G.x0 + 1, G.y0 + 8); c.lineTo(G.x0 + 1, bot); c.stroke();
      }
      // checkpoint poles (behind obstacles)
      for (q = 0; q < cps.length; q++) { var cq = cps[q]; if (cq.on && cq.x > x0 - 80 && cq.x < x1 + 80) drawCp(c, cq, lw, 0); }
      // obstacles
      for (q = 0; q < obs.length; q++) {
        var o = obs[q]; if (!o.on || o.x < x0 - 40 || o.x > x1 + 40) continue;
        if (o.y == null) { o.y = gy(o.x); if (o.y == null) continue; }
        drawObs(c, o, lw);
      }
      // checkpoints
      for (q = 0; q < cps.length; q++) { var cp = cps[q]; if (cp.on && cp.x > x0 - 80 && cp.x < x1 + 80) drawCp(c, cp, lw, 1); }
      // particles
      for (q = 0; q < NP; q++) {
        var b = q * 8, lf = P[b + 4]; if (lf <= 0) continue;
        c.globalAlpha = clamp(lf / P[b + 5], 0, 1) * (P[b + 7] ? 1 : 0.8);
        c.fillStyle = P[b + 7] ? ORANGE : (mode === 'ski' ? '#A9BCC6' : '#5F6B73');
        c.beginPath(); c.arc(P[b], P[b + 1], P[b + 6], 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      // rider
      c.save(); c.translate(rx, ry); c.rotate(rot); c.scale(1 + sq * 0.22, 1 - sq * 0.22);
      var crouch = grounded && held ? 1 : clamp(sq * 0.8, 0, 1);
      if (mode === 'mtb') drawBike(c, wr, crouch); else drawSki(c, crouch);
      c.restore();
      // popups
      for (q = 0; q < pops.length; q++) {
        var p = pops[q]; if (!p.on) continue;
        c.globalAlpha = clamp(p.life * 2, 0, 1); c.font = '800 15px ' + FD; c.textAlign = 'center'; c.lineWidth = 4 * lw; c.strokeStyle = SNOW; c.lineJoin = 'round';
        c.strokeText(p.s, p.x, p.y); c.fillStyle = p.c; c.fillText(p.s, p.x, p.y);
      }
      c.globalAlpha = 1;
      // screen space overlays
      c.setTransform(k, 0, 0, k, 0, 0);
      if (!reduce && state === 'run' && vx > 215) {
        c.strokeStyle = 'rgba(14,19,23,0.11)'; c.lineWidth = 1.2;
        var spd = clamp((vx - 215) / 140, 0, 1);
        for (q = 0; q < lines.length; q++) {
          var ln = lines[q]; var lx = ((ln.x * W - T * vx * sc * ln.s * 0.9) % (W + 80) + (W + 80)) % (W + 80) - 40;
          c.globalAlpha = spd; c.beginPath(); c.moveTo(lx, ln.y * H * 0.7 + 8); c.lineTo(lx + ln.l * (0.6 + spd), ln.y * H * 0.7 + 8); c.stroke();
        }
        c.globalAlpha = 1;
      }
      if (flourish > 0) drawFlourish(c);
    }
    function drawFlourish(c) {
      var t = 1.9 - flourish, sl_ = reduce ? 1 : (t < 0.25 ? sm(t / 0.25) : flourish < 0.3 ? sm(flourish / 0.3) : 1);
      var bh = clamp(H * 0.17, 44, 70), by = Math.max(74, H * 0.165, hud.offsetTop + hud.offsetHeight + 10, signT > 0 ? signB + 10 : 0), fs = Math.round(bh * 0.72);
      c.globalAlpha = reduce ? clamp(flourish, 0, 1) : 1;
      c.fillStyle = ORANGE; c.fillRect((sl_ - 1) * W, by, W, bh);
      c.fillStyle = INK; c.fillRect((sl_ - 1) * W, by, W, 3); c.fillRect((sl_ - 1) * W, by + bh - 3, W, 3);
      c.font = '900 ' + fs + 'px ' + FD; var tw = c.measureText(tr('go')).width; if (tw > W - 28) { fs = Math.floor(fs * (W - 28) / tw); c.font = '900 ' + fs + 'px ' + FD; }
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr('go'), W / 2 + (sl_ - 1) * W, by + bh / 2 + 2);
      c.textBaseline = 'alphabetic'; c.globalAlpha = 1;
    }
    function drawTrail(c, ra, rb, lw) {
      var TO = 54, q, a, b, col;
      c.lineCap = 'butt'; c.lineJoin = 'round';
      // grade ribbon, coloured per segment
      for (a = ra; a < rb; a += 3) {
        b = Math.min(rb, a + 3); col = GCOL[gradeOf(a * STEP / 10)];
        c.strokeStyle = col; c.lineWidth = lw * 5; c.globalAlpha = 0.9;
        c.beginPath(); c.moveTo(a * STEP, hs[a - idx0] + TO);
        for (q = a + 1; q <= b; q++) c.lineTo(q * STEP, hs[q - idx0] + TO);
        c.stroke();
      }
      // dashed ink edges
      c.globalAlpha = 1; c.strokeStyle = 'rgba(14,19,23,0.55)'; c.lineWidth = lw; c.setLineDash([6 * lw, 5 * lw]);
      for (var e = -1; e <= 1; e += 2) {
        c.beginPath(); c.moveTo(ra * STEP, hs[ra - idx0] + TO + e * 6);
        for (q = ra + 1; q <= rb; q++) c.lineTo(q * STEP, hs[q - idx0] + TO + e * 6);
        c.stroke();
      }
      c.setLineDash([]);
      // stakes with grade markers; every 3rd carries an orange flag
      var s0 = Math.ceil(ra * STEP / 110), s1 = Math.floor(rb * STEP / 110);
      for (var n = s0; n <= s1; n++) {
        var wx = n * 110, g = gy(wx); if (g == null) continue;
        var by = g + TO - 3;
        c.strokeStyle = INK; c.lineWidth = lw * 1.8; c.beginPath(); c.moveTo(wx, by + 3); c.lineTo(wx, by - 17); c.stroke();
        c.fillStyle = GCOL[gradeOf(wx / 10)]; c.strokeStyle = INK; c.lineWidth = lw * 1.4;
        c.beginPath(); c.moveTo(wx, by - 24); c.lineTo(wx + 5, by - 19); c.lineTo(wx, by - 14); c.lineTo(wx - 5, by - 19); c.closePath(); c.fill(); c.stroke();
        if (n % 3 === 0) { c.fillStyle = ORANGE; c.beginPath(); c.moveTo(wx, by - 13); c.lineTo(wx + 13, by - 9); c.lineTo(wx, by - 5); c.closePath(); c.fill(); }
      }
    }
    function drawScree(c, x0, x1, lw) {
      var cell, h, wx, g, yy, len, sp, off = reduce ? 0 : PAR * x0;
      c.lineCap = 'round';
      for (cell = Math.floor((x0 + off) / 26) - 1; cell < (x1 + off) / 26 + 1; cell++) {
        h = hash(cell * 1.7 + 3); if (h > 0.62) continue;
        wx = cell * 26 + hash(cell + 5) * 22 - off; g = gy(wx); if (g == null) continue;
        yy = g + 18 + hash(cell + 11) * 104; if (Math.abs(yy - g - 54) < 9) continue;
        len = 4 + hash(cell + 2) * 9; sp = sl(wx);
        if (h < 0.12) {
          c.fillStyle = 'rgba(14,19,23,0.3)'; c.beginPath(); c.moveTo(wx - 4, yy + 2); c.lineTo(wx - 1, yy - 3); c.lineTo(wx + 4, yy + 2); c.closePath(); c.fill();
        } else if (h < 0.17) {
          c.fillStyle = ORANGE; c.fillRect(wx - 1.5, yy - 1.5, 3, 3);
        } else {
          c.strokeStyle = 'rgba(14,19,23,0.3)'; c.lineWidth = lw * 1.5; c.beginPath(); c.moveTo(wx, yy); c.lineTo(wx + len, yy + len * sp); c.stroke();
        }
      }
    }
    function drawObs(c, o, lw) {
      var g = o.y, hw = o.w / 2, h = o.h, sd = o.seed;
      c.fillStyle = INK; c.strokeStyle = INK;
      if (o.t === T_ROCK || o.t === T_BOULDER) {
        c.beginPath(); c.moveTo(o.x - hw, g + 2); c.lineTo(o.x - hw * 0.8, g - h * 0.55); c.lineTo(o.x - hw * 0.25, g - h);
        c.lineTo(o.x + hw * (0.2 + sd * 0.3), g - h * 0.92); c.lineTo(o.x + hw * 0.9, g - h * 0.4); c.lineTo(o.x + hw, g + 2); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(241,245,247,0.55)'; c.lineWidth = lw * 1.4; c.beginPath(); c.moveTo(o.x - hw * 0.55, g - h * 0.45); c.lineTo(o.x - hw * 0.2, g - h * 0.82); c.lineTo(o.x + hw * 0.1, g - h * 0.7); c.stroke();
      } else if (o.t === T_ROOT) {
        c.lineCap = 'round'; c.lineWidth = lw * 4; c.beginPath(); c.moveTo(o.x - 18, g + 1); c.quadraticCurveTo(o.x - 8, g - 13, o.x + 2, g - 2); c.quadraticCurveTo(o.x + 8, g - 9, o.x + 18, g + 1); c.stroke();
        c.lineWidth = lw * 2.4; c.beginPath(); c.moveTo(o.x - 3, g - 3); c.quadraticCurveTo(o.x + 2, g - 14, o.x + 11, g - 11); c.stroke();
      } else if (o.t === T_TREE) {
        var th = o.h; c.fillRect(o.x - 2.5, g - 12, 5, 14);
        for (var t = 0; t < 3; t++) {
          var by = g - 8 - t * th * 0.27, tw = hw * (1.5 - t * 0.38) + 2;
          c.beginPath(); c.moveTo(o.x - tw, by); c.lineTo(o.x, by - th * 0.42); c.lineTo(o.x + tw, by); c.closePath(); c.fill();
        }
        c.fillStyle = ORANGE; c.fillRect(o.x - 3, g - 8, 6, 3);
      } else if (o.t === T_FLAG) {
        c.lineWidth = lw * 2; c.beginPath(); c.moveTo(o.x, g + 3); c.lineTo(o.x, g - o.h); c.stroke();
        c.fillStyle = ORANGE; c.beginPath(); c.moveTo(o.x, g - o.h); c.lineTo(o.x + 12, g - o.h + 4); c.lineTo(o.x, g - o.h + 8); c.closePath(); c.fill();
      }
    }
    function drawCp(c, cp, lw, pass) {
      var gyy = cp.gy; if (gyy == null) { gyy = cp.hasFix ? cp.gyFix : gy(cp.x); if (gyy == null) return; }
      var lab = CPS[cp.k][lang()], pop = reduce ? 1 : clamp(cp.age * 4, 0, 1), top = gyy - cp.h, bw = cpBoardW(cp);
      var s = sm(pop), lift = cp.col >= 0 ? cp.col * 28 : 0, al = cp.col >= 0 ? 1 - cp.col : 1; if (pop <= 0) return;
      var bob = reduce ? 0 : Math.sin(T * 3 + cp.k) * 1.5;
      c.globalAlpha = al; c.strokeStyle = INK; c.lineWidth = lw * 2;
      if (!pass) { if (cp.col < 0) { c.beginPath(); c.moveTo(cp.x, gyy + 3); c.lineTo(cp.x, top - 1 + bob); c.stroke(); } c.globalAlpha = 1; return; }
      c.save(); c.translate(cp.x, top - 9 + bob - lift); c.scale(s, s);
      c.fillStyle = ORANGE; c.lineWidth = lw * 2;
      c.beginPath(); c.moveTo(-bw / 2 + 3, -8); c.lineTo(bw / 2 - 3, -8); c.quadraticCurveTo(bw / 2, -8, bw / 2, -5); c.lineTo(bw / 2, 5); c.quadraticCurveTo(bw / 2, 8, bw / 2 - 3, 8);
      c.lineTo(-bw / 2 + 3, 8); c.quadraticCurveTo(-bw / 2, 8, -bw / 2, 5); c.lineTo(-bw / 2, -5); c.quadraticCurveTo(-bw / 2, -8, -bw / 2 + 3, -8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = INK; c.font = '800 11px ' + FD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, 0, 1);
      c.textBaseline = 'alphabetic'; c.restore(); c.globalAlpha = 1;
    }
    function drawBike(c, wrot, cr) {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK;
      var wxs = [-14, 14], q, wx;
      for (q = 0; q < 2; q++) {
        wx = wxs[q]; c.lineWidth = 2.4; c.beginPath(); c.arc(wx, -8.4, 8, 0, 6.283); c.stroke();
        c.lineWidth = 1; c.beginPath();
        c.moveTo(wx + Math.cos(wrot) * 7.5, -8.4 + Math.sin(wrot) * 7.5); c.lineTo(wx - Math.cos(wrot) * 7.5, -8.4 - Math.sin(wrot) * 7.5);
        c.moveTo(wx + Math.cos(wrot + 1.57) * 7.5, -8.4 + Math.sin(wrot + 1.57) * 7.5); c.lineTo(wx - Math.cos(wrot + 1.57) * 7.5, -8.4 - Math.sin(wrot + 1.57) * 7.5); c.stroke();
      }
      c.lineWidth = 2.6; c.beginPath();
      c.moveTo(-14, -8.4); c.lineTo(-2, -9); c.lineTo(-6, -22); c.lineTo(-14, -8.4); c.moveTo(-6, -22); c.lineTo(9, -23); c.lineTo(-2, -9); c.moveTo(9, -23); c.lineTo(14, -8.4); c.stroke();
      c.lineWidth = 3.4; c.beginPath(); c.moveTo(-6 - cr, -26 + cr * 3); c.lineTo(4, -17); c.lineTo(-2, -10); c.stroke();
      var sx = 4 + cr * 3, sy = -39 + cr * 9;
      c.strokeStyle = ORANGE; c.lineWidth = 7; c.beginPath(); c.moveTo(-6 - cr, -26 + cr * 3); c.lineTo(sx, sy); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(sx, sy); c.lineTo(10, -25.5); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.arc(sx + 3, sy - 6, 5, 0, 6.283); c.fill();
      c.strokeStyle = ORANGE; c.lineWidth = 1.8; c.beginPath(); c.moveTo(sx + 4, sy - 8); c.lineTo(sx + 9, sy - 6); c.stroke();
    }
    function drawSki(c, cr) {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 3.2;
      c.beginPath(); c.moveTo(-22, -2.2); c.lineTo(17, -2.2); c.quadraticCurveTo(25, -2.4, 28, -7); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(-3, -5); c.lineTo(-3, -8); c.moveTo(9, -5); c.lineTo(9, -8); c.stroke();
      var hy = -24 + cr * 5; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-3, -8); c.lineTo(5, -16 + cr * 2); c.lineTo(-1, hy); c.moveTo(9, -8); c.lineTo(11, -17 + cr * 2); c.lineTo(-1, hy); c.stroke();
      var sx = 7 + cr * 3, sy = -38 + cr * 9;
      c.lineWidth = 1.4; c.beginPath(); c.moveTo(16, -26); c.lineTo(-10, -2); c.stroke();
      c.strokeStyle = ORANGE; c.lineWidth = 7.5; c.beginPath(); c.moveTo(-1, hy); c.lineTo(sx, sy); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(sx, sy); c.lineTo(16, -26); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.arc(sx + 4, sy - 6, 5, 0, 6.283); c.fill();
      c.strokeStyle = SNOW; c.lineWidth = 2; c.beginPath(); c.moveTo(sx + 5, sy - 7); c.lineTo(sx + 9, sy - 6); c.stroke();
    }

    /* ---------- loop ---------- */
    function active() { return visible && !document.hidden; }
    function schedule() { if (!raf && active() && (state === 'run' || (state === 'crashed' && !settled))) raf = requestAnimationFrame(frame); }
    function frame(ts) {
      raf = 0;
      if (state !== 'run' && state !== 'crashed') return;
      if (!last) last = ts;
      var d = (ts - last) / 1000; last = ts; if (d > 0.1) d = 0.1; if (d < 0) d = 0;
      acc += d;
      while (acc >= DT) { step(DT); acc -= DT; }
      render(acc / DT);
      schedule();
      if (state === 'crashed' && settled) render(1);
    }
    function onVis() {
      if (!active()) { if (state === 'run') pause(true); if (raf) { cancelAnimationFrame(raf); raf = 0; } }
      else { last = 0; render(1); schedule(); }
    }

    /* ---------- events ---------- */
    function resize() {
      var rw = stage.clientWidth, rh = stage.clientHeight; if (!rw || !rh) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2.5); W = rw; H = rh;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      sc = H / VIEW_H; vw = W / sc;
      if (!hs.length) reset(); else { cx = x - vw * 0.28; pcx = cx; ensure(x + vw + 700); }
      render(1);
    }
    bMtb.addEventListener('click', function () { setMode('mtb'); });
    bSki.addEventListener('click', function () { setMode('ski'); });
    bPause.addEventListener('click', function () { pause(false); });
    cBtn.addEventListener('click', function () { start(); });
    stage.addEventListener('click', function (e) {
      if (state === 'idle' || state === 'paused') { if (e.target === cBtn) return; start(); }
    });
    stage.addEventListener('pointerdown', function (e) {
      if (e.target === cBtn) return;
      if (state === 'run') { ptrId = e.pointerId; press(); }
      else if (state === 'crashed' && crashT > 0.4) { start(); ptrId = e.pointerId; press(); }
    });
    function pup(e) { if (ptrId === e.pointerId) { ptrId = null; release(); } }
    window.addEventListener('pointerup', pup); window.addEventListener('pointercancel', pup);
    stage.addEventListener('mouseenter', function () { hovered = true; });
    stage.addEventListener('mouseleave', function () { hovered = false; setTimeout(maybeAutoPause, 0); });
    function isCtl(t) { return t && t.closest && t.closest('button,a,input,select,textarea,[contenteditable="true"]'); }
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var inRoot = root.contains(document.activeElement);
      var engaged = state === 'run' ? (visible && (hovered || inRoot)) : state === 'idle' ? inRoot : (hovered || inRoot);
      if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'run' && visible && (hovered || inRoot) && !isCtl(e.target)) { pause(false); e.preventDefault(); } return; }
      var isJump = e.code === 'Space' || e.code === 'ArrowUp';
      if (!isJump && !(e.code === 'Enter' && state === 'crashed' && engaged)) return;
      if (!engaged || isCtl(e.target)) return;
      e.preventDefault();
      if (e.repeat) return;
      if (state === 'run') press();
      else if (state === 'crashed') { if (crashT > 0.4) { start(); press(); } }
      else if (state === 'idle' || state === 'paused') start();
    });
    document.addEventListener('keyup', function (e) { if (e.code === 'Space' || e.code === 'ArrowUp') release(); });
    window.addEventListener('blur', release);
    function maybeAutoPause() { if (state === 'run' && !hovered && !root.contains(document.activeElement)) pause(true); }
    root.addEventListener('focusout', function () { setTimeout(maybeAutoPause, 0); setTimeout(focusUpdate, 0); });
    root.addEventListener('focusin', focusUpdate);
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('langchange', setLang);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) { visible = ents[0].intersectionRatio > 0.15; onVis(); }, { threshold: [0, 0.15, 0.5] }).observe(root);
    } else visible = true;
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!raf) render(1); });

    setTuning(); setLang(); resize();
    return { el: root };
  }

  window.TheLine = {
    mount: function (el) {
      if (!el) return null;
      if (el.__theLine) return el.__theLine;
      el.__theLine = Game(el); return el.__theLine;
    }
  };
})();
