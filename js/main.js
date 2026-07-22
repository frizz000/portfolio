// ─── THEME ───
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀' : '☾';

themeBtn.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    themeBtn.textContent = next === 'dark' ? '☀' : '☾';
    localStorage.setItem('theme', next);
});

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
});

// ─── MOBILE BURGER ───
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── SCROLL ANIMATIONS ───
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ─── PROJECT MODALS ───
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
            pl: 'Repozytorium jest obecnie prywatne — projekt stanowi część mojej pracy magisterskiej.',
            en: 'The repository is currently private — this project is part of my master\'s thesis.'
        },
        links: [
            { label: { pl: 'Zobacz stronę →', en: 'View website →' }, url: 'https://calltime.pl' }
        ]
    }
};

const modalOverlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
let lastFocusedEl = null;

function renderModal(id) {
    const p = projectsData[id];
    if (!p) return;

    const tagsHtml = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const linksHtml = p.links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener" class="btn-primary">
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
    document.body.style.overflow = 'hidden';
    modalClose.focus();
}

function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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

document.querySelectorAll('.project-btn').forEach(btn => {
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
