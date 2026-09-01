/**
 * theme.js — Light/Dark Mode + RTL/LTR Toggle with LocalStorage
 */
import { getLS, setLS } from './utils.js';

const THEME_KEY = 'plumbing-theme';
const DIR_KEY   = 'plumbing-dir';

export function initTheme() {
  const saved   = getLS(THEME_KEY, 'light');
  const savedDir = getLS(DIR_KEY, 'ltr');
  applyTheme(saved);
  applyDir(savedDir);
  bindThemeToggle();
  bindDirToggle();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  setLS(THEME_KEY, theme);
  // Sync meta theme-color
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
  }
  meta.content = theme === 'dark' ? '#0D1929' : '#FAFAF7';
}

function applyDir(dir) {
  document.documentElement.dir  = dir;
  document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
  setLS(DIR_KEY, dir);
}

function bindThemeToggle() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function bindDirToggle() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-dir-toggle]');
    if (!btn) return;
    const current = document.documentElement.dir || 'ltr';
    applyDir(current === 'rtl' ? 'ltr' : 'rtl');
  });
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export function getCurrentDir() {
  return document.documentElement.dir || 'ltr';
}
