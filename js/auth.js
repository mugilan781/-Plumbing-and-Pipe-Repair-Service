/**
 * auth.js — Profile dropdown (site-wide) + Login/Signup page logic.
 * Frontend-only: validation, password toggles, remember-me via localStorage.
 * No backend, no fake OAuth — social buttons show an informational toast.
 */
import { $, $$, showToast, getLS, setLS } from './utils.js';

const REMEMBER_KEY = 'flowmaster-remember-email';

/* ─────────────────────────────────────────────
   PROFILE DROPDOWN (existing navbar integration)
   Click to open · outside-click to close · Esc to close ·
   keyboard accessible · works in desktop + mobile navbar
───────────────────────────────────────────── */
export function initProfileDropdown() {
  const menus = $$('.profile-menu');
  if (!menus.length) return;

  menus.forEach(menu => {
    const btn = $('.profile-btn', menu);
    const dropdown = $('.profile-dropdown', menu);
    if (!btn || !dropdown) return;

    const links = $$('a', dropdown);

    const isOpen = () => menu.classList.contains('open');
    const open = () => {
      closeAllProfileMenus(menu);
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    };
    const close = (focusBtn = false) => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (isOpen()) close();
      else open();
    });

    // Close when a dropdown link is chosen (navigation proceeds)
    links.forEach(link => {
      link.addEventListener('click', () => close());
    });

    // Keyboard: Esc closes, ArrowDown from button moves into menu
    menu.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen()) {
        e.stopPropagation();
        close(true);
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement === btn && !isOpen()) {
        e.preventDefault();
        open();
        links[0]?.focus();
      }
    });
  });

  // Single shared outside-click + Esc handler
  if (!document.__profileDropdownBound) {
    document.__profileDropdownBound = true;
    document.addEventListener('click', e => {
      if (!e.target.closest('.profile-menu')) closeAllProfileMenus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllProfileMenus();
    });
  }
}

function closeAllProfileMenus(except = null) {
  $$('.profile-menu.open').forEach(menu => {
    if (menu !== except) {
      menu.classList.remove('open');
      $('.profile-btn', menu)?.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ─────────────────────────────────────────────
   PASSWORD VISIBILITY TOGGLES (vector eye icons)
───────────────────────────────────────────── */
export function initPasswordToggles(root = document) {
  $$('.auth-pass-toggle', root).forEach(toggle => {
    if (toggle.__bound) return;
    toggle.__bound = true;
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('aria-controls') || toggle.dataset.target;
      const input = targetId ? document.getElementById(targetId) : toggle.closest('.auth-pass-wrap')?.querySelector('input');
      if (!input) return;
      const showing = input.type === 'password';
      input.type = showing ? 'text' : 'password';
      toggle.classList.toggle('showing', showing);
      toggle.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
      toggle.setAttribute('aria-pressed', showing ? 'true' : 'false');
    });
  });
}

/* ─────────────────────────────────────────────
   AUTH FORM VALIDATION (mirrors forms.js rules/messages,
   plus confirm-match + terms for signup)
───────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

function setFieldError(input, message) {
  const group = input.closest('.form-group');
  const errEl = group?.querySelector('.form-error');
  const valid = !message;
  input.classList.toggle('error', !valid);
  input.classList.toggle('success', valid && input.value.trim().length > 0);
  if (errEl) {
    errEl.textContent = message || '';
    errEl.classList.toggle('visible', !valid);
  }
  input.setAttribute('aria-invalid', valid ? 'false' : 'true');
  return valid;
}

function validateEmail(input) {
  const v = input.value.trim();
  if (!v) return setFieldError(input, 'Email address is required.');
  if (!EMAIL_RE.test(v)) return setFieldError(input, 'Please enter a valid email address.');
  return setFieldError(input, '');
}

function validatePassword(input, min = 8) {
  const v = input.value;
  if (!v) return setFieldError(input, 'Password is required.');
  if (v.length < min) return setFieldError(input, `Password must be at least ${min} characters.`);
  return setFieldError(input, '');
}

function validateRequired(input, label) {
  if (!input.value.trim()) return setFieldError(input, `${label} is required.`);
  return setFieldError(input, '');
}

function validatePhone(input) {
  const v = input.value.trim();
  if (!v) return setFieldError(input, 'Phone number is required.');
  if (!PHONE_RE.test(v)) return setFieldError(input, 'Please enter a valid phone number.');
  return setFieldError(input, '');
}

function validateConfirm(passInput, confirmInput) {
  const v = confirmInput.value;
  if (!v) return setFieldError(confirmInput, 'Please confirm your password.');
  if (v !== passInput.value) return setFieldError(confirmInput, 'Passwords do not match.');
  return setFieldError(confirmInput, '');
}

function validateTerms(checkbox) {
  const group = checkbox.closest('.auth-terms');
  let errEl = group?.parentElement?.querySelector('.form-error');
  // Create a shared error node after the terms row if missing
  if (!errEl && group) {
    errEl = document.createElement('div');
    errEl.className = 'form-error';
    errEl.setAttribute('role', 'alert');
    group.insertAdjacentElement('afterend', errEl);
  }
  const valid = checkbox.checked;
  if (errEl) {
    errEl.textContent = valid ? '' : 'Please accept the Terms & Conditions and Privacy Policy.';
    errEl.classList.toggle('visible', !valid);
  }
  return valid;
}

function setSubmitting(btn, submitting) {
  if (!btn) return;
  if (submitting) {
    btn.dataset.original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Please wait…';
  } else {
    btn.disabled = false;
    if (btn.dataset.original) btn.innerHTML = btn.dataset.original;
  }
}

/* ── LOGIN ── */
function initLoginForm(form) {
  const email = $('#loginEmail', form);
  const password = $('#loginPassword', form);
  const remember = $('#rememberMe', form);
  const submitBtn = $('button[type="submit"]', form);

  // Prefill remembered email
  const remembered = getLS(REMEMBER_KEY, '');
  if (remembered && email && !email.value) {
    email.value = remembered;
    if (remember) remember.checked = true;
  }

  email?.addEventListener('blur', () => validateEmail(email));
  password?.addEventListener('blur', () => validatePassword(password, 1));
  email?.addEventListener('input', () => {
    if (email.classList.contains('error')) validateEmail(email);
  });
  password?.addEventListener('input', () => {
    if (password.classList.contains('error')) validatePassword(password, 1);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const emailOk = validateEmail(email);
    // Login: password required (any length — do not enforce creation rules here)
    const passOk = password.value
      ? setFieldError(password, '')
      : setFieldError(password, 'Password is required.');
    if (!emailOk || !passOk) {
      showToast('Please fix the errors above.', 'error');
      form.querySelector('.error')?.focus();
      return;
    }

    if (remember?.checked) setLS(REMEMBER_KEY, email.value.trim());
    else setLS(REMEMBER_KEY, '');

    setSubmitting(submitBtn, true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(submitBtn, false);

    showToast('Signed in successfully. Welcome back!', 'success');
    form.reset();
    $$('.form-control', form).forEach(el => el.classList.remove('success', 'error'));
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  });
}

/* ── SIGNUP ── */
function initSignupForm(form) {
  const name = $('#signupName', form);
  const email = $('#signupEmail', form);
  const phone = $('#signupPhone', form);
  const password = $('#signupPassword', form);
  const confirm = $('#signupConfirm', form);
  const terms = $('#termsAgree', form);
  const submitBtn = $('button[type="submit"]', form);

  name?.addEventListener('blur', () => validateRequired(name, 'Full name'));
  email?.addEventListener('blur', () => validateEmail(email));
  phone?.addEventListener('blur', () => validatePhone(phone));
  password?.addEventListener('blur', () => validatePassword(password, 8));
  confirm?.addEventListener('blur', () => validateConfirm(password, confirm));
  [name, email, phone, password, confirm].forEach(input => {
    input?.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        if (input === email) validateEmail(input);
        else if (input === phone) validatePhone(input);
        else if (input === password) validatePassword(input, 8);
        else if (input === confirm) validateConfirm(password, confirm);
        else validateRequired(input, 'Full name');
      }
    });
  });
  password?.addEventListener('input', () => {
    if (confirm?.value && confirm.classList.contains('success')) validateConfirm(password, confirm);
  });
  terms?.addEventListener('change', () => validateTerms(terms));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const results = [
      validateRequired(name, 'Full name'),
      validateEmail(email),
      validatePhone(phone),
      validatePassword(password, 8),
      validateConfirm(password, confirm),
      validateTerms(terms),
    ];
    if (results.includes(false)) {
      showToast('Please fix the errors above.', 'error');
      form.querySelector('.error')?.focus();
      if (!form.querySelector('.error')) terms?.focus();
      return;
    }

    setSubmitting(submitBtn, true);
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(submitBtn, false);

    showToast('Account created successfully. Please sign in.', 'success');
    form.reset();
    $$('.form-control', form).forEach(el => el.classList.remove('success', 'error'));
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
  });
}

/* ─────────────────────────────────────────────
   ENTRY: auto-init on any page
───────────────────────────────────────────── */
export function initAuth() {
  initProfileDropdown();
  initPasswordToggles(document);
  const loginForm = $('#loginForm');
  if (loginForm) initLoginForm(loginForm);
  const signupForm = $('#signupForm');
  if (signupForm) initSignupForm(signupForm);
}
