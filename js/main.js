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
