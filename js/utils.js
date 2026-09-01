/**
 * utils.js — Shared utility functions
 */

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export function debounce(fn, ms = 200) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

export function throttle(fn, ms = 50) {
  let last = 0;
  let timer = null;
  return (...args) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getLS(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

export function setLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function addEvent(el, type, fn, opts) {
  if (!el) return;
  const els = el instanceof NodeList || Array.isArray(el) ? [...el] : [el];
  els.forEach(e => e.addEventListener(type, fn, opts));
}

export function createEl(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'html')  el.innerHTML = v;
    else if (k === 'text')  el.textContent = v;
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (typeof c === 'string') el.append(document.createTextNode(c));
    else if (c) el.append(c);
  });
  return el;
}

export function showToast(message, type = 'success', duration = 4000) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  let container = $('.toast-container');
  if (!container) {
    container = createEl('div', { class: 'toast-container' });
    document.body.append(container);
  }

  const toast = createEl('div', { class: `toast toast-${type}` },
    createEl('div', { class: 'toast-icon', text: icons[type] }),
    createEl('div', { class: 'toast-message', text: message })
  );

  container.append(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

export function isInViewport(el, threshold = 0) {
  const r = el.getBoundingClientRect();
  return r.top <= (window.innerHeight - threshold) && r.bottom >= threshold;
}

export function waitForEl(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const obs = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { obs.disconnect(); resolve(found); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); reject(); }, timeout);
  });
}
