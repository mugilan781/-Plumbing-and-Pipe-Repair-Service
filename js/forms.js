/**
 * forms.js — Form Validation & Submission
 */
import { $$, showToast } from './utils.js';

const RULES = {
  required:   v => v.trim().length > 0,
  email:      v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone:      v => /^[\d\s\+\-\(\)]{7,20}$/.test(v),
  minLength:  (v, n) => v.trim().length >= n,
  maxLength:  (v, n) => v.trim().length <= n,
};

const MESSAGES = {
  required:  'This field is required.',
  email:     'Please enter a valid email address.',
  phone:     'Please enter a valid phone number.',
  minLength: n => `Minimum ${n} characters required.`,
  maxLength: n => `Maximum ${n} characters allowed.`,
};

function validateField(input) {
  const rules    = (input.dataset.validate || '').split(' ').filter(Boolean);
  const errEl    = input.closest('.form-group')?.querySelector('.form-error');
  let   valid    = true;
  let   message  = '';

  for (const rule of rules) {
    const [name, arg] = rule.split(':');
    const fn = RULES[name];
    if (!fn) continue;

    const passes = arg ? fn(input.value, arg) : fn(input.value);
    if (!passes) {
      valid   = false;
      message = typeof MESSAGES[name] === 'function' ? MESSAGES[name](arg) : MESSAGES[name];
      break;
    }
  }

  input.classList.toggle('error',   !valid);
  input.classList.toggle('success',  valid && rules.length > 0);

  if (errEl) {
    errEl.textContent = message;
    errEl.classList.toggle('visible', !valid);
  }

  return valid;
}

function validateForm(form) {
  const inputs = $$('[data-validate]', form);
  return inputs.map(validateField).every(Boolean);
}

export function initForms() {
  // Real-time validation on blur
  document.addEventListener('blur', e => {
    if (e.target.dataset.validate) validateField(e.target);
  }, true);

  // Re-validate on input (after first blur)
  document.addEventListener('input', e => {
    if (e.target.classList.contains('error') || e.target.classList.contains('success')) {
      validateField(e.target);
    }
  });

  // Form submission
  $$('form[data-form]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(form)) {
        showToast('Please fix the errors above.', 'error');
        // Focus first error
        form.querySelector('.error')?.focus();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const original  = submitBtn?.innerHTML;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Sending…';
      }

      // Simulate async submission
      await new Promise(r => setTimeout(r, 1800));

      if (submitBtn) {
        submitBtn.disabled  = false;
        submitBtn.innerHTML = original;
      }

      showToast(form.dataset.successMsg || 'Message sent successfully! We\'ll contact you shortly.', 'success');
      form.reset();
      $$('.form-control', form).forEach(el => {
        el.classList.remove('success', 'error');
      });
    });
  });
}

/* Spinner style injected once */
const spinnerCSS = `
.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;
const styleEl = document.createElement('style');
styleEl.textContent = spinnerCSS;
document.head.append(styleEl);
