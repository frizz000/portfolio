const html = document.documentElement;

// ─── LANGUAGE ───
const langBtn = document.getElementById('langToggle');
const savedLang = localStorage.getItem('lang') || 'pl';
html.setAttribute('data-lang', savedLang);
langBtn.textContent = savedLang === 'pl' ? 'EN' : 'PL';

langBtn.addEventListener('click', () => {
    const curr = html.getAttribute('data-lang');
    const next = curr === 'pl' ? 'en' : 'pl';
    html.setAttribute('data-lang', next);
    langBtn.textContent = next === 'pl' ? 'EN' : 'PL';
    localStorage.setItem('lang', next);
    refreshTaskbarLabels();
});

// ─── WINDOW MANAGER ───
const desktop = document.getElementById('desktop');
const taskbarApps = document.getElementById('taskbarApps');

const APP_TITLES = {
    welcome: { pl: '📝 Witaj.txt', en: '📝 Witaj.txt' },
    terminal: { pl: '💻 piotr@homelab', en: '💻 piotr@homelab' },
    about: { pl: '📄 O mnie', en: '📄 About me' },
    projects: { pl: '📁 Projekty', en: '📁 Projects' },
    contact: { pl: '✉️ Kontakt', en: '✉️ Contact' },
    saper: { pl: '💣 Saper', en: '💣 Minesweeper' },
    mycomputer: { pl: '🖥️ Mój Komputer', en: '🖥️ My Computer' },
    trash: { pl: '🗑️ Kosz', en: '🗑️ Recycle Bin' }
};

const DEFAULT_POS = {
    welcome: { left: '13%', top: '7%' },
    terminal: { left: '46%', top: '10%' },
    about: { left: '15%', top: '14%' },
    projects: { left: '18%', top: '10%' },
    contact: { left: '20%', top: '11%' },
    saper: { left: '32%', top: '15%' },
    mycomputer: { left: '24%', top: '18%' },
    trash: { left: '22%', top: '50%' }
};

const windows = {};
document.querySelectorAll('.os-window').forEach(el => {
    windows[el.dataset.app] = { el, taskbarBtn: null, minimized: false, positioned: false };
});

let zTop = 10;
let openCount = 0;
let activeApp = null;

function isMobile() {
    return window.matchMedia('(max-width: 900px)').matches;
}

function placeWindow(app) {
    const w = windows[app];
    if (w.positioned || isMobile()) return;
    const pos = DEFAULT_POS[app] || { left: '10%', top: '10%' };
    const cascade = (openCount % 6) * 22;
    w.el.style.left = `calc(${pos.left} + ${cascade}px)`;
    w.el.style.top = `calc(${pos.top} + ${cascade}px)`;
    w.positioned = true;
}

function updateTaskbarButtonLabel(btn, app) {
    const lang = html.getAttribute('data-lang');
    const t = APP_TITLES[app];
    btn.textContent = t ? t[lang] : app;
}

function refreshTaskbarLabels() {
    document.querySelectorAll('.taskbar-app-btn').forEach(btn => updateTaskbarButtonLabel(btn, btn.dataset.app));
}

function createTaskbarButton(app) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'taskbar-app-btn';
    btn.dataset.app = app;
    updateTaskbarButtonLabel(btn, app);
    btn.addEventListener('click', () => {
        if (activeApp === app && !windows[app].minimized) {
            minimizeWindow(app);
        } else {
            focusWindow(app);
        }
    });
    taskbarApps.appendChild(btn);
    return btn;
}

function openWindow(app) {
    const w = windows[app];
    if (!w) return;
    openCount++;
    placeWindow(app);
    w.el.classList.add('open');
    w.minimized = false;
    if (!w.taskbarBtn) w.taskbarBtn = createTaskbarButton(app);
    focusWindow(app);
    if (app === 'saper') msBuildBoard();
}

function closeWindow(app) {
    const w = windows[app];
    if (!w) return;
    w.el.classList.remove('open', 'maximized');
    if (w.taskbarBtn) { w.taskbarBtn.remove(); w.taskbarBtn = null; }
    w.minimized = false;
    if (activeApp === app) activeApp = null;
    if (app === 'saper') clearInterval(msTimerInterval);
}

function minimizeWindow(app) {
    const w = windows[app];
    if (!w) return;
    w.el.classList.remove('open');
    w.minimized = true;
    if (w.taskbarBtn) w.taskbarBtn.classList.remove('active');
    if (activeApp === app) activeApp = null;
}

function focusWindow(app) {
    const w = windows[app];
    if (!w) return;
    if (w.minimized) {
        w.el.classList.add('open');
        w.minimized = false;
    }
    zTop += 1;
    w.el.style.zIndex = zTop;
    activeApp = app;
    document.querySelectorAll('.taskbar-app-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.app === app));
}

function toggleMaximize(app) {
    windows[app].el.classList.toggle('maximized');
}

// window-chrome buttons (minimize / maximize / close) via delegation
document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-win-action]');
    if (!actionBtn) return;
    const winEl = actionBtn.closest('.os-window');
    if (!winEl) return;
    const app = winEl.dataset.app;
    const action = actionBtn.dataset.winAction;
    if (action === 'close') closeWindow(app);
    else if (action === 'minimize') minimizeWindow(app);
    else if (action === 'maximize') toggleMaximize(app);
});

// desktop icons + any button that should open/focus a window (Witaj.txt CTAs, Start Menu)
document.querySelectorAll('.desktop-icon, [data-open-app]').forEach(el => {
    const app = el.dataset.app || el.dataset.openApp;
    el.addEventListener('click', () => {
        openWindow(app);
        closeStartMenu();
    });
});

// ─── DRAG ───
document.querySelectorAll('.os-window').forEach(winEl => {
    const titleBar = winEl.querySelector('.title-bar');
    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

    titleBar.addEventListener('mousedown', (e) => {
        if (isMobile() || winEl.classList.contains('maximized')) return;
        if (e.target.closest('.title-bar-controls')) return;
        dragging = true;
        const rect = winEl.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        focusWindow(winEl.dataset.app);
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const desktopRect = desktop.getBoundingClientRect();
        let newLeft = startLeft + (e.clientX - startX);
        let newTop = startTop + (e.clientY - startY);
        newLeft = Math.max(0, Math.min(newLeft, desktopRect.width - winEl.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, desktopRect.height - 40));
        winEl.style.left = `${newLeft}px`;
        winEl.style.top = `${newTop}px`;
    });

    window.addEventListener('mouseup', () => { dragging = false; });
});

// ─── START MENU ───
const startBtn = document.getElementById('startBtn');
const startMenu = document.getElementById('startMenu');

function openStartMenu() {
    startMenu.classList.add('open');
    startMenu.setAttribute('aria-hidden', 'false');
    startBtn.classList.add('open');
    startBtn.setAttribute('aria-expanded', 'true');
}

function closeStartMenu() {
    startMenu.classList.remove('open');
    startMenu.setAttribute('aria-hidden', 'true');
    startBtn.classList.remove('open');
    startBtn.setAttribute('aria-expanded', 'false');
}

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (startMenu.classList.contains('open')) closeStartMenu();
    else openStartMenu();
});

document.addEventListener('click', (e) => {
    if (startMenu.classList.contains('open') && !startMenu.contains(e.target) && e.target !== startBtn) {
        closeStartMenu();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && startMenu.classList.contains('open')) closeStartMenu();
});

// ─── LOGOUT (Start Menu joke item) ───
const logoutBtn = document.getElementById('logoutBtn');
const logoutOverlay = document.getElementById('logoutOverlay');

function resetDesktop() {
    Object.keys(windows).forEach(app => closeWindow(app));
    openCount = 0;
    Object.values(windows).forEach(w => {
        w.positioned = false;
        w.el.style.left = '';
        w.el.style.top = '';
        w.el.style.zIndex = '';
        w.el.classList.remove('maximized');
    });
    openWindow('welcome');
    openWindow('terminal');
}

logoutBtn.addEventListener('click', () => {
    closeStartMenu();
    logoutOverlay.classList.add('open');
    logoutOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
        resetDesktop();
        logoutOverlay.classList.remove('open');
        logoutOverlay.setAttribute('aria-hidden', 'true');
    }, 1800);
});

// ─── TRAY CLOCK ───
const trayClock = document.getElementById('trayClock');
function updateClock() {
    trayClock.textContent = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
updateClock();
setInterval(updateClock, 30000);

// ─── DEFAULT-OPEN WINDOWS ───
openWindow('welcome');
openWindow('terminal');

// ─── PROJECT DETAILS MODAL ───
const projectsData = {
    homelab: {
        icon: '🏠',
        title: { pl: 'Zaawansowany Home Lab i Automatyka Budynkowa', en: 'Advanced Home Lab & Building Automation' },
        desc: {
            pl: 'Architektura wirtualizacji i konteneryzacji Docker/LXC wraz z własnym serwerem NAS i strefami DNS. Sercem systemu jest Home Assistant realizujący zaawansowaną logikę sterowania oświetleniem, roletami i ogrzewaniem. Całość infrastruktury monitorowana jest w czasie rzeczywistym przez Uptime Kumę.',
            en: 'A virtualization and containerization architecture (Docker/LXC) with its own NAS server and DNS zones. At the heart of the system is Home Assistant, running advanced control logic for lighting, blinds and heating. The whole infrastructure is monitored in real time with Uptime Kuma.'
        },
        tech: ['Proxmox', 'Home Assistant', 'Docker', 'Sieci LAN', 'IoT'],
        links: [
            { label: { pl: 'Kod na GitHub →', en: 'Code on GitHub →' }, url: 'https://github.com/frizz000/home-assistant-config.git' }
        ]
    },
    talenttrop: {
        icon: '🎯',
        title: { pl: 'Talent Trop - Skauting AI', en: 'Talent Trop - AI Scouting' },
        desc: {
            pl: 'Zaawansowana aplikacja webowa analizująca dane zawodników. Generuje ocenę "Talent Score" i bada dopasowanie "Brand Fit", wyszukując luki w kadrach sportowych. Projekt dowodzi umiejętności integracji zewnętrznych API AI ze środowiskiem chmurowym.',
            en: 'An advanced web application analyzing player data. It generates a "Talent Score" rating and evaluates "Brand Fit", surfacing gaps in sports rosters. The project demonstrates integrating external AI APIs into a cloud environment.'
        },
        tech: ['React', 'Vercel', 'Supabase', 'LLM (ChatGPT/Claude)'],
        links: [
            { label: { pl: 'Kod na GitHub →', en: 'Code on GitHub →' }, url: 'https://github.com/frizz000/talent-trop.git' }
        ]
    },
    calltime: {
        icon: '📅',
        title: { pl: 'Calltime - Event Management PWA', en: 'Calltime - Event Management PWA' },
        desc: {
            pl: 'Narzędzie stworzone do zarządzania akredytacjami, harmonogramem i kateringiem. Posiada moduł skanowania kodów QR oraz zintegrowanego chatbota AI. Zbudowana w architekturze multi-tenant z naciskiem na bezpieczeństwo i zgodność z RODO.',
            en: 'A tool built to manage accreditations, scheduling and catering. It includes a QR code scanning module and an integrated AI chatbot. Built on a multi-tenant architecture with a focus on security and GDPR compliance.'
        },
        tech: ['React', 'JavaScript', 'Supabase', 'Vercel'],
        note: {
            pl: 'Repozytorium jest obecnie prywatne, ponieważ projekt stanowi część mojej pracy magisterskiej.',
            en: 'The repository is currently private, since this project is part of my master\'s thesis.'
        },
        links: [
            { label: { pl: 'Zobacz stronę →', en: 'View website →' }, url: 'https://calltime.pl' }
        ]
    }
};

const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
let lastFocusedEl = null;

function renderModal(id) {
    const p = projectsData[id];
    if (!p) return;

    const tagsHtml = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const linksHtml = p.links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener" class="btn-xp btn-xp-primary">
            <span class="pl">${l.label.pl}</span>
            <span class="en">${l.label.en}</span>
        </a>`
    ).join('');
    const noteHtml = p.note
        ? `<p class="modal-note"><span class="pl">${p.note.pl}</span><span class="en">${p.note.en}</span></p>`
        : '';

    modalBody.innerHTML = `
        <div class="modal-icon">${p.icon}</div>
        <h3 class="modal-title pl">${p.title.pl}</h3>
        <h3 class="modal-title en">${p.title.en}</h3>
        <p class="modal-desc pl">${p.desc.pl}</p>
        <p class="modal-desc en">${p.desc.en}</p>
        <div class="modal-tags">${tagsHtml}</div>
        ${noteHtml}
        <div class="modal-links">${linksHtml}</div>
    `;
}

function openModal(id) {
    lastFocusedEl = document.activeElement;
    renderModal(id);
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalClose.focus();
}

function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    if (lastFocusedEl) lastFocusedEl.focus();
}

document.querySelectorAll('.project-card').forEach(card => {
    const id = card.dataset.project;
    card.addEventListener('click', () => openModal(id));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(id);
        }
    });
});

document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(btn.dataset.openModal);
    });
});

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// ─── CONTACT FORM (Formspree) ───
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqeggbao';

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('formStatus');
    const btn = form.querySelector('button[type="submit"]');
    const lang = html.getAttribute('data-lang');

    btn.textContent = lang === 'pl' ? 'Wysyłanie...' : 'Sending...';
    btn.disabled = true;

    try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
            status.className = 'form-status success';
            status.textContent = lang === 'pl'
                ? '✓ Wiadomość wysłana! Odezwę się najszybciej jak mogę.'
                : '✓ Message sent! I\'ll get back to you as soon as possible.';
            form.reset();
        } else {
            throw new Error('Form error');
        }
    } catch {
        status.className = 'form-status error';
        status.textContent = lang === 'pl'
            ? '✗ Błąd wysyłania. Napisz bezpośrednio na email.'
            : '✗ Send error. Please email me directly.';
    }

    btn.textContent = lang === 'pl' ? 'Wyślij wiadomość →' : 'Send message →';
    btn.disabled = false;
});

// ─── SYNTHESIZED XP-STYLE SOUND EFFECTS (Web Audio, no external files) ───
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playSound(kind) {
    try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        if (kind === 'click') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (kind === 'flag') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (kind === 'boom') {
            const bufferSize = ctx.sampleRate * 0.35;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            noise.connect(gain).connect(ctx.destination);
            noise.start(now);
        } else if (kind === 'win') {
            [523, 659, 784, 1046].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.06, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.25);
            });
        }
    } catch {
        /* Web Audio unavailable — fail silently */
    }
}

// ─── MINESWEEPER (Saper.exe) ───
const MS_COLS = 9, MS_ROWS = 9, MS_MINES = 10;
let msCells = [];
let msRevealedCount = 0;
let msFlagCount = 0;
let msGameOver = false;
let msStarted = false;
let msTimerInterval = null;
let msSeconds = 0;

const msGridEl = document.getElementById('msGrid');
const msMineCountEl = document.getElementById('msMineCount');
const msTimerEl = document.getElementById('msTimer');
const msFaceEl = document.getElementById('msFace');

function msIndex(r, c) { return r * MS_COLS + c; }
function msCellEl(i) { return msGridEl.children[i]; }

function msNeighbors(r, c) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < MS_ROWS && nc >= 0 && nc < MS_COLS) out.push(msIndex(nr, nc));
        }
    }
    return out;
}

function msPlaceMines(safeIndex) {
    const safeZone = new Set([safeIndex, ...msNeighbors(Math.floor(safeIndex / MS_COLS), safeIndex % MS_COLS)]);
    let placed = 0;
    while (placed < MS_MINES) {
        const i = Math.floor(Math.random() * MS_COLS * MS_ROWS);
        if (safeZone.has(i) || msCells[i].mine) continue;
        msCells[i].mine = true;
        placed++;
    }
    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            const i = msIndex(r, c);
            if (!msCells[i].mine) {
                msCells[i].adjacent = msNeighbors(r, c).filter(n => msCells[n].mine).length;
            }
        }
    }
}

function msBuildBoard() {
    msCells = Array.from({ length: MS_COLS * MS_ROWS }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }));
    msRevealedCount = 0;
    msFlagCount = 0;
    msGameOver = false;
    msStarted = false;
    msSeconds = 0;
    clearInterval(msTimerInterval);
    msTimerInterval = null;
    msMineCountEl.textContent = String(MS_MINES).padStart(3, '0');
    msTimerEl.textContent = '000';
    msFaceEl.textContent = '🙂';

    msGridEl.innerHTML = '';
    for (let i = 0; i < MS_COLS * MS_ROWS; i++) {
        const btn = document.createElement('button');
        btn.className = 'ms-cell';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Pole');
        btn.addEventListener('click', () => msReveal(i));
        btn.addEventListener('contextmenu', (e) => { e.preventDefault(); msToggleFlag(i); });
        msGridEl.appendChild(btn);
    }
}

function msStartTimer() {
    if (msTimerInterval) return;
    msTimerInterval = setInterval(() => {
        msSeconds = Math.min(999, msSeconds + 1);
        msTimerEl.textContent = String(msSeconds).padStart(3, '0');
    }, 1000);
}

function msReveal(i) {
    if (msGameOver || msCells[i].revealed || msCells[i].flagged) return;
    if (!msStarted) {
        msStarted = true;
        msPlaceMines(i);
        msStartTimer();
    }

    const cell = msCells[i];
    cell.revealed = true;
    msRevealedCount++;
    const el = msCellEl(i);
    el.classList.add('revealed');

    if (cell.mine) {
        el.textContent = '💣';
        el.classList.add('mine-hit');
        playSound('boom');
        msEndGame(false);
        return;
    }

    playSound('click');

    if (cell.adjacent > 0) {
        el.textContent = String(cell.adjacent);
        el.classList.add('n' + cell.adjacent);
    } else {
        const r = Math.floor(i / MS_COLS), c = i % MS_COLS;
        msNeighbors(r, c).forEach(n => { if (!msCells[n].revealed && !msCells[n].flagged) msReveal(n); });
    }

    if (msRevealedCount === MS_COLS * MS_ROWS - MS_MINES) {
        msEndGame(true);
    }
}

function msToggleFlag(i) {
    if (msGameOver || msCells[i].revealed) return;
    const cell = msCells[i];
    cell.flagged = !cell.flagged;
    msFlagCount += cell.flagged ? 1 : -1;
    msCellEl(i).textContent = cell.flagged ? '🚩' : '';
    msMineCountEl.textContent = String(MS_MINES - msFlagCount).padStart(3, '0');
    playSound('flag');
}

function msEndGame(won) {
    msGameOver = true;
    clearInterval(msTimerInterval);
    msFaceEl.textContent = won ? '😎' : '😵';
    if (won) {
        playSound('win');
        msCells.forEach((cell, i) => { if (cell.mine && !cell.flagged) msCellEl(i).textContent = '🚩'; });
        msMineCountEl.textContent = '000';
    } else {
        msCells.forEach((cell, i) => { if (cell.mine && !cell.revealed) msCellEl(i).textContent = '💣'; });
    }
}

msFaceEl.addEventListener('click', msBuildBoard);
