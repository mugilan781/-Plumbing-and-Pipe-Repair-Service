/**
 * animations.js — Scroll Reveal (IntersectionObserver) + Animated Counters
 */
import { $$, throttle, formatNumber } from './utils.js';

/* ── SCROLL REVEAL ── */
export function initScrollReveal() {
  const els = $$('[data-reveal], .stagger-children');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  els.forEach(el => obs.observe(el));
}

/* ── ANIMATED COUNTERS ── */
export function initCounters() {
  const counters = $$('[data-counter]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

function animateCounter(el) {
  const target   = parseFloat(el.dataset.counter);
  const duration = parseInt(el.dataset.duration || '2000');
  const decimals = parseInt(el.dataset.decimals || '0');
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';

  const start    = performance.now();
  const from     = 0;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutExpo(progress);
    const value    = from + (target - from) * eased;

    el.textContent = prefix + (decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()) + suffix;

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ── UNDERLINE DRAW ── */
export function initUnderlineDraws() {
  const els = $$('.underline-draw');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
}

/* ── PARALLAX ── */
export function initParallax() {
  const els = $$('[data-parallax]');
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function update() {
    const scrollY = window.scrollY;
    els.forEach(el => {
      const speed  = parseFloat(el.dataset.parallax || '0.3');
      const rect   = el.getBoundingClientRect();
      const offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset * 0.1}px)`;
    });
  }

  window.addEventListener('scroll', throttle(update, 16), { passive: true });
  update();
}

/* ── SCROLL PROGRESS BAR ── */
export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  function update() {
    const doc  = document.documentElement;
    const winH = window.innerHeight;
    const docH = doc.scrollHeight - winH;
    const scrolled = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = scrolled + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── TILT EFFECT ── */
export function initTiltCards() {
  const cards = $$('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * 6;
      const ry = ((x - cx) / cx) * -6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}
